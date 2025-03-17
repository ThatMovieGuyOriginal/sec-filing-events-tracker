// src/pages/api/companies/[identifier]/events.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { eventDatabase } from '../../../../lib/database';
import { withAuth } from '../../../../lib/middleware/auth';

/**
 * API endpoint for fetching events for a specific company
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { identifier } = req.query;

  if (!identifier || Array.isArray(identifier)) {
    return res.status(400).json({ message: 'Invalid company identifier' });
  }

  try {
    const events = await eventDatabase.getCompanyEvents(identifier);
    return res.status(200).json(events);
  } catch (error) {
    console.error(`Error fetching events for company ${identifier}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
