import { resolveUserDisplayName } from '../../../src/utils/resolveUserDisplayName';

describe('resolveUserDisplayName', () => {
  it('returns "User" for null/undefined', () => {
    expect(resolveUserDisplayName(null)).toBe('User');
    expect(resolveUserDisplayName(undefined)).toBe('User');
  });

  it('prefers a non-empty displayName for any provider', () => {
    expect(
      resolveUserDisplayName({ name: 'login', displayName: 'Cool Name', authProvider: 'password' })
    ).toBe('Cool Name');
    expect(
      resolveUserDisplayName({ email: 'a@b.com', displayName: 'Cool Name', authProvider: 'google' })
    ).toBe('Cool Name');
  });

  it('trims displayName whitespace', () => {
    expect(resolveUserDisplayName({ displayName: '  Spaced  ', name: 'login' })).toBe('Spaced');
  });

  it('password users without displayName fall back to username (name)', () => {
    expect(
      resolveUserDisplayName({ name: 'kyle', email: 'k@b.com', authProvider: 'password' })
    ).toBe('kyle');
  });

  it('treats missing authProvider as a password user', () => {
    expect(resolveUserDisplayName({ name: 'kyle', email: 'k@b.com' })).toBe('kyle');
  });

  it('SSO users without displayName fall back to email', () => {
    expect(
      resolveUserDisplayName({ name: 'sso-login', email: 'sso@b.com', authProvider: 'google' })
    ).toBe('sso@b.com');
  });

  it('SSO users with no email and no displayName fall back to name', () => {
    expect(resolveUserDisplayName({ name: 'sso-login', authProvider: 'google' })).toBe('sso-login');
  });

  it('blank displayName is ignored (falls through to fallback)', () => {
    expect(resolveUserDisplayName({ displayName: '   ', name: 'kyle' })).toBe('kyle');
  });

  it('returns "User" when nothing resolvable is present', () => {
    expect(resolveUserDisplayName({ authProvider: 'google' })).toBe('User');
  });
});
