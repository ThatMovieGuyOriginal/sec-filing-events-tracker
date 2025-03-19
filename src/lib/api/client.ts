// src/lib/api/client.ts
import axios from 'axios';
import { EventData } from '../events/event-extractor';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Search for a company by ticker or CIK
 */
export const searchCompany = async (identifier: string): Promise<EventData[]> => {
  try {
    const response = await api.get(`/companies/${identifier}/events`);
    return response.data;
  } catch (error) {
    console.error(`Error searching company with identifier: ${identifier}`, error);
    return [];
  }
};

/**
 * Search for companies by name or ticker
 */
export const searchCompanyByName = async (query: string): Promise<any[]> => {
  try {
    const response = await api.get('/companies/search', {
      params: { query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching companies by name:', error);
    return [];
  }
};

/**
 * Get events by type
 */
export const getEventsByType = async (type: string): Promise<EventData[]> => {
  try {
    const response = await api.get(`/events/type/${type}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching events of type ${type}:`, error);
    return [];
  }
};

/**
 * Get events by date range
 */
export const getEventsByDateRange = async (startDate: string, endDate: string): Promise<EventData[]> => {
  try {
    const response = await api.get('/events/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching events between ${startDate} and ${endDate}:`, error);
    return [];
  }
};

/**
 * Fetch upcoming events with pagination parameters
 */
export const fetchUpcomingEvents = async (page = 1, limit = 20): Promise<EventData[]> => {
  try {
    const response = await api.get('/events/upcoming', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

export default api;
