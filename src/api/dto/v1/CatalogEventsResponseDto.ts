import { CatalogSpecialCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/events — `data` is an array of event card rows (same shape as special cards).
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogEventsDataDto = CatalogSpecialCardItem[];
