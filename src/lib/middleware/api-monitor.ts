// src/lib/middleware/api-monitor.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../database';
import logger from '../utils/logger';

// Rate limit configuration per tier
const RATE_LIMITS = {
  'free': { window: 60 * 1000, max: 60 }, // 60 requests per minute
  'basic': { window: 60 * 1000, max: 120 }, // 120 requests per minute
  'pro': { window: 60 * 1000, max: 300 }, // 300 requests per minute
  'enterprise': { window: 60 * 1000, max: 1000 }, // 1000 requests per minute
};

// In-memory store for rate limiting
// In production, consider using Redis or similar for distributed environments
const rateLimitStore = new Map();

/**
 * Clean up expired rate limit entries
 */
const cleanupRateLimits = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > data.window) {
      rateLimitStore.delete(key);
    }
  }
};

// Run cleanup periodically
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 60000);
}

/**
 * API monitoring middleware
 * Tracks API usage and implements tiered rate limiting
 */
export function withApiMonitoring(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    
    // Add a response listener to track completed requests
    const originalEnd = res.end;
    
    // Fix for TypeScript overloaded function issue
    res.end = function(this: any, chunk?: any, encoding?: BufferEncoding, cb?: () => void) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log API request details
      logger.info(`API ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      
      // Track usage in database (async, don't await)
      try {
        const userId = (req as any).user?.id;
        if (userId) {
          prisma.apiUsage.create({
            data: {
              userId,
              endpoint: req.url || 'unknown',
              method: req.method || 'GET',
              statusCode: res.statusCode,
              duration,
              timestamp: new Date(),
            },
          }).catch(error => {
            logger.error('Failed to log API usage:', error);
          });
        }
      } catch (error) {
        logger.error('Error in API monitoring:', error);
      }
      
      // Call the original end method with the correct context and arguments
      return originalEnd.apply(this, arguments as any);
    };
    
    // Apply rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = (req as any).user?.id;
    const userTier = (req as any).user?.subscriptionTier || 'free';
    const rateLimit = RATE_LIMITS[userTier] || RATE_LIMITS.free;
    
    // Create a unique key for this user/IP
    const key = userId ? `user-${userId}` : `ip-${ip}`;
    
    const now = Date.now();
    const rateLimitData = rateLimitStore.get(key);
    
    if (rateLimitData) {
      // Check if window has expired
      if (now - rateLimitData.windowStart > rateLimit.window) {
        // Reset window
        rateLimitStore.set(key, {
          windowStart: now,
          requestCount: 1,
          window: rateLimit.window,
        });
      } else if (rateLimitData.requestCount >= rateLimit.max) {
        // Rate limit exceeded
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.window - (now - rateLimitData.windowStart)) / 1000)
        });
      } else {
        // Increment request count
        rateLimitStore.set(key, {
          ...rateLimitData,
          requestCount: rateLimitData.requestCount + 1,
        });
      }
    } else {
      // First request in this window
      rateLimitStore.set(key, {
        windowStart: now,
        requestCount: 1,
        window: rateLimit.window,
      });
    }
    
    // Set rate limit headers
    const currentLimit = rateLimitStore.get(key);
    res.setHeader('X-RateLimit-Limit', rateLimit.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit.max - currentLimit.requestCount));
    res.setHeader('X-RateLimit-Reset', Math.ceil((currentLimit.windowStart + rateLimit.window) / 1000));
    
    // Continue to handler
    return handler(req, res);
  };
}

// Export a combined middleware function with auth and monitoring
export function withApiAccess(handler: Function, options = { requireAuth: true }) {
  const { withAuth } = require('./auth');
  return withAuth(withApiMonitoring(handler), options);
}
