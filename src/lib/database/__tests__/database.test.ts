// src/lib/database/__tests__/database.test.ts
import { eventDatabase } from '../index';
import { prisma } from '../prisma';
import { cache } from '../../utils/cache';

// Mock dependencies
jest.mock('../prisma', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../utils/cache', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('EventDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('should return cached events if available', async () => {
      // Setup
      const mockEvents = [{ id: 'event1' }, { id: 'event2' }];
      (cache.get as jest.Mock).mockResolvedValue(JSON.stringify(mockEvents));
      
      // Execute
      const result = await eventDatabase.getUpcomingEvents();
      
      // Verify
      expect(cache.get).toHaveBeenCalledWith('upcoming_events_50');
      expect(prisma.event.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
    });

    it('should fetch from database and cache if not in cache', async () => {
      // Setup
      const mockEvents = [{ id: 'event1' }, { id: 'event2' }];
      (cache.get as jest.Mock).mockResolvedValue(null);
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
      
      // Execute
      const result = await eventDatabase.getUpcomingEvents();
      
      // Verify
      expect(cache.get).toHaveBeenCalledWith('upcoming_events_50');
      expect(prisma.event.findMany).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(
        'upcoming_events_50',
        JSON.stringify(mockEvents),
        300
      );
      expect(result).toEqual(mockEvents);
    });
  });

  // Additional tests for other methods...
});
