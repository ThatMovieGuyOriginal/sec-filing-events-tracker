// src/pages/api/__tests__/events.test.ts
import { createMocks } from 'node-mocks-http';
import handleUpcomingEvents from '../events/upcoming';
import { withAuth } from '../../../lib/middleware/auth';
import { eventDatabase } from '../../../lib/database';

// Mock dependencies
jest.mock('../../../lib/middleware/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

jest.mock('../../../lib/database', () => ({
  eventDatabase: {
    getUpcomingEvents: jest.fn(),
  },
}));

describe('API: /api/events/upcoming', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return upcoming events', async () => {
    // Setup
    const mockEvents = [
      { id: 'event1', type: 'nameChange' },
      { id: 'event2', type: 'tickerChange' },
    ];
    (eventDatabase.getUpcomingEvents as jest.Mock).mockResolvedValue(mockEvents);
    
    const { req, res } = createMocks({
      method: 'GET',
      query: { limit: '10' },
    });
    
    // Execute
    await handleUpcomingEvents(req, res);
    
    // Verify
    expect(eventDatabase.getUpcomingEvents).toHaveBeenCalledWith(10);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockEvents);
  });

  it('should handle errors properly', async () => {
    // Setup
    (eventDatabase.getUpcomingEvents as jest.Mock).mockRejectedValue(new Error('Database error'));
    
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    // Execute
    await handleUpcomingEvents(req, res);
    
    // Verify
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toHaveProperty('message', 'Internal server error');
  });

  it('should handle method not allowed', async () => {
    // Setup
    const { req, res } = createMocks({
      method: 'POST',
    });
    
    // Execute
    await handleUpcomingEvents(req, res);
    
    // Verify
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toHaveProperty('message', 'Method not allowed');
  });
});
