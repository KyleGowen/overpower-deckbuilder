import { validateDeck } from '../../../frontend/src/lib/api/decks';
import type { DeckCardEntry } from '../../../frontend/src/lib/api/types';

/**
 * The v1 validate endpoint returns HTTP 400 (code DECK_VALIDATION_FAILED) when a
 * deck breaks legality rules. That is a successful validation with a "not legal"
 * result, so the client must surface { valid: false } rather than throwing — this
 * is what lets the deck editor's live badge match the tiles for invalid decks.
 */
function mockFetchOnce(status: number, body: unknown): void {
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  });
}

const cards: DeckCardEntry[] = [{ type: 'character', cardId: 'char-1', quantity: 1 }];

describe('validateDeck client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the result on 200 (valid deck)', async () => {
    mockFetchOnce(200, {
      data: { valid: true, message: 'Deck is valid' },
      errors: [],
      success: true,
    });

    const result = await validateDeck(cards);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('Deck is valid');
  });

  it('returns { valid: false } on 400 DECK_VALIDATION_FAILED instead of throwing', async () => {
    mockFetchOnce(400, {
      data: { validationErrors: [{ rule: 'mission_count', message: 'Deck must have exactly 7 mission cards (found 0)' }] },
      errors: [
        { code: 'DECK_VALIDATION_FAILED', message: 'Deck must have exactly 7 mission cards (found 0)' },
      ],
      success: false,
    });

    const result = await validateDeck(cards);

    expect(result.valid).toBe(false);
    expect(result.message).toContain('7 mission cards');
  });

  it('rethrows non-validation errors (e.g. 500)', async () => {
    mockFetchOnce(500, {
      data: null,
      errors: [{ code: 'DECK_VALIDATE_ERROR', message: 'Failed to validate deck' }],
      success: false,
    });

    await expect(validateDeck(cards)).rejects.toThrow();
  });
});
