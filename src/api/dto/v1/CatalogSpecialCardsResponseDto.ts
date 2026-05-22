import { CatalogSpecialCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/special-cards — `data` is an array of special card rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogSpecialCardsDataDto = CatalogSpecialCardItem[];
