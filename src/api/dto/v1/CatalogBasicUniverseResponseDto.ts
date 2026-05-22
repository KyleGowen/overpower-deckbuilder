import { CatalogSpecialCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/basic-universe — `data` is an array of Universe: Basic card rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogBasicUniverseDataDto = CatalogSpecialCardItem[];
