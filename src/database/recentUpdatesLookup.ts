import type { PoolClient } from 'pg';

export interface RecentUpdateRow {
  id: string;
  title: string;
  type: string;
  description: string;
  card_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Public list of recent updates for the Home screen news cards.
 */
export async function listRecentUpdates(
  pool: { connect: () => Promise<PoolClient> }
): Promise<RecentUpdateRow[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<RecentUpdateRow>(
      `SELECT id, title, type, description, card_image_url, created_at, updated_at
       FROM recent_updates
       ORDER BY updated_at DESC`
    );
    return result.rows;
  } finally {
    client.release();
  }
}
