import { getDeckSummaryWithAllCards } from '../../src/database/deck/deck-crud';
import type { DeckRepositoryContext } from '../../src/database/deck/context';

describe('getDeckSummaryWithAllCards', () => {
  it('preserves the pre-placed flag when loading a full deck', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rows: [{ id: 'deck-1', user_id: 'user-1', name: 'Saved deck' }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'card-row-1',
              card_type: 'training',
              card_id: 'training-1',
              quantity: 1,
              exclude_from_draw: true,
            },
          ],
        }),
      release: jest.fn(),
    };
    const ctx = {
      pool: { connect: jest.fn().mockResolvedValue(client) },
      cache: new Map(),
      cacheTtlMs: 60_000,
      invalidateDeck: jest.fn(),
    } as unknown as DeckRepositoryContext;

    const deck = await getDeckSummaryWithAllCards(ctx, 'deck-1');

    expect(deck?.cards).toEqual([
      expect.objectContaining({
        type: 'training',
        cardId: 'training-1',
        exclude_from_draw: true,
      }),
    ]);
  });
});
