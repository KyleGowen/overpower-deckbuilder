import { buildSessionCookieOptions } from '../../src/services/authCookieOptions';
import { Request } from 'express';

function mockReq(secure: boolean): Request {
  return { secure } as unknown as Request;
}

const MAX_AGE = 24 * 60 * 60 * 1000;

describe('buildSessionCookieOptions', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns hardened options when req.secure is true (HTTPS)', () => {
    delete process.env.NODE_ENV;
    delete process.env.COOKIE_SECURE;
    delete process.env.DISABLE_SECURE_COOKIES;
    const opts = buildSessionCookieOptions(mockReq(true), MAX_AGE);
    expect(opts).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: MAX_AGE,
    });
  });

  it('returns hardened options when NODE_ENV=production even on HTTP request', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.COOKIE_SECURE;
    delete process.env.DISABLE_SECURE_COOKIES;
    const opts = buildSessionCookieOptions(mockReq(false), MAX_AGE);
    expect(opts).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: MAX_AGE,
    });
  });

  it('returns legacy options in dev on HTTP', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.COOKIE_SECURE;
    delete process.env.DISABLE_SECURE_COOKIES;
    const opts = buildSessionCookieOptions(mockReq(false), MAX_AGE);
    expect(opts).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: MAX_AGE,
    });
  });

  it('respects legacy COOKIE_SECURE=true flag in dev', () => {
    process.env.NODE_ENV = 'development';
    process.env.COOKIE_SECURE = 'true';
    delete process.env.DISABLE_SECURE_COOKIES;
    const opts = buildSessionCookieOptions(mockReq(false), MAX_AGE);
    expect(opts.secure).toBe(true);
    expect(opts.sameSite).toBe('strict');
  });

  it('DISABLE_SECURE_COOKIES=1 short-circuits to legacy behavior', () => {
    process.env.NODE_ENV = 'production';
    process.env.DISABLE_SECURE_COOKIES = '1';
    delete process.env.COOKIE_SECURE;
    const opts = buildSessionCookieOptions(mockReq(true), MAX_AGE);
    expect(opts).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: MAX_AGE,
    });
  });

  it('DISABLE_SECURE_COOKIES=1 still honors COOKIE_SECURE for legacy secure-only flag', () => {
    process.env.NODE_ENV = 'production';
    process.env.DISABLE_SECURE_COOKIES = '1';
    process.env.COOKIE_SECURE = 'true';
    const opts = buildSessionCookieOptions(mockReq(true), MAX_AGE);
    expect(opts).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: MAX_AGE,
    });
  });
});
