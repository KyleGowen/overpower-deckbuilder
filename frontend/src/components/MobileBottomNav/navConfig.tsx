import type { ReactNode } from 'react';
import {
  IconHome,
  IconDatabase,
  IconDecks,
  IconCollection,
} from '../icons';

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
  to: (userId: string) => string;
  match: (pathname: string, userId: string) => boolean;
}

/** Mobile bottom nav: Home centered (3rd of 5 slots). Desktop top nav keeps NAV_ITEMS order. */
export const MOBILE_NAV_ORDER = ['database', 'decks', 'home', 'collection'] as const;

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <IconHome />,
    to: () => '/home',
    match: (p) => p === '/home' || p === '/',
  },
  {
    key: 'database',
    label: 'Database',
    icon: <IconDatabase />,
    to: () => '/data',
    match: (p) => p.startsWith('/data'),
  },
  {
    key: 'decks',
    label: 'Decks',
    icon: <IconDecks />,
    to: (userId) => `/users/${userId}/decks`,
    match: (p) => /\/users\/[^/]+\/decks/.test(p),
  },
  {
    key: 'collection',
    label: 'Collection',
    icon: <IconCollection />,
    to: (userId) => `/users/${userId}/collection`,
    match: (p) => /\/users\/[^/]+\/collection/.test(p),
  },
];
