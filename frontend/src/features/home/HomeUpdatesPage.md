# Recent Updates list (`/home/updates`)

Full paginated list of hand-maintained feature/update cards. Reachable only via **View All** on the Home Recent Updates rail (no global nav link).

## Data
- Same source as Home: `GET /api/v1/recent-updates` via `useRecentUpdates()` (`['recent-updates']` query key).
- Sorted by `updatedAt` descending (server-side).
- The Skybound launch and alternate-art reveal remain separate historical entries; the reveal uses
  collector `#420` Omni-Man and points users to the database's **Hide Alts** control.

## Layout
- Vertical stacked accordion tiles (`RecentUpdatesList` with `layout="stacked"`).
- Reuses `RecentUpdateTile` from the Home rail.
- **10 updates per page**; shared `Pagination` component when total exceeds page size.
- Page change scrolls to top (`window.scrollTo({ top: 0 })`).
- Initial entry from Home **View All** scrolls to top on mount (`useScrollToTopOnMount`).

## Files
- [`HomeUpdatesPage.tsx`](./HomeUpdatesPage.tsx) — page shell
- [`HomeUpdatesPage.css`](./HomeUpdatesPage.css) — page spacing
- [`RecentUpdateTile.tsx`](./RecentUpdateTile.tsx), [`RecentUpdatesList.tsx`](./RecentUpdatesList.tsx), [`recentUpdates.css`](./recentUpdates.css)
