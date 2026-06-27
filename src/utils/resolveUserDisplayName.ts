/**
 * Single source of truth for the public name shown for a user everywhere in the app.
 *
 * Resolution (deliberate asymmetry between password and SSO users):
 * - If `displayName` is set (non-empty) → use it.
 * - Otherwise, SSO (`google`) users fall back to their `email` until they set one.
 * - Otherwise (password users) → their `username` (mapped to `name`), which is their
 *   editable, globally-unique login id.
 */
export interface DisplayNameUser {
  name?: string | null;
  email?: string | null;
  displayName?: string | null;
  authProvider?: string | null;
}

export function resolveUserDisplayName(user: DisplayNameUser | null | undefined): string {
  if (!user) return 'User';
  const displayName = typeof user.displayName === 'string' ? user.displayName.trim() : '';
  if (displayName) return displayName;
  const isSso = (user.authProvider ?? 'password') === 'google';
  if (isSso) {
    const email = typeof user.email === 'string' ? user.email.trim() : '';
    if (email) return email;
  }
  const name = typeof user.name === 'string' ? user.name.trim() : '';
  return name || 'User';
}
