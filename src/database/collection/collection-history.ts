import type { CollectionHistory } from './types';
import type { CollectionRepositoryContext } from './context';

/**
 * Get collection history for a collection.
 * Returns history entries ordered by created_at DESC (most recent first).
 */
export async function getCollectionHistory(
  ctx: CollectionRepositoryContext,
  collectionId: string,
  limit?: number
): Promise<CollectionHistory[]> {
  const client = await ctx.pool.connect();
  try {
    let query = `
      SELECT id, collection_id, card_id, action, new_quantity, created_at
      FROM collection_history
      WHERE collection_id = $1
      ORDER BY created_at DESC
    `;

    const params: (string | number)[] = [collectionId];

    if (limit && limit > 0) {
      query += ' LIMIT $2';
      params.push(limit);
    }

    const result = await client.query<CollectionHistory>(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}
