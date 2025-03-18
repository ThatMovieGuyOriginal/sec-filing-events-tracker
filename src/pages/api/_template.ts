// Template for API routes to ensure proper error handling and CORS

// Example implementation for an API route:

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware/auth';
import logger from '../../../lib/utils/logger';

// CORS headers middleware
const allowCors = (handler) => async (req: NextApiRequest, res: NextApiResponse) => {
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
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Route-specific logic here
    // For example:
    if (req.method === 'GET') {
      // Handle GET
      return res.status(200).json({ /* your data */ });
    } else if (req.method === 'POST') {
      // Handle POST
      return res.status(201).json({ /* created resource */ });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    // Log the error
    logger.error(`API error in [handler]: ${error.message}`, error);
    
    // Determine appropriate status code
    const statusCode = error.statusCode || 500;
    
    // Return error response
    return res.status(statusCode).json({ 
      message: statusCode === 500 ? 'Internal server error' : error.message
    });
  }
}

// Apply middleware
export default allowCors(withAuth(handler));
