import type { UserRole } from '../../../types';

/**
 * v1 GET /auth/me — `data` field.
 */
export interface AuthMeDataDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  lastLoginAt: string | null;
}
