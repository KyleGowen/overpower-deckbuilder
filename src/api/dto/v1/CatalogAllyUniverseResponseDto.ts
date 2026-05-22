import { CatalogSpecialCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/ally-universe — `data` is an array of Universe: Ally card rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogAllyUniverseDataDto = CatalogSpecialCardItem[];
