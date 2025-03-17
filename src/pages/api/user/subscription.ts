// src/pages/api/user/subscription.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../lib/middleware/auth';
import { prisma } from '../../../lib/database';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionEnd: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { startDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription has expired
    const now = new Date();
    if (user.subscriptionEnd && user.subscriptionEnd < now) {
      // Update user to free tier if subscription has expired
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'free',
          subscriptionEnd: null,
        },
      });
      user.subscriptionTier = 'free';
      user.subscriptionEnd = null;
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionEnd: user.subscriptionEnd,
      activeSubscription: user.subscriptions[0] || null,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
