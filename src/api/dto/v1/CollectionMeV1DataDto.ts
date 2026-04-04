/**
 * GET /api/v1/collections/me — current user's collection row identifiers.
 * Field names match legacy `GET /api/collections/me` `data` payload.
 */
export interface CollectionMeV1DataDto {
  id: string;
  user_id: string;
}
