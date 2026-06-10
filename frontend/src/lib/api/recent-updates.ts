import { api } from './client';
import type { RecentUpdate } from './types';

export function fetchRecentUpdates(): Promise<RecentUpdate[]> {
  return api.get<RecentUpdate[]>('/api/v1/recent-updates');
}
