import { CatalogCharacterItem } from './catalog-item-types';

/**
 * v1 GET /catalog/characters — `data` is an array of character rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogCharactersDataDto = CatalogCharacterItem[];
