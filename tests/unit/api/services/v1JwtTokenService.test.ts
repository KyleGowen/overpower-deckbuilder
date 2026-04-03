import { V1JwtTokenService } from '../../../../src/api/services/v1JwtTokenService';
import type { User } from '../../../../src/types';

describe('V1JwtTokenService', () => {
  const user: User = {
    id: 'user-1',
    name: 'tester',
    email: 't@example.com',
    role: 'USER',
    lastLoginAt: null
  };

  it('signs and verifies access token', () => {
    const svc = new V1JwtTokenService({ secret: 'test-secret-key-min-len', expiresIn: '1h' });
    const { token } = svc.signAccessToken(user);
    const payload = svc.verifyAccessToken(token);
    expect(payload.sub).toBe(user.id);
    expect(payload.role).toBe('USER');
  });

  it('rejects invalid token', () => {
    const svc = new V1JwtTokenService({ secret: 'test-secret-key-min-len', expiresIn: '1h' });
    expect(() => svc.verifyAccessToken('not-a-jwt')).toThrow();
  });
});
