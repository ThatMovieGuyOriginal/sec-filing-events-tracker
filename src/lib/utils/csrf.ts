// src/lib/utils/csrf.ts
import { NextApiRequest } from 'next';
import crypto from 'crypto';

export const csrf = {
  // Generate a CSRF token
  generate: async (): Promise<string> => {
    return crypto.randomBytes(32).toString('hex');
  },
  
  // Verify a CSRF token from request
  verify: async (req: NextApiRequest): Promise<boolean> => {
    const token = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];
    
    if (!token || !headerToken || token !== headerToken) {
      return false;
    }
    
    return true;
  }
};
