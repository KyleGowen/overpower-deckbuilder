import { DeckStatsService } from '../../../../src/api/services/deckStatsService';
import type { Deck } from '../../../../src/types';

describe('DeckStatsService', () => {
  it('returns zeros when user has no decks', async () => {
    const repo = {
      getDecksByUserId: jest.fn().mockResolvedValue([]),
      getDeckById: jest.fn()
    };
    const svc = new DeckStatsService(repo);
    await expect(svc.getAggregateStatsForUser('u1')).resolves.toEqual({
      totalDecks: 0,
      totalCards: 0,
      averageCardsPerDeck: 0,
      largestDeckSize: 0
    });
    expect(repo.getDeckById).not.toHaveBeenCalled();
  });

  it('aggregates quantities across decks and computes average and max', async () => {
    const d1: Deck = {
      id: 'deck-1',
      user_id: 'u1',
      name: 'A',
      cards: [
        { id: 'x', type: 'character', cardId: 'c1', quantity: 2 },
        { id: 'y', type: 'power', cardId: 'p1', quantity: 1 }
      ]
    };
    const d2: Deck = {
      id: 'deck-2',
      user_id: 'u1',
      name: 'B',
      cards: [{ id: 'z', type: 'character', cardId: 'c2', quantity: 5 }]
    };
    const repo = {
      getDecksByUserId: jest.fn().mockResolvedValue([{ ...d1 }, { ...d2 }]),
      getDeckById: jest.fn().mockImplementation(async (id: string) => {
        if (id === 'deck-1') return d1;
        if (id === 'deck-2') return d2;
        return null;
      })
    };
    const svc = new DeckStatsService(repo);
    await expect(svc.getAggregateStatsForUser('u1')).resolves.toEqual({
      totalDecks: 2,
      totalCards: 8,
      averageCardsPerDeck: 4,
      largestDeckSize: 5
    });
  });

  it('uses list row when getDeckById returns null', async () => {
    const d1: Deck = {
      id: 'deck-1',
      user_id: 'u1',
      name: 'A',
      cards: [{ id: 'x', type: 'character', cardId: 'c1', quantity: 1 }]
    };
    const repo = {
      getDecksByUserId: jest.fn().mockResolvedValue([{ ...d1 }]),
      getDeckById: jest.fn().mockResolvedValue(null)
    };
    const svc = new DeckStatsService(repo);
    await expect(svc.getAggregateStatsForUser('u1')).resolves.toEqual({
      totalDecks: 1,
      totalCards: 1,
      averageCardsPerDeck: 1,
      largestDeckSize: 1
    });
  });
});
