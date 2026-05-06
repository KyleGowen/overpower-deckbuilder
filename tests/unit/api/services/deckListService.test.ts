import { DeckListService } from '../../../../src/api/services/deckListService';
import type { Deck } from '../../../../src/types';

describe('DeckListService', () => {
  it('getTransformedListForUser maps repository rows through transformDeckList', async () => {
    const deck: Deck = {
      id: 'deck-1',
      name: 'Test',
      user_id: 'u1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
      card_count: 3,
      threat: 10,
      is_valid: true,
      ui_preferences: {},
      is_limited: false,
      cards: []
    };
    const deckRepository = {
      getDecksByUserId: jest.fn().mockResolvedValue([deck])
    };
    const svc = new DeckListService(deckRepository);
    const out = await svc.getTransformedListForUser('u1');
    expect(deckRepository.getDecksByUserId).toHaveBeenCalledWith('u1');
    expect(out).toHaveLength(1);
    expect(out[0].metadata.id).toBe('deck-1');
    expect(out[0].metadata.name).toBe('Test');
    expect(out[0].metadata.cardCount).toBe(3);
    expect(out[0].metadata.reserve_character).toBeNull();
  });

  it('maps reserve_character onto list metadata when present', async () => {
    const reserveId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const deck: Deck = {
      id: 'deck-2',
      name: 'WithReserve',
      user_id: 'u1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z',
      card_count: 2,
      threat: 5,
      is_valid: true,
      ui_preferences: {},
      is_limited: false,
      reserve_character: reserveId,
      cards: []
    };
    const deckRepository = {
      getDecksByUserId: jest.fn().mockResolvedValue([deck])
    };
    const svc = new DeckListService(deckRepository);
    const out = await svc.getTransformedListForUser('u1');
    expect(out[0].metadata.reserve_character).toBe(reserveId);
  });
});
