// src/lib/hooks/useWatchlists.ts
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useWatchlists() {
  const { data, error, mutate } = useSWR('/api/watchlists', fetcher);
  
  return {
    watchlists: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
