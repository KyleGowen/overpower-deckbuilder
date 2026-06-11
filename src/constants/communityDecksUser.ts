/**
 * Internal account whose saved decks populate the Home "Community Decks" rail
 * (GET /api/v1/decks/community). Decks are managed via normal deck APIs when
 * logged in as community_decks, or via scripts/import-community-deck.ts.
 */
export const COMMUNITY_DECKS_USER_ID = '00000000-0000-0000-0000-000000000002';
