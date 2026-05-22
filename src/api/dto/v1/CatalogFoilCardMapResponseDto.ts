import { CatalogFoilCardMapItem } from './catalog-item-types';

/**
 * v1 GET /catalog/foil-card-map — `data` is an array of foil↔base card ID mappings.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogFoilCardMapDataDto = CatalogFoilCardMapItem[];
