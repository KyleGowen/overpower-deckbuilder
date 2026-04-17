import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Security headers via `helmet`.
 *
 * What is emitted (see `docs/current/API_V1_SECURITY_HEADERS.md`):
 * - `Strict-Transport-Security` (1 year, includeSubDomains). Ignored by
 *   browsers on HTTP; becomes effective once Phase 0 HTTPS is live.
 * - `X-Content-Type-Options: nosniff`
 * - `Referrer-Policy: strict-origin-when-cross-origin`
 * - `X-Frame-Options: DENY`
 * - `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` at helmet
 *   defaults.
 *
 * CSP is intentionally disabled — the current HTML shell uses inline scripts
 * and setting CSP would break the app. Tracked as a future item.
 *
 * Kill switch: `DISABLE_HELMET=1` short-circuits to a no-op.
 */
export function createSecurityHeadersMiddleware(): RequestHandler {
  if (process.env.DISABLE_HELMET === '1') {
    return (_req, _res, next) => next();
  }

  return helmet({
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 60 * 60 * 24 * 365,
      includeSubDomains: true,
      preload: false,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    xContentTypeOptions: true,
  });
}
