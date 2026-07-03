import type { PoolClient } from 'pg';
import { UIPreferences } from '../../types';
import type { DeckRepositoryContext } from './context';

const UUID_CARD_ID_PATTERN =
  '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

/**
 * Recompute decks.character_1_id–character_4_id and location_id from deck_cards.
 * Called after bulk card replace so list API preview joins stay in sync with deck_cards.
 */
export async function refreshDeckPreviewMetadata(
  ctx: DeckRepositoryContext,
  deckId: string,
  existingClient?: PoolClient,
): Promise<void> {
  const run = async (client: PoolClient) => {
    await client.query(
      `
        UPDATE decks d
        SET
          character_1_id = refs.char1_id::UUID,
          character_2_id = refs.char2_id::UUID,
          character_3_id = refs.char3_id::UUID,
          character_4_id = refs.char4_id::UUID
        FROM (
          SELECT
            MAX(CASE WHEN row_num = 1 THEN card_id END) AS char1_id,
            MAX(CASE WHEN row_num = 2 THEN card_id END) AS char2_id,
            MAX(CASE WHEN row_num = 3 THEN card_id END) AS char3_id,
            MAX(CASE WHEN row_num = 4 THEN card_id END) AS char4_id
          FROM (
            SELECT
              card_id,
              ROW_NUMBER() OVER (ORDER BY created_at, card_id) AS row_num
            FROM deck_cards
            WHERE deck_id = $1
              AND card_type = 'character'
              AND card_id ~* $2
          ) ranked_chars
          WHERE row_num <= 4
        ) refs
        WHERE d.id = $1
      `,
      [deckId, UUID_CARD_ID_PATTERN],
    );

    await client.query(
      `
        UPDATE decks
        SET
          character_1_id = NULL,
          character_2_id = NULL,
          character_3_id = NULL,
          character_4_id = NULL
        WHERE id = $1
          AND NOT EXISTS (
            SELECT 1 FROM deck_cards dc
            WHERE dc.deck_id = $1
              AND dc.card_type = 'character'
              AND dc.card_id ~* $2
          )
      `,
      [deckId, UUID_CARD_ID_PATTERN],
    );

    await client.query(
      `
        UPDATE decks d
        SET location_id = loc_refs.location_id::UUID
        FROM (
          SELECT card_id AS location_id
          FROM deck_cards
          WHERE deck_id = $1
            AND card_type = 'location'
            AND card_id ~* $2
          ORDER BY created_at, card_id
          LIMIT 1
        ) loc_refs
        WHERE d.id = $1
      `,
      [deckId, UUID_CARD_ID_PATTERN],
    );

    await client.query(
      `
        UPDATE decks
        SET location_id = NULL
        WHERE id = $1
          AND NOT EXISTS (
            SELECT 1 FROM deck_cards dc
            WHERE dc.deck_id = $1
              AND dc.card_type = 'location'
              AND dc.card_id ~* $2
          )
      `,
      [deckId, UUID_CARD_ID_PATTERN],
    );
  };

  if (existingClient) {
    await run(existingClient);
    return;
  }

  const client = await ctx.pool.connect();
  try {
    await run(client);
  } finally {
    client.release();
  }
}

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
