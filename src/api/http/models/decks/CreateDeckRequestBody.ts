import type { V1ErrorBody } from '../../v1Envelope';

export interface CreateDeckParsedBody {
  name: string;
  description?: string;
  characters?: string[];
}

/**
 * Validated POST /api/v1/decks JSON body (same fields as legacy POST /api/decks).
 */
export class CreateDeckRequestBody {
  readonly name: string;
  readonly description?: string;
  readonly characters?: string[];

  private constructor(name: string, description?: string, characters?: string[]) {
    this.name = name;
    if (description !== undefined) this.description = description;
    if (characters !== undefined) this.characters = characters;
  }

  static parse(body: unknown): { ok: true; value: CreateDeckRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const name = o.name;
    const errors: V1ErrorBody[] = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Deck name is required and must be a non-empty string',
        field: 'name'
      });
    } else if (name.length > 100) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Deck name must be 100 characters or less',
        field: 'name'
      });
    }

    const description = o.description;
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string' || description.length > 500) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: 'Description must be a string with 500 characters or less',
          field: 'description'
        });
      }
    }

    const characters = o.characters;
    if (characters !== undefined && characters !== null) {
      if (!Array.isArray(characters) || characters.length > 50) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: 'Characters must be an array with 50 items or less',
          field: 'characters'
        });
      } else {
        for (let i = 0; i < characters.length; i++) {
          if (typeof characters[i] !== 'string') {
            errors.push({
              code: 'VALIDATION_ERROR',
              message: `characters[${i}] must be a string`,
              field: 'characters'
            });
            break;
          }
        }
      }
    }

    if (errors.length) return { ok: false, errors };

    const desc =
      description === undefined || description === null ? undefined : (description as string);
    const chars =
      characters === undefined || characters === null ? undefined : (characters as string[]);

    return {
      ok: true,
      value: new CreateDeckRequestBody((name as string).trim(), desc, chars)
    };
  }
}
