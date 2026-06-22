import type { V1ErrorBody } from '../../v1Envelope';

/**
 * Validated POST /api/v1/users/change-password JSON body.
 */
export class ChangePasswordRequestBody {
  readonly newPassword: string;
  readonly confirmPassword: string;

  private constructor(newPassword: string, confirmPassword: string) {
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }

  static parse(body: unknown): { ok: true; value: ChangePasswordRequestBody } | { ok: false; errors: V1ErrorBody[] } {
    if (body === null || typeof body !== 'object') {
      return { ok: false, errors: [{ code: 'VALIDATION_ERROR', message: 'JSON body is required' }] };
    }
    const o = body as Record<string, unknown>;
    const newPassword = o.newPassword;
    const confirmPassword = o.confirmPassword;
    const errors: V1ErrorBody[] = [];
    if (typeof newPassword !== 'string' || newPassword.length === 0) {
      errors.push({ code: 'VALIDATION_ERROR', message: 'New password is required', field: 'newPassword' });
    }
    if (typeof confirmPassword !== 'string' || confirmPassword.length === 0) {
      errors.push({ code: 'VALIDATION_ERROR', message: 'Confirm password is required', field: 'confirmPassword' });
    }
    if (errors.length) return { ok: false, errors };
    return {
      ok: true,
      value: new ChangePasswordRequestBody(newPassword as string, confirmPassword as string)
    };
  }
}
