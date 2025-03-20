// src/lib/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../database';
import { verify, JwtPayload } from 'jsonwebtoken';
import { csrf } from '../utils/csrf';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Rate limiting configuration
const RATE_LIMIT = {
  window: 60 * 1000, // 1 minute
  max: 60 // 60 requests per minute
};

const rateLimit = new Map();

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  options = { requireAuth: true }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const key = `${ip}-${req.url}`;
    
    if (rateLimit.has(key)) {
      const windowStart = rateLimit.get(key).windowStart;
      const requestCount = rateLimit.get(key).requestCount;
      
      if (now - windowStart < RATE_LIMIT.window) {
        if (requestCount >= RATE_LIMIT.max) {
          return res.status(429).json({ 
            error: 'Too many requests',
            retryAfter: Math.ceil((RATE_LIMIT.window - (now - windowStart)) / 1000)
          });
        }
        
        rateLimit.set(key, {
          windowStart,
          requestCount: requestCount + 1
        });
      } else {
        rateLimit.set(key, {
          windowStart: now,
          requestCount: 1
        });
      }
    } else {
      rateLimit.set(key, {
        windowStart: now,
        requestCount: 1
      });
    }
    
    // Verify CSRF token for non-GET requests
    if (req.method !== 'GET' && !await csrf.verify(req)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    // Skip auth for development mode if explicitly allowed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true' && !options.requireAuth) {
      (req as AuthenticatedRequest).user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin'
      };
      return handler(req as AuthenticatedRequest, res);
    }

    try {
      // Get auth token from cookies or headers
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        if (options.requireAuth) {
          return res.status(401).json({ message: 'Authentication required' });
        } else {
          // Public route, continue without user context
          return handler(req as AuthenticatedRequest, res);
        }
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      try {
        // Verify token and handle type safety properly
        const decoded = verify(token, jwtSecret) as JwtPayload;
        
        // Check if the decoded token has the expected id field
        if (!decoded || typeof decoded.id !== 'string') {
          throw new Error('Invalid token payload');
        }
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true },
        });

        if (!user) {
          if (options.requireAuth) {
            return res.status(401).json({ message: 'User not found' });
          } else {
            return handler(req as AuthenticatedRequest, res);
          }
        }

        // Add user to request
        (req as AuthenticatedRequest).user = user;
        
        // Continue to handler
        return handler(req as AuthenticatedRequest, res);
      } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
          if (options.requireAuth) {
            return res.status(401).json({ message: 'Invalid token' });
          } else {
            return handler(req as AuthenticatedRequest, res);
          }
        } else if (error.name === 'TokenExpiredError') {
          if (options.requireAuth) {
            return res.status(401).json({ message: 'Token expired' });
          } else {
            return handler(req as AuthenticatedRequest, res);
          }
        }
        throw error;
      }
    } catch (error: any) {
      logger.error('Authentication error:', error);
      if (options.requireAuth) {
        return res.status(401).json({ message: 'Authentication failed' });
      } else {
        return handler(req as AuthenticatedRequest, res);
      }
    }
  };
}
