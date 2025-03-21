// src/lib/middleware/api-monitor.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../database';
import logger from '../utils/logger';

// Rate limit configuration per tier
const RATE_LIMITS: Record<string, { window: number; max: number }> = {
  'free': { window: 60 * 1000, max: 60 }, // 60 requests per minute
  'basic': { window: 60 * 1000, max: 120 }, // 120 requests per minute
  'pro': { window: 60 * 1000, max: 300 }, // 300 requests per minute
  'enterprise': { window: 60 * 1000, max: 1000 }, // 1000 requests per minute
};

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { windowStart: number; requestCount: number; window: number }>();

/**
 * Clean up expired rate limit entries
 */
const cleanupRateLimits = (): void => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > data.window) {
      rateLimitStore.delete(key);
    }
  }
};

// Run cleanup periodically - only in environments with setInterval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 60000);
}

// Interface for authenticated requests
interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    subscriptionTier?: string;
  };
}

// Types for handlers
type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Log API request/response details
 */
const logApiUsage = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  startTime: number
): void => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Log API request details
  logger.info(`API ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  
  // Track usage in database (only if user is authenticated)
  const userId = req.user?.id;
  if (userId) {
    try {
      prisma.apiUsage.create({
        data: {
          userId,
          endpoint: req.url || 'unknown',
          method: req.method || 'GET',
          statusCode: res.statusCode,
          duration,
          timestamp: new Date(),
        },
      }).catch((error: unknown) => {
        logger.error('Failed to log API usage:', error);
      });
    } catch (error: unknown) {
      logger.error('Error in API monitoring:', error);
    }
  }
};

/**
 * API monitoring middleware
 * Tracks API usage and implements tiered rate limiting
 */
export function withApiMonitoring(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    
    // Original methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalStatus = res.status;
    const originalEnd = res.end;
    
    // Override status to track the final status code
    res.status = function(statusCode: number): NextApiResponse {
      return originalStatus.call(this, statusCode);
    };
    
    // Override json method
    res.json = function(body: any): NextApiResponse {
      logApiUsage(req, res, startTime);
      return originalJson.call(this, body);
    };
    
    // Override send method
    res.send = function(body: any): NextApiResponse {
      logApiUsage(req, res, startTime);
      return originalSend.call(this, body);
    };
    
    // Apply rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userId = req.user?.id;
    const userTier = req.user?.subscriptionTier || 'free';
    const rateLimit = RATE_LIMITS[userTier] || RATE_LIMITS.free;
    
    // Create a unique key for this user/IP
    const key = userId ? `user-${userId}` : `ip-${String(ip)}`;
    
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
    if (currentLimit) {
      res.setHeader('X-RateLimit-Limit', rateLimit.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit.max - currentLimit.requestCount));
      res.setHeader('X-RateLimit-Reset', Math.ceil((currentLimit.windowStart + rateLimit.window) / 1000));
    }
    
    // Continue to handler
    return handler(req, res);
  };
}

/**
 * Export a combined middleware function with auth and monitoring
 */
export function withApiAccess(handler: ApiHandler, options = { requireAuth: true }): ApiHandler {
  const { withAuth } = require('./auth');
  return withAuth(withApiMonitoring(handler), options);
}
