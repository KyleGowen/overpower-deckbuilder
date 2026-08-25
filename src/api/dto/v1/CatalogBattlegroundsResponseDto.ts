import { CatalogBattlegroundItem } from './catalog-item-types';

/**
 * v1 GET /catalog/battlegrounds — `data` is an array of Battleground rows.
 * @see API_V1.md
 */
export type CatalogBattlegroundsDataDto = CatalogBattlegroundItem[];
