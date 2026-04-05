import type { V1ErrorBody } from '../../v1Envelope';

export interface CreateGuestDeckParsed {
  name: string;
  description: string;
}

/**
 * POST /api/v1/guest/decks — optional name/description (defaults match legacy).
 */
export class CreateGuestDeckBody {
  static parse(body: unknown): { ok: true; value: CreateGuestDeckParsed } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return {
        ok: true,
        value: { name: 'New Deck', description: '' }
      };
    }
    const o = body as Record<string, unknown>;
    const nameRaw = o.name;
    const name =
      nameRaw && typeof nameRaw === 'string' ? nameRaw.trim() : 'New Deck';
    const descRaw = o.description;
    const description =
      descRaw && typeof descRaw === 'string' ? descRaw : '';
    const errors: V1ErrorBody[] = [];
    if (name.length > 100) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Deck name must be 100 characters or less',
        field: 'name'
      });
    }
    if (description.length > 500) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Description must be 500 characters or less',
        field: 'description'
      });
    }
    if (errors.length) return { ok: false, errors };
    return { ok: true, value: { name, description } };
  }
}
