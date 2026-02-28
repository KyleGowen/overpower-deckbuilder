/**
 * foilCardMapRepository
 *
 * Queries the `foil_card_map` table, which provides a bidirectional mapping
 * between foil card IDs and their non-foil counterparts.
 *
 * DB schema:
 *   foil_card_map (
 *     foil_card_id  VARCHAR(255) PRIMARY KEY,
 *     base_card_id  VARCHAR(255) NOT NULL,
 *     card_type     VARCHAR(50)  NOT NULL   -- 'character' | 'special' | 'power'
 *   )
 *
 * On the frontend the array is converted to a flat bidirectional object
 * (window.foilCardMap) so both directions can be looked up in O(1):
 *   window.foilCardMap[foilCardId]  → baseCardId
 *   window.foilCardMap[baseCardId]  → foilCardId
 *
 * To add new foil cards in the future:
 *   1. Insert the foil card row (V230 pattern)
 *   2. Insert the mapping row into foil_card_map in the same migration
 *   No application code changes are required.
 */

import { Pool } from 'pg';
import { FoilCardMapEntry } from '../types';

export class FoilCardMapRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Returns all rows from foil_card_map.
   * The caller (API endpoint) converts this into a bidirectional lookup object
   * for the frontend.
   */
  async getFoilCardMap(): Promise<FoilCardMapEntry[]> {
    const result = await this.pool.query<{
      foil_card_id: string;
      base_card_id: string;
      card_type: string;
    }>('SELECT foil_card_id, base_card_id, card_type FROM foil_card_map ORDER BY card_type, foil_card_id');

    return result.rows.map(row => ({
      foilCardId: row.foil_card_id,
      baseCardId: row.base_card_id,
      cardType: row.card_type,
    }));
  }
}
