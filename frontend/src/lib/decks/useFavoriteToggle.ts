import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { addFavorite, removeFavorite } from '../api/favorites';

export interface FavoriteToggleVars {
  deckId: string;
  /** Desired state after the toggle. */
  next: boolean;
}

/**
 * Add/remove a deck favorite. Always invalidates the favorites list; pass extra
 * `invalidateKeys` (e.g. the current community/profile list query key) to refetch
 * those too. Pages that want instant feedback should also optimistically patch
 * their own query via `setQueryData` before/after calling `mutate`.
 */
export function useFavoriteToggle(invalidateKeys: QueryKey[] = []) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deckId, next }: FavoriteToggleVars) =>
      next ? addFavorite(deckId) : removeFavorite(deckId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks', 'favorites'] });
      for (const key of invalidateKeys) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
