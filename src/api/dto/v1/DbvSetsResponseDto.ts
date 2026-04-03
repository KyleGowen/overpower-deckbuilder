/**
 * v1 GET /dbv/sets — `data` is `{ code, name }[]` from `sets` table (ordered by name).
 * @see API_V1.md
 */
export type DbvSetsDataDto = { code: string; name: string }[];
