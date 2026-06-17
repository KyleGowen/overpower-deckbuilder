import type { V1ErrorBody } from '../../v1Envelope';

export interface UpdateGuestDeckParsed {
  name?: string;
  description?: string | null;
  reserve_character?: string | null;
}

export class UpdateGuestDeckBody {
  static parse(body: unknown): { ok: true; value: UpdateGuestDeckParsed } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: true, value: {} };
    }
    const o = body as Record<string, unknown>;
    const out: UpdateGuestDeckParsed = {};
    if ('name' in o) {
      if (o.name !== undefined && o.name !== null && typeof o.name !== 'string') {
        return {
          ok: false,
          errors: [{ code: 'VALIDATION_ERROR', message: 'name must be a string', field: 'name' }]
        };
      }
      if (typeof o.name === 'string') out.name = o.name.trim();
    }
    if ('description' in o) {
      if (o.description !== undefined && o.description !== null && typeof o.description !== 'string') {
        return {
          ok: false,
          errors: [
            { code: 'VALIDATION_ERROR', message: 'description must be a string', field: 'description' }
          ]
        };
      }
      if (typeof o.description === 'string') out.description = o.description;
      else if (o.description === null) out.description = null;
    }
    if ('reserve_character' in o) {
      const rc = o.reserve_character;
      if (rc === null) {
        out.reserve_character = null;
      } else if (rc !== undefined) {
        if (typeof rc !== 'string' || rc.length > 50) {
          return {
            ok: false,
            errors: [
              {
                code: 'VALIDATION_ERROR',
                message: 'reserve_character must be a string with 50 characters or less',
                field: 'reserve_character',
              },
            ],
          };
        }
        out.reserve_character = rc;
      }
    }
    return { ok: true, value: out };
  }
}
