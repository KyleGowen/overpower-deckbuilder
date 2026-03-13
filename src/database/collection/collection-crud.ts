import type { CollectionRepositoryContext } from './context';

/**
 * Get or create a collection for a user.
 * Returns the collection ID.
 */
export async function getOrCreateCollection(
  ctx: CollectionRepositoryContext,
  userId: string
): Promise<string> {
  const client = await ctx.pool.connect();
  try {
    const existingResult = await client.query(
      'SELECT id FROM collections WHERE user_id = $1',
      [userId]
    );

    if (existingResult.rows.length > 0) {
      return existingResult.rows[0].id;
    }

    const createResult = await client.query(
      'INSERT INTO collections (user_id) VALUES ($1) RETURNING id',
      [userId]
    );

    return createResult.rows[0].id;
  } finally {
    client.release();
  }
}
