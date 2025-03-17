// src/pages/api/events/type/[type].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { eventDatabase } from '../../../../lib/database';
import { withAuth } from '../../../../lib/middleware/auth';

/**
 * API endpoint for fetching events by type
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type } = req.query;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  if (!type || Array.isArray(type)) {
    return res.status(400).json({ message: 'Invalid event type' });
  }

  try {
    const events = await eventDatabase.getEventsByType(type, limit, offset);
    return res.status(200).json(events);
  } catch (error) {
    console.error(`Error fetching events of type ${type}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
