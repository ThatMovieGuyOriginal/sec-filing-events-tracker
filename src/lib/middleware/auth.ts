// src/lib/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../database';
import { verify } from 'jsonwebtoken';
import logger from '../utils/logger';

/**
 * Extended request with user information
 */
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware for authenticating API requests
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip auth for development mode
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
      (req as AuthenticatedRequest).user = {
        id: 'dev-user-id',
        email: 'dev@example.com',
      };
      return handler(req as AuthenticatedRequest, res);
    }

    try {
      // Get auth token from cookies or headers
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not set');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      try {
        // Verify token
        const decoded = verify(token, jwtSecret) as { id: string };
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true },
        });

        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }

        // Add user to request
        (req as AuthenticatedRequest).user = user;
        
        // Continue to handler
        return handler(req as AuthenticatedRequest, res);
      } catch (error) {
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Authentication error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
}
