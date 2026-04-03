import { expiresInToSeconds, resolveJwtConfig } from '../../../../src/api/config/jwtConfig';

describe('jwtConfig', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevSecret = process.env.JWT_SECRET;
  const prevExp = process.env.JWT_EXPIRES_IN;

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    process.env.JWT_SECRET = prevSecret;
    process.env.JWT_EXPIRES_IN = prevExp;
  });

  it('expiresInToSeconds parses hours', () => {
    expect(expiresInToSeconds('2h')).toBe(7200);
    expect(expiresInToSeconds('15m')).toBe(900);
  });

  it('throws in production when JWT_SECRET missing', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    expect(() => resolveJwtConfig()).toThrow(/JWT_SECRET/);
  });

  it('allows dev fallback when not production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    const c = resolveJwtConfig();
    expect(c.secret.length).toBeGreaterThan(10);
    expect(c.expiresIn).toBeTruthy();
  });
});
