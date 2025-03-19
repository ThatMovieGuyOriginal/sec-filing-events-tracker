// src/pages/api/events/upcoming.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { eventDatabase } from '../../../lib/database';
import { withAuth } from '../../../lib/middleware/auth';

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
    const offset = (page - 1) * limit;
    
    // Modified to support pagination
    const events = await eventDatabase.getUpcomingEvents(limit, offset);
    const total = await eventDatabase.getUpcomingEventsCount();
    
    return res.status(200).json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
