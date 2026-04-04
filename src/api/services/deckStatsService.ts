import type { Deck } from '../../types';

export interface DeckStatsRepository {
  getDecksByUserId: (userId: string) => Promise<Deck[]>;
  /** Matches `DeckRepository.getDeckById` (may be `undefined` when not found). */
  getDeckById: (id: string) => Promise<Deck | null | undefined>;
}

function sumCardQuantities(cards: Deck['cards']): number {
  if (!cards?.length) return 0;
  return cards.reduce((acc, card) => acc + (card.quantity ?? 1), 0);
}

/**
 * Aggregate deck statistics for v1 (same math as legacy GET /api/deck-stats).
 */
export class DeckStatsService {
  constructor(private readonly deckRepository: DeckStatsRepository) {}

  async getAggregateStatsForUser(userId: string): Promise<{
    totalDecks: number;
    totalCards: number;
    averageCardsPerDeck: number;
    largestDeckSize: number;
  }> {
    const userDecks = await this.deckRepository.getDecksByUserId(userId);
    const totalDecks = userDecks.length;

    const decksWithCards = await Promise.all(
      userDecks.map(async (deck) => {
        const full = await this.deckRepository.getDeckById(deck.id);
        return full ?? deck;
      })
    );

    const totalCards = decksWithCards.reduce((total, deck) => total + sumCardQuantities(deck.cards), 0);
    const averageCardsPerDeck = totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0;
    const largestDeckSize = decksWithCards.reduce(
      (max, deck) => Math.max(max, sumCardQuantities(deck.cards)),
      0
    );

    return { totalDecks, totalCards, averageCardsPerDeck, largestDeckSize };
  }
}
