import type { Pool } from 'pg';

export interface CatalogErrataEntry {
  id: string;
  source_section: number;
  entry_title: string;
  entry_text: string;
  source_url: string;
}

export interface CardErrataAssociation extends CatalogErrataEntry {
  card_type: string;
  card_id: string;
}

/** Read-only access to official errata linked to catalog card printings. */
export class CardErrataRepository {
  private entriesPromise: Promise<CardErrataAssociation[]> | null = null;

  constructor(private readonly pool: Pool) {}

  /**
   * Errata is migration-owned reference data, so one process-lifetime read is
   * sufficient and prevents each catalog endpoint from repeating the join.
   */
  getAllCardErrata(): Promise<CardErrataAssociation[]> {
    if (!this.entriesPromise) {
      this.entriesPromise = this.loadAllCardErrata().catch((error) => {
        this.entriesPromise = null;
        throw error;
      });
    }
    return this.entriesPromise;
  }

  private async loadAllCardErrata(): Promise<CardErrataAssociation[]> {
    const result = await this.pool.query<CardErrataAssociation>(`
      SELECT
        ce.card_type,
        ce.card_id::text AS card_id,
        e.id::text AS id,
        e.source_section,
        e.entry_title,
        COALESCE(ce.display_text, e.entry_text) AS entry_text,
        e.source_url
      FROM card_errata ce
      JOIN errata e ON e.id = ce.errata_id
      ORDER BY ce.card_type, ce.card_id, e.source_section, e.id
    `);

    return result.rows;
  }
}
