import { listRecentUpdates } from '../../database/recentUpdatesLookup';

type RecentUpdatesPool = Parameters<typeof listRecentUpdates>[0];

export interface RecentUpdateDto {
  id: string;
  title: string;
  type: string;
  description: string;
  cardImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDto(row: Awaited<ReturnType<typeof listRecentUpdates>>[number]): RecentUpdateDto {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    description: row.description,
    cardImageUrl: row.card_image_url,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

/**
 * Home screen "Recent Updates" reads. HTTP layers call this only.
 */
export class RecentUpdatesService {
  constructor(private readonly getPool: () => RecentUpdatesPool) {}

  async listRecentUpdates(): Promise<RecentUpdateDto[]> {
    const rows = await listRecentUpdates(this.getPool());
    return rows.map(toDto);
  }
}
