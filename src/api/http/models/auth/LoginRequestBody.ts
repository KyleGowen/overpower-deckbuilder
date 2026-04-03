import type { V1ErrorBody } from '../../v1Envelope';

/**
 * Validated POST /api/v1/auth/login JSON body.
 */
export class LoginRequestBody {
  readonly username: string;
  readonly password: string;

  private constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static parse(body: unknown): { ok: true; value: LoginRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const username = o.username;
    const password = o.password;
    const errors: V1ErrorBody[] = [];
    if (typeof username !== 'string' || !username.trim()) {
      errors.push({ code: 'VALIDATION_ERROR', message: 'Username is required', field: 'username' });
    }
    if (typeof password !== 'string' || password.length === 0) {
      errors.push({ code: 'VALIDATION_ERROR', message: 'Password is required', field: 'password' });
    }
    if (errors.length) return { ok: false, errors };
    return { ok: true, value: new LoginRequestBody((username as string).trim(), password as string) };
  }
}
