// src/pages/api/events/upcoming.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { eventDatabase } from '../../../lib/database';
import { withAuth } from '../../../lib/middleware/auth';
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

/**
 * API endpoint for fetching upcoming events
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Calculate offset based on page and limit
    const offset = (page - 1) * limit;
    
    // Get events with pagination
    const events = await eventDatabase.getUpcomingEvents(limit, offset);
    const total = await eventDatabase.getUpcomingEventsCount();
    
    return res.status(200).json({
      events: events, // Fixed: Use the events variable directly
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error fetching upcoming events: ${errorMessage}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default allowCors(withAuth(handler));
