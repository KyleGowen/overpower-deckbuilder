import type { UserRole } from '../../../types';

/**
 * v1 POST /auth/login success payload inside envelope `data`.
 */
export interface LoginSuccessDataDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}
