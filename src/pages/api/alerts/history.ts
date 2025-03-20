// src/pages/api/alerts/history.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/database';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Fetch alert history from the database
    // Note: You would need a proper table/model for this
    // This is a simplified example
    const history = await prisma.alertHistory.findMany({
      where: { userId },
      orderBy: { triggeredAt: 'desc' },
      take: 10, // Limit to 10 most recent
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching alert history:', error);
    // Return empty array instead of error for this secondary information
    return res.status(200).json([]); 
  }
}

export default withAuth(handler);
