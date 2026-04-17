import type { Request, CookieOptions } from 'express';

/**
 * Build the cookie options for the `sessionId` session cookie.
 *
 * In production (or whenever the request arrived over HTTPS, which becomes the
 * common case once Phase 0 of the HTTPS rollout lands) we emit
 * `{ httpOnly, secure, sameSite: 'strict' }`. Local dev over plain HTTP keeps
 * the legacy `sameSite: 'lax'` + `secure: false` so the cookie still round-trips.
 *
 * Kill switch: setting `DISABLE_SECURE_COOKIES=1` forces the legacy
 * `secure: false`, `sameSite: 'lax'` options regardless of request. Use this
 * only as an emergency rollback during the Phase 0 HTTPS cutover — see
 * `docs/current/OPS_TLS_AND_HTTPS.md`.
 *
 * NOTE: callers must pass a valid Express request so `req.secure` can be read.
 * `req.secure` relies on `app.set('trust proxy', 1)` in `src/index.ts` because
 * TLS terminates at CloudFront + nginx, not the Node process.
 */
export function buildSessionCookieOptions(req: Request, maxAge: number): CookieOptions {
  const killSwitch = process.env.DISABLE_SECURE_COOKIES === '1';
  const legacyFlag = process.env.COOKIE_SECURE === 'true';
  const isProd = process.env.NODE_ENV === 'production';

  if (killSwitch) {
    return {
      httpOnly: true,
      secure: legacyFlag,
      sameSite: 'lax',
      maxAge,
    };
  }

  const httpsRequest = Boolean(req.secure);
  const shouldHarden = httpsRequest || isProd || legacyFlag;

  if (shouldHarden) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge,
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge,
  };
}
