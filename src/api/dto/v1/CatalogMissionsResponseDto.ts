import { CatalogMissionItem } from './catalog-item-types';

/**
 * v1 GET /catalog/missions — `data` is an array of mission rows.
 * @see API_V1.md
 * @see catalog-item-types.ts for the full field list
 */
export type CatalogMissionsDataDto = CatalogMissionItem[];
