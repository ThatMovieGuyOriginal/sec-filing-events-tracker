// src/pages/api/events/date-range.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { eventDatabase } from '../../../lib/database';
import { withAuth } from '../../../lib/middleware/auth';

/**
 * API endpoint for fetching events by date range
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { startDate, endDate } = req.query;

  if (!startDate || !endDate || Array.isArray(startDate) || Array.isArray(endDate)) {
    return res.status(400).json({ message: 'Invalid date range parameters' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const events = await eventDatabase.getEventsByDateRange(start, end);
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events by date range:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
