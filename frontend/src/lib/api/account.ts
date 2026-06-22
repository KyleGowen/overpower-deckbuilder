import { api } from './client';

export async function changeEmail(email: string): Promise<{ email: string }> {
  return api.post<{ email: string }>('/api/v1/users/change-email', { email });
}

export async function changePassword(
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/api/v1/users/change-password', {
    newPassword,
    confirmPassword,
  });
}
