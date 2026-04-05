import type { V1ErrorBody } from '../../v1Envelope';

export interface CreateAdminUserParsed {
  username: string;
  password: string;
}

export class CreateAdminUserBody {
  static parse(body: unknown): { ok: true; value: CreateAdminUserParsed } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }]
      };
    }
    const o = body as Record<string, unknown>;
    const username = o.username;
    const password = o.password;
    const errors: V1ErrorBody[] = [];
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Username and password are required',
        field: 'username'
      });
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Username and password are required',
        field: 'password'
      });
    }
    if (errors.length) return { ok: false, errors };
    return { ok: true, value: { username: (username as string).trim(), password: password as string } };
  }
}
