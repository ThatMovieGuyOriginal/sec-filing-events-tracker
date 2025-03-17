// src/pages/api/companies/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/database';
import { withAuth } from '../../../lib/middleware/auth';

/**
 * API endpoint for searching companies by name or ticker
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query || Array.isArray(query)) {
    return res.status(400).json({ message: 'Invalid search query' });
  }

  try {
    // Search for companies by name or ticker
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tickers: { has: query.toUpperCase() } },
        ],
      },
      take: 10,
    });

    return res.status(200).json(companies.map(company => ({
      cik: company.cik,
      name: company.name,
      ticker: company.tickers[0],
    })));
  } catch (error) {
    console.error('Error searching companies:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);
