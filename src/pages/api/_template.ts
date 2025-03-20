// Template for API routes to ensure proper error handling and CORS

// Example implementation for an API route:

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../lib/middleware/auth';
import logger from '../../lib/utils/logger';

// Define a type for API handlers
type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// CORS headers middleware
const allowCors = (handler: ApiHandler): ApiHandler => async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Call the original handler
  return handler(req, res);
};

// Main handler with error handling
async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  try {
    // Route-specific logic here
    // For example:
    if (req.method === 'GET') {
      // Handle GET
      res.status(200).json({ /* your data */ });
      return;
    } else if (req.method === 'POST') {
      // Handle POST
      res.status(201).json({ /* created resource */ });
      return;
    } else {
      res.status(405).json({ message: 'Method not allowed' });
      return;
    }
  } catch (error: any) {
    // Log the error
    logger.error(`API error in [handler]: ${error.message}`, error);
    
    // Determine appropriate status code
    const statusCode = error.statusCode || 500;
    
    // Return error response
    res.status(statusCode).json({ 
      message: statusCode === 500 ? 'Internal server error' : error.message
    });
    return;
  }
}

// Apply middleware
export default allowCors(withAuth(handler));
