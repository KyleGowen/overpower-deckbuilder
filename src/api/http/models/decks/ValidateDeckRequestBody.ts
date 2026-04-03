import type { V1ErrorBody } from '../../v1Envelope';

/**
 * Validated POST /api/v1/decks/validate JSON body.
 */
export class ValidateDeckRequestBody {
  readonly cards: unknown[];

  private constructor(cards: unknown[]) {
    this.cards = cards;
  }

  static parse(body: unknown): { ok: true; value: ValidateDeckRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const cards = o.cards;
    if (!cards || !Array.isArray(cards)) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION_ERROR', message: 'Cards array is required', field: 'cards' }]
      };
    }
    return { ok: true, value: new ValidateDeckRequestBody(cards) };
  }
}
