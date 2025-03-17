// src/lib/middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../database';
import { verify } from 'jsonwebtoken';

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

      // Verify token
      const decoded = verify(token, process.env.JWT_SECRET!) as { id: string };
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
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
}
