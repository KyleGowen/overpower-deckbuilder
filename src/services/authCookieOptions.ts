import type { Request, CookieOptions } from 'express';

/**
 * Build the cookie options for the `sessionId` session cookie.
 *
 * We emit `{ httpOnly, secure, sameSite: 'strict' }` when the request actually
 * arrived over HTTPS (`req.secure === true`), or when the operator explicitly
 * opts in with `COOKIE_SECURE=true`. Otherwise we return the legacy
 * `sameSite: 'lax'` + `secure: false` options so the cookie still round-trips
 * on plain HTTP — this matters both for local dev AND for production
 * deployments that have not yet enabled TLS at the edge (Phase 0 of the HTTPS
 * rollout — see `docs/current/OPS_TLS_AND_HTTPS.md`).
 *
 * Gotcha: keying on `NODE_ENV === 'production'` instead of `req.secure` was
 * what caused the `http://excelsior.cards` login outage — the browser silently
 * dropped `Set-Cookie: ...; Secure` on HTTP, so the session never persisted.
 * Once HTTPS is live, set `COOKIE_SECURE=true` on the container to force
 * hardening even if `trust proxy` / `X-Forwarded-Proto` ever regress.
 *
 * Kill switch: setting `DISABLE_SECURE_COOKIES=1` forces the legacy
 * `sameSite: 'lax'` options regardless of request (with `secure` driven by
 * `COOKIE_SECURE`). Use this only as an emergency rollback.
 *
 * NOTE: callers must pass a valid Express request so `req.secure` can be read.
 * `req.secure` relies on `app.set('trust proxy', 1)` in `src/index.ts` because
 * TLS terminates at CloudFront + nginx, not the Node process.
 */
export function buildSessionCookieOptions(req: Request, maxAge: number): CookieOptions {
  const killSwitch = process.env.DISABLE_SECURE_COOKIES === '1';
  const legacyFlag = process.env.COOKIE_SECURE === 'true';

  if (killSwitch) {
    return {
      httpOnly: true,
      secure: legacyFlag,
      sameSite: 'lax',
      maxAge,
    };
  }

  const httpsRequest = Boolean(req.secure);
  const shouldHarden = httpsRequest || legacyFlag;

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
