import type { V1ErrorBody } from '../../v1Envelope';

export type GuestDeckCardReplaceInput = {
  cardType: string;
  cardId: string;
  quantity?: number;
  displayOrder?: number;
  exclude_from_draw?: boolean;
};

export class GuestDeckCardsPutBody {
  static parse(body: unknown): { ok: true; value: GuestDeckCardReplaceInput[] } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const cards = o.cards;
    if (!Array.isArray(cards)) {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'cards must be an array', field: 'cards' }] };
    }
    return { ok: true, value: cards as GuestDeckCardReplaceInput[] };
  }
}
