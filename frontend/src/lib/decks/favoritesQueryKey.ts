/** Canonical React Query key for the current user's favorite decks list. */
export function favoritesQueryKey(userId: string | undefined | null) {
  return ['decks', 'favorites', userId ?? ''] as const;
}
