import { useQuery } from '@tanstack/react-query';
import { fetchRecentUpdates } from '../../lib/api/recent-updates';

export const RECENT_UPDATES_QUERY_KEY = ['recent-updates'] as const;

export function useRecentUpdates() {
  return useQuery({
    queryKey: RECENT_UPDATES_QUERY_KEY,
    queryFn: () => fetchRecentUpdates(),
    staleTime: 10 * 60 * 1000,
  });
}
