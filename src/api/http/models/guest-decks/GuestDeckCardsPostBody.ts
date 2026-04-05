import type { V1ErrorBody } from '../../v1Envelope';

export interface GuestDeckCardsPostParsed {
  cardType: string;
  cardId: string;
  quantity: number;
}

export class GuestDeckCardsPostBody {
  static parse(body: unknown): { ok: true; value: GuestDeckCardsPostParsed } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const cardType = o.cardType;
    const cardId = o.cardId;
    const errors: V1ErrorBody[] = [];
    if (!cardType || typeof cardType !== 'string' || cardType.trim().length === 0) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Card type is required and must be a non-empty string',
        field: 'cardType'
      });
    }
    if (!cardId || typeof cardId !== 'string' || cardId.trim().length === 0) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Card ID is required and must be a non-empty string',
        field: 'cardId'
      });
    }
    const quantity = o.quantity;
    let qty = 1;
    if (quantity !== undefined) {
      if (typeof quantity !== 'number' || quantity < 1 || quantity > 100) {
        qty = 1;
      } else {
        qty = quantity;
      }
    }
    if (errors.length) return { ok: false, errors };
    return {
      ok: true,
      value: { cardType: (cardType as string).trim(), cardId: (cardId as string).trim(), quantity: qty }
    };
  }
}
