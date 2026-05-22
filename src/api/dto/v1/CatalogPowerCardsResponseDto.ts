import { CatalogPowerCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/power-cards — `data` is an array of power card rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogPowerCardsDataDto = CatalogPowerCardItem[];
