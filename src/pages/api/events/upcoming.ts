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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const events = await eventDatabase.getUpcomingEvents(limit);
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
