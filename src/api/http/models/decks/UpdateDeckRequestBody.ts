import type { V1ErrorBody } from '../../v1Envelope';

export type UpdateDeckParsed = {
  name?: string;
  description?: string | null;
  is_limited?: boolean;
  is_valid?: boolean;
  is_private?: boolean;
  reserve_character?: string | null;
  display_mission_card_id?: string | null;
  background_image_path?: string | null;
};

function err(field: string, message: string): V1ErrorBody[] {
  return [{ code: 'VALIDATION_ERROR', message, field }];
}

/**
 * Partial body for PUT deck metadata (same rules as legacy `PUT /api/decks/:id`).
 */
export const UpdateDeckRequestBody = {
  parse(body: unknown): { ok: true; value: UpdateDeckParsed } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || body === undefined || typeof body !== 'object') {
      return { ok: true, value: {} };
    }
    const o = body as Record<string, unknown>;
    const value: UpdateDeckParsed = {};

    if ('name' in o) {
      const name = o.name;
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return { ok: false, errors: err('name', 'Deck name must be a non-empty string') };
        }
        if (name.length > 100) {
          return { ok: false, errors: err('name', 'Deck name must be 100 characters or less') };
        }
        value.name = name;
      }
    }

    if ('description' in o) {
      const d = o.description;
      if (d !== undefined && d !== null) {
        if (typeof d !== 'string' || d.length > 500) {
          return { ok: false, errors: err('description', 'Description must be a string with 500 characters or less') };
        }
        value.description = d;
      } else if (d === null) {
        value.description = null;
      }
    }

    if ('is_limited' in o && o.is_limited !== undefined) {
      if (typeof o.is_limited !== 'boolean') {
        return { ok: false, errors: err('is_limited', 'is_limited must be a boolean value') };
      }
      value.is_limited = o.is_limited;
    }

    if ('is_valid' in o && o.is_valid !== undefined) {
      if (typeof o.is_valid !== 'boolean') {
        return { ok: false, errors: err('is_valid', 'is_valid must be a boolean value') };
      }
      value.is_valid = o.is_valid;
    }

    if ('is_private' in o && o.is_private !== undefined) {
      if (typeof o.is_private !== 'boolean') {
        return { ok: false, errors: err('is_private', 'is_private must be a boolean value') };
      }
      value.is_private = o.is_private;
    }

    if ('reserve_character' in o) {
      const rc = o.reserve_character;
      if (rc === null) {
        value.reserve_character = null;
      } else if (rc !== undefined) {
        if (typeof rc !== 'string' || rc.length > 50) {
          return { ok: false, errors: err('reserve_character', 'Reserve character must be a string with 50 characters or less') };
        }
        value.reserve_character = rc;
      }
    }

    if ('display_mission_card_id' in o) {
      let dm = o.display_mission_card_id;
      if (dm === '') {
        dm = null;
      }
      if (dm !== undefined && dm !== null) {
        if (typeof dm !== 'string' || dm.length > 50) {
          return {
            ok: false,
            errors: err(
              'display_mission_card_id',
              'display_mission_card_id must be a string with 50 characters or less or null'
            )
          };
        }
        value.display_mission_card_id = dm;
      } else if (dm === null) {
        value.display_mission_card_id = null;
      }
    }

    if ('background_image_path' in o) {
      const bp = o.background_image_path;
      if (bp !== undefined && bp !== null) {
        if (typeof bp !== 'string') {
          return { ok: false, errors: err('background_image_path', 'background_image_path must be a string or null') };
        }
        if (bp.length > 500) {
          return { ok: false, errors: err('background_image_path', 'background_image_path must be 500 characters or less') };
        }
        value.background_image_path = bp;
      } else if (bp === null) {
        value.background_image_path = null;
      }
    }

    return { ok: true, value };
  }
};
