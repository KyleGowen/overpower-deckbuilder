/**
 * Internal account whose saved decks populate the Home "Tournament Winning Decks" rail
 * (GET /api/v1/decks/tournament). Decks are managed via normal deck APIs when logged in
 * as tournament_decks, or via scripts/import-tournament-deck.ts / seed:tournament-decks.
 */
export const TOURNAMENT_DECKS_USER_ID = '00000000-0000-0000-0000-000000000003';
