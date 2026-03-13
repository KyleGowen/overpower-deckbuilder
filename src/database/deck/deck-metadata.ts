import { UIPreferences } from '../../types';
import type { DeckRepositoryContext } from './context';

export async function updateUIPreferences(
  ctx: DeckRepositoryContext,
  deckId: string,
  preferences: UIPreferences
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'UPDATE decks SET ui_preferences = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(preferences), deckId]
    );
    const updated = (result.rowCount || 0) > 0;
    if (updated) {
      await ctx.invalidateDeck(deckId);
    }
    return updated;
  } finally {
    client.release();
  }
}

export async function getUIPreferences(
  ctx: DeckRepositoryContext,
  deckId: string
): Promise<UIPreferences | undefined> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'SELECT ui_preferences FROM decks WHERE id = $1',
      [deckId]
    );
    if (result.rows.length === 0 || !result.rows[0].ui_preferences) {
      return undefined;
    }
    return result.rows[0].ui_preferences;
  } finally {
    client.release();
  }
}

export async function getDeckStats(ctx: DeckRepositoryContext): Promise<{ decks: number }> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM decks');
    return {
      decks: parseInt(result.rows[0].count, 10),
    };
  } finally {
    client.release();
  }
}

export async function userOwnsDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  userId: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'SELECT user_id FROM decks WHERE id = $1',
      [deckId]
    );
    if (result.rows.length === 0) {
      return false;
    }
    return result.rows[0].user_id === userId;
  } finally {
    client.release();
  }
}
