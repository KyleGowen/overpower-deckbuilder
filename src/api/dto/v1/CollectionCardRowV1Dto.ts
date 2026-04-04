import type { CollectionCardWithDetails } from '../../../database/collectionsRepository';

/** JSON shape for a collection row returned by collection card v1 endpoints (snake_case, matches DB/service). */
export type CollectionCardRowV1Dto = CollectionCardWithDetails;
