import { CatalogSpecialCardItem } from './catalog-item-types';

/**
 * v1 GET /catalog/training — `data` is an array of Universe: Training card rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogTrainingDataDto = CatalogSpecialCardItem[];
