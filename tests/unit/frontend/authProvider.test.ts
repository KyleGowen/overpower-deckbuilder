import { resolveAuthProvider } from '../../../frontend/src/lib/auth/resolveAuthProvider';

describe('resolveAuthProvider', () => {
  it('defaults to password when absent', () => {
    expect(resolveAuthProvider(null)).toBe('password');
    expect(resolveAuthProvider({})).toBe('password');
  });

  it('prefers camelCase authProvider', () => {
    expect(resolveAuthProvider({ authProvider: 'google' })).toBe('google');
  });

  it('falls back to snake_case auth_provider', () => {
    expect(resolveAuthProvider({ auth_provider: 'google' })).toBe('google');
  });
});

describe('profile menu account settings gate', () => {
  function canChangeAccountSettings(isGuest: boolean, authProvider: string): boolean {
    return !isGuest && authProvider !== 'google';
  }

  it('allows password users', () => {
    expect(canChangeAccountSettings(false, 'password')).toBe(true);
  });

  it('blocks Google users', () => {
    expect(canChangeAccountSettings(false, 'google')).toBe(false);
  });

  it('blocks guests', () => {
    expect(canChangeAccountSettings(true, 'password')).toBe(false);
  });
});
