import { QueryResult } from 'pg';
import type { CollectionCard, CollectionCardWithDetails } from './types';
import type { CollectionRepositoryContext } from './context';
import { getCardImagePath, fetchCardDataForCollectionCard } from './card-lookup';

export async function getCollectionCards(
  ctx: CollectionRepositoryContext,
  collectionId: string
): Promise<CollectionCardWithDetails[]> {
  const client = await ctx.pool.connect();
  try {
    const collectionCardsResult = await client.query(
      'SELECT * FROM collection_cards WHERE collection_id = $1 ORDER BY card_type, created_at',
      [collectionId]
    );

    const cardsWithDetails: CollectionCardWithDetails[] = [];
    const setNameCache = new Map<string, string>();

    for (const cc of collectionCardsResult.rows) {
      const { cardData, cardName, set } = await fetchCardDataForCollectionCard(
        client,
        cc.card_id,
        cc.card_type,
        setNameCache
      );

      const cardEntry: CollectionCardWithDetails = {
        id: cc.id,
        collection_id: cc.collection_id,
        card_id: cc.card_id,
        card_type: cc.card_type,
        quantity: cc.quantity,
        image_path: cc.image_path,
        created_at: cc.created_at,
        updated_at: cc.updated_at,
        card_name: cardName,
        set: set,
      };
      if (cardData !== null) {
        cardEntry.card_data = cardData;
      }
      cardsWithDetails.push(cardEntry);
    }

    return cardsWithDetails;
  } finally {
    client.release();
  }
}

export async function addCardToCollection(
  ctx: CollectionRepositoryContext,
  collectionId: string,
  cardId: string,
  cardType: string,
  quantity: number = 1,
  imagePath?: string
): Promise<CollectionCard> {
  const client = await ctx.pool.connect();
  try {
    await client.query('BEGIN');

    let finalImagePath = imagePath;
    if (!finalImagePath) {
      finalImagePath = await getCardImagePath(client, cardId, cardType);
    }

    const insertResult = await client.query<CollectionCard>(
      `INSERT INTO collection_cards (
          collection_id,
          card_id,
          card_type,
          quantity,
          image_path
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ON CONSTRAINT collection_cards_unique
        DO UPDATE SET
          quantity = collection_cards.quantity + EXCLUDED.quantity,
          updated_at = NOW()
        RETURNING *`,
      [collectionId, cardId, cardType, quantity, finalImagePath]
    );

    await client.query('COMMIT');
    return insertResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in addCardToCollection, rolling back:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateCardQuantity(
  ctx: CollectionRepositoryContext,
  collectionId: string,
  cardId: string,
  cardType: string,
  quantity: number,
  imagePath: string,
  oldImagePath?: string
): Promise<CollectionCard | null> {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  const client = await ctx.pool.connect();
  try {
    await client.query('BEGIN');

    let result: QueryResult<CollectionCard> | null = null;

    if (quantity === 0) {
      let deleteResult = await client.query(
        'DELETE FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 AND image_path = $4',
        [collectionId, cardId, cardType, imagePath]
      );

      if (deleteResult.rowCount === 0) {
        const existingRows = await client.query(
          'SELECT id, image_path FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3',
          [collectionId, cardId, cardType]
        );

        if (existingRows.rows.length > 0) {
          deleteResult = await client.query(
            'DELETE FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 LIMIT 1',
            [collectionId, cardId, cardType]
          );
        }
      }

      await client.query('COMMIT');
      return null;
    }

    if (oldImagePath && oldImagePath !== imagePath) {
      const oldPathResult = await client.query(
        'SELECT id FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 AND image_path = $4',
        [collectionId, cardId, cardType, oldImagePath]
      );

      if (oldPathResult.rows.length > 0) {
        result = await client.query(
          'UPDATE collection_cards SET image_path = $1, quantity = $2, updated_at = NOW() WHERE collection_id = $3 AND card_id = $4 AND card_type = $5 AND image_path = $6 RETURNING *',
          [imagePath, quantity, collectionId, cardId, cardType, oldImagePath]
        );
      }
    }

    if (!result || result.rows.length === 0) {
      result = await client.query(
        'UPDATE collection_cards SET quantity = $1, updated_at = NOW() WHERE collection_id = $2 AND card_id = $3 AND card_type = $4 AND image_path = $5 RETURNING *',
        [quantity, collectionId, cardId, cardType, imagePath]
      );
    }

    if (result.rows.length === 0) {
      const allExistingRows = await client.query(
        'SELECT id, image_path, quantity, created_at FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 ORDER BY created_at ASC',
        [collectionId, cardId, cardType]
      );

      if (allExistingRows.rows.length > 0) {
        const normalizedNewPath = imagePath.trim();
        const checkResult = await client.query(
          'SELECT id, image_path FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 AND TRIM(image_path) = $4',
          [collectionId, cardId, cardType, normalizedNewPath]
        );

        if (checkResult.rows.length > 0) {
          result = await client.query(
            'UPDATE collection_cards SET quantity = $1, updated_at = NOW() WHERE collection_id = $2 AND card_id = $3 AND card_type = $4 AND TRIM(image_path) = $5 RETURNING *',
            [quantity, collectionId, cardId, cardType, normalizedNewPath]
          );
        } else {
          const existingRow = allExistingRows.rows[0];
          result = await client.query(
            'UPDATE collection_cards SET image_path = $1, quantity = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [imagePath, quantity, existingRow.id]
          );
        }
      }
    }

    await client.query('COMMIT');

    if (result && result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '22P02') {
      return null;
    }
    console.error('Error in updateCardQuantity:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getQuantity(
  ctx: CollectionRepositoryContext,
  collectionId: string,
  cardId: string,
  cardType: string,
  imagePath: string
): Promise<number> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query<{ quantity: number }>(
      'SELECT quantity FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3 AND image_path = $4',
      [collectionId, cardId, cardType, imagePath]
    );
    if (result.rows.length === 0) return 0;
    return result.rows[0].quantity;
  } finally {
    client.release();
  }
}

export async function removeCardFromCollection(
  ctx: CollectionRepositoryContext,
  collectionId: string,
  cardId: string,
  cardType: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM collection_cards WHERE collection_id = $1 AND card_id = $2 AND card_type = $3',
      [collectionId, cardId, cardType]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === '22P02') {
      return false;
    }
    throw error;
  } finally {
    client.release();
  }
}
