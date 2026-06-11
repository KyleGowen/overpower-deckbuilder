import { Pool } from 'pg';
import { Deck } from '../../types';

export type DeckCacheEntry = { deck: Deck | Deck[]; timestamp: number };
export type DeckCache = Map<string, DeckCacheEntry>;

export function invalidateUserDeckListCache(cache: DeckCache, userId: string): void {
  cache.delete(`user_decks_${userId}`);
  cache.delete(`user_decks_${userId}_created_at`);
  cache.delete(`user_decks_${userId}_updated_at`);
}

export interface DeckRepositoryContext {
  pool: Pool;
  cache: DeckCache;
  cacheTtlMs: number;
  /**
   * Invalidates cache for the given deck and for the deck list of the deck's owner.
   * Looks up user_id from decks table, then deletes cache entries for deckId and user_decks_${userId}.
   */
  invalidateDeck(deckId: string): Promise<void>;
}

export function createDeckRepositoryContext(
  pool: Pool,
  cache: DeckCache,
  cacheTtlMs: number
): DeckRepositoryContext {
  return {
    pool,
    cache,
    cacheTtlMs,
    async invalidateDeck(deckId: string): Promise<void> {
      cache.delete(deckId);
      const client = await pool.connect();
      try {
        const userResult = await client.query('SELECT user_id FROM decks WHERE id = $1', [deckId]);
        const userId = userResult.rows[0]?.user_id;
        if (userId) {
          invalidateUserDeckListCache(cache, userId);
        }
      } finally {
        client.release();
      }
    },
  };
}
