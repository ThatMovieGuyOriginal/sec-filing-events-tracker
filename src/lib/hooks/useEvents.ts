// src/lib/hooks/useEvents.ts
import useSWR, { SWRConfiguration } from 'swr';
import axios from 'axios';
import { EventData } from '../events/event-extractor';

// Updated fetcher to return the proper structure matching our API response
const fetcher = async (url: string): Promise<{events: EventData[], pagination: any}> => {
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
export function useUpcomingEvents(page = 1, limit = 20, refreshInterval = 300000) {
  const { data, error, isLoading, mutate } = useSWR<{events: EventData[], pagination: any}>(
    `/api/events/upcoming?page=${page}&limit=${limit}`, 
    fetcher,
    { ...defaultConfig, refreshInterval }
  );

  return {
    events: data?.events || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

/**
 * Hook for fetching company events with SWR
 */
export function useCompanyEvents(identifier: string) {
  // Create a type-safe version of the fetcher for this specific endpoint
  const companyEventsFetcher = async (url: string): Promise<EventData[]> => {
    const response = await axios.get(url);
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    identifier ? `/api/companies/${identifier}/events` : null,
    companyEventsFetcher,
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
  // Create a type-safe version of the fetcher for this specific endpoint
  const eventsByTypeFetcher = async (url: string): Promise<EventData[]> => {
    const response = await axios.get(url);
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<EventData[]>(
    type ? `/api/events/type/${type}?limit=${limit}` : null,
    eventsByTypeFetcher,
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
