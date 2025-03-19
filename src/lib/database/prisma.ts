// src/lib/database/prisma.ts
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Augment the global object to include a prisma property
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Log any database errors
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    logger.error(`Database error in ${params.model}.${params.action}:`, error);
    throw error;
  }
});

export default prisma;
