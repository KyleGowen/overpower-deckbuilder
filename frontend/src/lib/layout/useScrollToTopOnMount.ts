import { useEffect } from 'react';

/** Resets document scroll when a route-level page mounts (e.g. Home "View All" destinations). */
export function useScrollToTopOnMount(): void {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);
}
