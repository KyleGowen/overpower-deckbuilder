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
  });
});
