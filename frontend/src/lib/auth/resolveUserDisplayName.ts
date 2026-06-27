import type { AppUser } from '../api/types';

/**
 * Single source of truth for the public name shown for a user across the SPA.
 * Mirrors the backend `resolveUserDisplayName`:
 * - `displayName` if set (non-empty)
 * - else SSO (`google`) users fall back to `email` until they set a display name
 * - else the `username` (password users' editable, unique login id)
 */
export function resolveUserDisplayName(
  user: Pick<AppUser, 'username' | 'email' | 'displayName' | 'authProvider'> | null | undefined,
): string {
  if (!user) return 'User';
  const displayName = typeof user.displayName === 'string' ? user.displayName.trim() : '';
  if (displayName) return displayName;
  if ((user.authProvider ?? 'password') === 'google') {
    const email = typeof user.email === 'string' ? user.email.trim() : '';
    if (email) return email;
  }
  const username = typeof user.username === 'string' ? user.username.trim() : '';
  return username || 'User';
}
