// src/pages/api/watchlists/[id]/companies.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/database';
import { withAuth } from '../../../../lib/middleware/auth';

/**
 * API endpoint for managing companies in a watchlist
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = req.user?.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid watchlist ID' });
  }

  // Check if watchlist exists and belongs to the user
  const watchlist = await prisma.watchlist.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist not found' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return await addCompanyToWatchlist(req, res, id);
    case 'DELETE':
      return await removeCompanyFromWatchlist(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Add a company to watchlist
 */
async function addCompanyToWatchlist(req: NextApiRequest, res: NextApiResponse, watchlistId: string) {
  const { cik } = req.body;

  if (!cik) {
    return res.status(400).json({ message: 'Company CIK is required' });
  }

  try {
    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { cik },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Add company to watchlist
    await prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        companies: {
          connect: { cik },
        },
      },
    });

    return res.status(200).json({ message: 'Company added to watchlist' });
  } catch (error) {
    console.error('Error adding company to watchlist:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Remove a company from watchlist
 */
async function removeCompanyFromWatchlist(req: NextApiRequest, res: NextApiResponse, watchlistId: string) {
  const { cik } = req.body;

  if (!cik) {
    return res.status(400).json({ message: 'Company CIK is required' });
  }

  try {
    // Remove company from watchlist
    await prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        companies: {
          disconnect: { cik },
        },
      },
    });

    return res.status(200).json({ message: 'Company removed from watchlist' });
  } catch (error) {
    console.error('Error removing company from watchlist:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
