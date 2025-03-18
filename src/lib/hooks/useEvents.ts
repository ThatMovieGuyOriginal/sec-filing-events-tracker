// src/lib/hooks/useEvents.ts
import useSWR from 'swr';
import axios from 'axios';
import { EventData } from '../events/event-extractor';

const fetcher = async (url: string): Promise<EventData[]> => {
  const response = await axios.get(url);
  return response.data;
};

/**
 * Hook for fetching upcoming events with SWR
 */
export function useUpcomingEvents() {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    '/api/events/upcoming', 
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // refresh every 5 minutes
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook for fetching company events with SWR
 */
export function useCompanyEvents(identifier: string) {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    identifier ? `/api/companies/${identifier}/events` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook for fetching events by type with SWR
 */
export function useEventsByType(type: string) {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    type ? `/api/events/type/${type}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook for fetching events by date range with SWR
 */
export function useEventsByDateRange(startDate: string, endDate: string) {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    startDate && endDate ? `/api/events/date-range?startDate=${startDate}&endDate=${endDate}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
