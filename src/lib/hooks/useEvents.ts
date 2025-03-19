// src/lib/hooks/useEvents.ts
import useSWR, { SWRConfiguration } from 'swr';
import axios from 'axios';
import { EventData } from '../events/event-extractor';

const fetcher = async (url: string): Promise<EventData[]> => {
  const response = await axios.get(url);
  return response.data;
};

// Common SWR configuration for API calls
const defaultConfig: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 60000, // 1 minute
};

/**
 * Hook for fetching upcoming events with SWR
 */
export function useUpcomingEvents(limit: number = 50, refreshInterval: number = 300000) {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    `/api/events/upcoming?limit=${limit}`, 
    fetcher,
    {
      ...defaultConfig,
      refreshInterval, // refresh every 5 minutes by default
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
    defaultConfig
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
export function useEventsByType(type: string, limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    type ? `/api/events/type/${type}?limit=${limit}` : null,
    fetcher,
    defaultConfig
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Prefetch data to populate cache
 * @param urls Array of URLs to prefetch
 */
export async function prefetchData(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await fetcher(url);
      } catch (error) {
        console.error(`Failed to prefetch ${url}:`, error);
      }
    })
  );
}
