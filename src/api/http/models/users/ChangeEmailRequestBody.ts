import type { V1ErrorBody } from '../../v1Envelope';

/**
 * Validated POST /api/v1/users/change-email JSON body.
 */
export class ChangeEmailRequestBody {
  readonly email: string;

  private constructor(email: string) {
    this.email = email;
  }

  static parse(body: unknown): { ok: true; value: ChangeEmailRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const email = o.email;
    if (typeof email !== 'string' || !email.trim()) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION_ERROR', message: 'Email is required', field: 'email' }]
      };
    }
    return { ok: true, value: new ChangeEmailRequestBody(email.trim()) };
  }
}
