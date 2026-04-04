/**
 * GET /api/v1/decks/stats — aggregate counts for the authenticated user's DB decks.
 */
export interface DeckStatsV1DataDto {
  totalDecks: number;
  totalCards: number;
  averageCardsPerDeck: number;
  largestDeckSize: number;
}
