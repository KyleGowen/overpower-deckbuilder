import type { User, UserRole } from '../../types';
import { isValidEmail } from '../../utils/emailValidation';

type Fail = { ok: false; status: number; code: string; message: string };
type Ok<T> = { ok: true; status: number; data: T };

function fail(status: number, code: string, message: string): Fail {
  return { ok: false, status, code, message };
}

function ok<T>(status: number, data: T): Ok<T> {
  return { ok: true, status, data };
}

export interface UserAccountRepository {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserAuthMeta(id: string): Promise<{ auth_provider: string | null } | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: string, newPlainPassword: string): Promise<boolean>;
}

export type ChangeEmailResult = Ok<{ email: string }> | Fail;
export type ChangePasswordResult = Ok<{ message: string }> | Fail;

function assertSelfServiceRole(role: UserRole | undefined): Fail | null {
  if (!role || (role !== 'USER' && role !== 'ADMIN')) {
    return fail(403, 'FORBIDDEN', 'Only USER or ADMIN may change account settings');
  }
  return null;
}

/**
 * Self-service account updates (change email, change password) for v1 and legacy HTTP.
 */
export class UserAccountService {
  constructor(private readonly userRepository: UserAccountRepository) {}

  async changeEmail(
    userId: string,
    role: UserRole | undefined,
    newEmail: string
  ): Promise<ChangeEmailResult> {
    const roleError = assertSelfServiceRole(role);
    if (roleError) return roleError;

    const trimmed = newEmail.trim();
    if (!trimmed) {
      return fail(400, 'EMAIL_REQUIRED', 'Email is required');
    }
    if (!isValidEmail(trimmed)) {
      return fail(400, 'EMAIL_INVALID', 'Invalid email format');
    }

    const current = await this.userRepository.getUserById(userId);
    if (!current) {
      return fail(404, 'USER_NOT_FOUND', 'User not found');
    }
    if (current.email === trimmed) {
      return fail(400, 'EMAIL_UNCHANGED', 'New email must differ from current email');
    }

    const authMeta = await this.userRepository.getUserAuthMeta(userId);
    if (authMeta?.auth_provider === 'google') {
      return fail(403, 'GOOGLE_EMAIL_LOCKED', 'Email cannot be changed for Google-linked accounts');
    }

    const existing = await this.userRepository.getUserByEmail(trimmed);
    if (existing && existing.id !== userId) {
      return fail(409, 'EMAIL_TAKEN', 'Email is already in use');
    }

    const updated = await this.userRepository.updateUser(userId, { email: trimmed });
    if (!updated) {
      return fail(404, 'USER_NOT_FOUND', 'User not found');
    }

    return ok(200, { email: updated.email });
  }

  async changePassword(
    userId: string,
    role: UserRole | undefined,
    newPassword: string,
    confirmPassword: string
  ): Promise<ChangePasswordResult> {
    const roleError = assertSelfServiceRole(role);
    if (roleError) return roleError;

    if (!newPassword || typeof newPassword !== 'string') {
      return fail(400, 'PASSWORD_REQUIRED', 'New password is required');
    }
    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return fail(400, 'PASSWORD_REQUIRED', 'Confirm password is required');
    }
    if (newPassword !== confirmPassword) {
      return fail(400, 'PASSWORD_MISMATCH', 'Passwords do not match.');
    }

    const authMeta = await this.userRepository.getUserAuthMeta(userId);
    if (authMeta?.auth_provider === 'google') {
      return fail(403, 'GOOGLE_PASSWORD_LOCKED', 'Password cannot be changed for Google-linked accounts');
    }

    const updated = await this.userRepository.updateUserPassword(userId, newPassword);
    if (!updated) {
      return fail(404, 'USER_NOT_FOUND', 'User not found');
    }

    return ok(200, { message: 'Password updated' });
  }
}
