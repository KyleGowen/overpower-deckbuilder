import type { Request, CookieOptions } from 'express';

/**
 * Build the cookie options for the `sessionId` session cookie.
 *
 * Hardening (`{ secure: true, sameSite: 'strict' }`) is emitted ONLY when the
 * operator explicitly opts in with `COOKIE_SECURE=true`. Otherwise we always
 * return the HTTP-safe `{ secure: false, sameSite: 'lax' }` options so the
 * cookie round-trips on plain HTTP — for local dev AND for the production site
 * which currently runs on HTTP.
 *
 * Why this is decoupled from `req.secure`: deciding per-request based on
 * `req.secure` (which follows `X-Forwarded-Proto` once `trust proxy` is on)
 * made the cookie attributes flap. A browser pinned to HTTPS by a leftover
 * HSTS header (from earlier TLS experiments), or any proxy presenting a request
 * as HTTPS, would get a `Secure` cookie that the browser then refuses to send
 * back over plain HTTP — the session silently vanishes and the user appears to
 * be "randomly" logged out mid-session. Keying solely on the explicit
 * `COOKIE_SECURE` flag makes the cookie attributes deterministic regardless of
 * proxy/HSTS state.
 *
 * Forward-compatible: when you do a real HTTPS cutover, set `COOKIE_SECURE=true`
 * on the container (this also re-enables HSTS in `securityHeaders.ts`).
 *
 * Kill switch: setting `DISABLE_SECURE_COOKIES=1` forces the legacy
 * `sameSite: 'lax'` options regardless of request (with `secure` driven by
 * `COOKIE_SECURE`). Use this only as an emergency rollback.
 *
 * NOTE: the `_req` param is retained for call-site compatibility but is no
 * longer used to decide cookie attributes.
 */
export function buildSessionCookieOptions(_req: Request, maxAge: number): CookieOptions {
  const killSwitch = process.env.DISABLE_SECURE_COOKIES === '1';
  const secureOptIn = process.env.COOKIE_SECURE === 'true';

  if (killSwitch) {
    return {
      httpOnly: true,
      secure: secureOptIn,
      sameSite: 'lax',
      maxAge,
    };
  }

  if (secureOptIn) {
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

/**
 * Options for `res.clearCookie('sessionId', ...)`.
 *
 * `clearCookie` only reliably removes a cookie when the attributes (path,
 * secure, sameSite, httpOnly) match those used at `res.cookie`. We reuse
 * `buildSessionCookieOptions` and drop `maxAge` (Express sets an expired date).
 */
export function clearSessionCookieOptions(req: Request): CookieOptions {
  const opts = buildSessionCookieOptions(req, 0);
  delete opts.maxAge;
  return opts;
}
