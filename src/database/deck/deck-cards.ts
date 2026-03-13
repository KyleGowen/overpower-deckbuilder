import { PoolClient } from 'pg';
import { DeckCard } from '../../types';
import type { DeckRepositoryContext } from './context';

/**
 * Check if a card exists in the appropriate card table for the given type.
 * @param allowUnknown - If true, unknown card types are treated as valid (for bulk replace). If false, returns false and logs error.
 */
export async function cardExistsInCardTable(
  client: PoolClient,
  cardType: string,
  cardId: string,
  allowUnknown = false
): Promise<boolean> {
  const runQuery = async (sql: string, params: string[]): Promise<boolean> => {
    const result = await client.query(sql, params);
    return result.rows.length > 0;
  };

  switch (cardType) {
    case 'character': {
      try {
        return await runQuery(
          'SELECT id FROM characters WHERE id::text = $1 OR id = $1::uuid',
          [cardId]
        );
      } catch {
        return await runQuery('SELECT id FROM characters WHERE id::text = $1', [
          String(cardId),
        ]);
      }
    }
    case 'special': {
      try {
        return await runQuery(
          'SELECT id FROM special_cards WHERE id::text = $1 OR id = $1::uuid',
          [cardId]
        );
      } catch {
        return await runQuery('SELECT id FROM special_cards WHERE id::text = $1', [
          String(cardId),
        ]);
      }
    }
    case 'power': {
      try {
        return await runQuery(
          'SELECT id FROM power_cards WHERE id::text = $1 OR id = $1::uuid',
          [cardId]
        );
      } catch {
        return await runQuery('SELECT id FROM power_cards WHERE id::text = $1', [
          String(cardId),
        ]);
      }
    }
    case 'mission': {
      return await runQuery(
        'SELECT id FROM missions WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'event': {
      return await runQuery(
        'SELECT id FROM events WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'aspect': {
      return await runQuery(
        'SELECT id FROM aspects WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'location': {
      return await runQuery(
        'SELECT id FROM locations WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'teamwork': {
      return await runQuery(
        'SELECT id FROM teamwork_cards WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'ally-universe': {
      return await runQuery(
        'SELECT id FROM ally_universe_cards WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'training': {
      return await runQuery(
        'SELECT id FROM training_cards WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'basic-universe': {
      return await runQuery(
        'SELECT id FROM basic_universe_cards WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    case 'advanced-universe': {
      return await runQuery(
        'SELECT id FROM advanced_universe_cards WHERE id::text = $1 OR id = $1::uuid',
        [cardId]
      );
    }
    default:
      if (allowUnknown) {
        console.warn(`Unknown card type: ${cardType}, skipping validation`);
        return true;
      }
      console.error(`Unknown card type: ${cardType}`);
      return false;
  }
}

export async function addCardToDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  cardType: string,
  cardId: string,
  quantity = 1,
  _selectedAlternateImage?: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const cardExists = await cardExistsInCardTable(client, cardType, cardId, false);
    if (!cardExists) {
      console.error(
        `Card with ID ${cardId} (type: ${typeof cardId}) does not exist in ${cardType} table`
      );
      if (cardType === 'character') {
        const debugResult = await client.query(
          'SELECT id::text, name FROM characters LIMIT 5'
        );
        console.error(
          `Sample character IDs: ${debugResult.rows.map((r: { id: string }) => r.id).join(', ')}`
        );
      }
      return false;
    }

    const existingCard = await client.query(
      'SELECT * FROM deck_cards WHERE deck_id = $1 AND card_type = $2 AND card_id = $3',
      [deckId, cardType, cardId]
    );

    if (existingCard.rows.length > 0) {
      await client.query(
        'UPDATE deck_cards SET quantity = quantity + $1, updated_at = NOW() WHERE deck_id = $2 AND card_type = $3 AND card_id = $4',
        [quantity, deckId, cardType, cardId]
      );
    } else {
      await client.query(
        'INSERT INTO deck_cards (deck_id, card_type, card_id, quantity) VALUES ($1, $2, $3, $4)',
        [deckId, cardType, cardId, quantity]
      );
    }

    await ctx.invalidateDeck(deckId);
    return true;
  } catch (error) {
    console.error('Error adding card to deck:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function doesCardExistInDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  cardType: string,
  cardId: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM deck_cards WHERE deck_id = $1 AND card_type = $2 AND card_id = $3 LIMIT 1',
      [deckId, cardType, cardId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if card exists in deck:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function removeCardFromDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  cardType: string,
  cardId: string,
  quantity = 1
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const currentCard = await client.query(
      'SELECT quantity FROM deck_cards WHERE deck_id = $1 AND card_type = $2 AND card_id = $3',
      [deckId, cardType, cardId]
    );

    if (currentCard.rows.length === 0) {
      return false;
    }

    const currentQuantity = currentCard.rows[0].quantity;
    const newQuantity = currentQuantity - quantity;

    if (newQuantity <= 0) {
      await client.query(
        'DELETE FROM deck_cards WHERE deck_id = $1 AND card_type = $2 AND card_id = $3',
        [deckId, cardType, cardId]
      );
    } else {
      await client.query(
        'UPDATE deck_cards SET quantity = $1, updated_at = NOW() WHERE deck_id = $2 AND card_type = $3 AND card_id = $4',
        [newQuantity, deckId, cardType, cardId]
      );
    }

    await ctx.invalidateDeck(deckId);
    return true;
  } catch (error) {
    console.error('Error removing card from deck:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function updateCardInDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  cardType: string,
  cardId: string,
  updates: { quantity?: number }
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const setClause: string[] = [];
    const values: (number | string)[] = [];
    let paramCount = 1;

    if (updates.quantity !== undefined) {
      setClause.push(`quantity = $${paramCount++}`);
      values.push(updates.quantity);
    }

    if (setClause.length === 0) {
      return true;
    }

    setClause.push('updated_at = NOW()');
    values.push(deckId, cardType, cardId);

    // setClause is from a fixed whitelist; values are parameterized.
    const result = await client.query( // nosemgrep: pg-sql-template-interpolation
      `UPDATE deck_cards SET ${setClause.join(', ')} WHERE deck_id = $${paramCount} AND card_type = $${paramCount + 1} AND card_id = $${paramCount + 2}`,
      values
    );

    const success = (result.rowCount || 0) > 0;
    if (success) {
      await ctx.invalidateDeck(deckId);
    }
    return success;
  } catch (error) {
    console.error('Error updating card in deck:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function removeAllCardsFromDeck(
  ctx: DeckRepositoryContext,
  deckId: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    await client.query('DELETE FROM deck_cards WHERE deck_id = $1', [deckId]);
    await ctx.invalidateDeck(deckId);
    return true;
  } catch (error) {
    console.error('Error removing all cards from deck:', error);
    return false;
  } finally {
    client.release();
  }
}

export type ReplaceCardInput = {
  cardType: string;
  cardId: string;
  quantity: number;
  exclude_from_draw?: boolean;
};

export async function replaceAllCardsInDeck(
  ctx: DeckRepositoryContext,
  deckId: string,
  cards: ReplaceCardInput[]
): Promise<void> {
  const client = await ctx.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM deck_cards WHERE deck_id = $1', [deckId]);

    const cardMap = new Map<
      string,
      { cardType: string; cardId: string; quantity: number; exclude_from_draw?: boolean }
    >();
    for (const card of cards) {
      const key = `${card.cardType}:${card.cardId}`;
      const existing = cardMap.get(key);
      if (existing) {
        existing.quantity += card.quantity;
        if (card.exclude_from_draw !== undefined) {
          existing.exclude_from_draw = card.exclude_from_draw;
        }
      } else {
        cardMap.set(key, { ...card });
      }
    }

    for (const card of Array.from(cardMap.values())) {
      let cardExists = false;
      try {
        cardExists = await cardExistsInCardTable(
          client,
          card.cardType,
          card.cardId,
          true
        );
      } catch (validationError: unknown) {
        console.error(
          `Error validating card ${card.cardId} of type ${card.cardType}:`,
          validationError
        );
      }

      if (!cardExists) {
        const errorMsg = `Card ${card.cardId} of type ${card.cardType} does not exist in database`;
        console.error(errorMsg);
        console.error('Card details:', JSON.stringify(card, null, 2));
        throw new Error(errorMsg);
      }

      if (card.exclude_from_draw !== undefined) {
        await client.query(
          'INSERT INTO deck_cards (deck_id, card_type, card_id, quantity, exclude_from_draw) VALUES ($1, $2, $3, $4, $5)',
          [deckId, card.cardType, card.cardId, card.quantity, card.exclude_from_draw]
        );
      } else {
        await client.query(
          'INSERT INTO deck_cards (deck_id, card_type, card_id, quantity) VALUES ($1, $2, $3, $4)',
          [deckId, card.cardType, card.cardId, card.quantity]
        );
      }
    }

    await client.query('COMMIT');
    await ctx.invalidateDeck(deckId);
  } catch (error: unknown) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    const err = error as {
      message?: string;
      code?: string;
      detail?: string;
      constraint?: string;
      stack?: string;
    };
    console.error('Error replacing all cards in deck:', error);
    console.error('Error message:', err?.message);
    console.error('Error code:', err?.code);
    console.error('Error detail:', err?.detail);
    console.error('Error constraint:', err?.constraint);
    console.error('Error stack:', err?.stack);
    console.error('Deck ID:', deckId);
    console.error('Cards being inserted:', JSON.stringify(cards, null, 2));
    if (cards.length > 0) {
      console.error(
        'First 5 cards:',
        JSON.stringify(cards.slice(0, 5), null, 2)
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getDeckCards(
  ctx: DeckRepositoryContext,
  deckId: string
): Promise<DeckCard[]> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM deck_cards WHERE deck_id = $1 ORDER BY card_type, card_id',
      [deckId]
    );
    const rows = result.rows as {
      id: string;
      card_type: string;
      card_id: string;
      quantity: number;
      exclude_from_draw?: boolean;
    }[];
    return rows.map((card) => ({
      id: card.id,
      type: card.card_type as DeckCard['type'],
      cardId: card.card_id,
      quantity: card.quantity,
      exclude_from_draw: card.exclude_from_draw ?? false,
    }));
  } finally {
    client.release();
  }
}
