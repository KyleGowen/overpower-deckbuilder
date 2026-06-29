import type { Deck } from '../../../../src/types';
import { canViewDeck, DeckDetailService } from '../../../../src/api/services/deckDetailService';

function deck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'd1',
    user_id: 'owner-1',
    name: 'Test',
    is_valid: true,
    is_limited: false,
    ...overrides,
  };
}

describe('canViewDeck', () => {
  it('allows anyone to view a public deck', () => {
    expect(canViewDeck(deck({ is_private: false }), null)).toBe(true);
    expect(canViewDeck(deck({ is_private: false }), 'stranger')).toBe(true);
  });

  it('allows only the owner to view a private deck', () => {
    expect(canViewDeck(deck({ is_private: true }), null)).toBe(false);
    expect(canViewDeck(deck({ is_private: true }), 'stranger')).toBe(false);
    expect(canViewDeck(deck({ is_private: true }), 'owner-1')).toBe(true);
  });

  it('treats missing is_private as private', () => {
    expect(canViewDeck(deck(), 'stranger')).toBe(false);
    expect(canViewDeck(deck(), 'owner-1')).toBe(true);
  });
});

describe('DeckDetailService visibility', () => {
  const publicDeck = deck({
    id: 'd1',
    name: 'Public',
    is_private: false,
    cards: [],
  });

  const privateDeck = deck({
    id: 'd2',
    name: 'Private',
    is_private: true,
    cards: [],
  });

  it('getDeckFullDetail hides private decks from strangers', async () => {
    const repo = {
      getDeckById: jest.fn(),
      getDeckSummaryWithAllCards: jest.fn().mockResolvedValue(privateDeck),
      getDeckCards: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
    };
    const service = new DeckDetailService(repo);
    await expect(service.getDeckFullDetail('d2', 'stranger')).resolves.toBeNull();
  });

  it('getDeckFullDetail returns public decks for unsigned viewers', async () => {
    const repo = {
      getDeckById: jest.fn(),
      getDeckSummaryWithAllCards: jest.fn().mockResolvedValue(publicDeck),
      getDeckCards: jest.fn(),
      updateDeck: jest.fn(),
      deleteDeck: jest.fn(),
    };
    const service = new DeckDetailService(repo);
    const detail = await service.getDeckFullDetail('d1', '');
    expect(detail?.metadata.isOwner).toBe(false);
    expect(detail?.metadata.name).toBe('Public');
  });
});
