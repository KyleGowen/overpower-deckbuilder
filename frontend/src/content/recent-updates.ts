/**
 * Static "Recent Updates" / news content shown on the Home screen.
 *
 * This is intentionally a hand-maintained list (no backend/CMS endpoint yet).
 * To add news, append entries here and rebuild the frontend. When a real news
 * source exists, replace `RECENT_UPDATES` with an API-backed query and keep the
 * same `NewsItem` shape so the Home UI is unchanged.
 *
 * `imagePath` uses real repo card art (under src/resources/cards/images/...);
 * never invent art. Leave it undefined to render an icon placeholder.
 */
export type NewsTag = 'NEW CARDS' | 'FEATURE' | 'EVENT' | 'UPDATE';

export interface NewsItem {
  id: string;
  tag: NewsTag;
  title: string;
  summary: string;
  date: string; // ISO date
  imagePath?: string;
}

export const RECENT_UPDATES: NewsItem[] = [
  {
    id: 'frontend-v2',
    tag: 'UPDATE',
    title: 'A fresh new Excelsior',
    summary: 'The site has been rebuilt from the ground up with a faster, cleaner desktop and mobile experience.',
    date: '2026-06-09',
    imagePath: 'characters/carson_of_venus.webp',
  },
  {
    id: 'database-pagination',
    tag: 'FEATURE',
    title: 'Browse the full card database',
    summary: 'Search, filter and page through every modern OverPower card, with a detail view for every card type.',
    date: '2026-06-09',
    imagePath: 'characters/anubis.webp',
  },
  {
    id: 'collection-tracking',
    tag: 'FEATURE',
    title: 'Track your collection',
    summary: 'Record how many of each card you own and keep your inventory in sync across the app.',
    date: '2026-06-09',
    imagePath: 'characters/captain_nemo.webp',
  },
];
