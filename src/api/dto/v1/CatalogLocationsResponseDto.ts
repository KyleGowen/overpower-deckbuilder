import { CatalogLocationItem } from './catalog-item-types';

/**
 * v1 GET /catalog/locations — `data` is an array of location rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogLocationsDataDto = CatalogLocationItem[];
