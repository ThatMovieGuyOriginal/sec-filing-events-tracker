// src/pages/api/alerts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/database';
import { withAuth } from '../../../lib/middleware/auth';

/**
 * API endpoint for managing alerts
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.user?.id;

  switch (req.method) {
    case 'GET':
      return await getUserAlerts(req, res, userId);
    case 'POST':
      return await createAlert(req, res, userId);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Get alerts for the current user
 */
async function getUserAlerts(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId },
    });

    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Create a new alert
 */
async function createAlert(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { eventType, cik, ticker } = req.body;

  if (!eventType && !cik && !ticker) {
    return res.status(400).json({ message: 'At least one filter criteria is required' });
  }

  try {
    const alert = await prisma.alert.create({
      data: {
        userId,
        eventType,
        cik,
        ticker,
        active: true,
      },
    });

    return res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
