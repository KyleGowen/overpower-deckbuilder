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
 * - `Cross-Origin-Opener-Policy` at helmet default (`same-origin`).
 * - `Cross-Origin-Resource-Policy: cross-origin` (explicit override of helmet's
 *   `same-origin` default). Required because deck-tile CSS `background-image`
 *   URLs are served from the CloudFront asset host
 *   (`d6vp4hrkfkf5v.cloudfront.net`) while the HTML app is served from
 *   `excelsior.cards`; `same-origin` CORP blocks those loads with
 *   `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`.
 *
 * CSP is intentionally disabled — the current HTML shell uses inline scripts
 * and setting CSP would break the app. Tracked as a future item.
 *
 * `Origin-Agent-Cluster` is intentionally disabled. Helmet v8 sends `?1` by
 * default, but nothing on this origin relies on origin-keyed agent clusters,
 * and emitting it inconsistently (e.g. across pages a browser has already
 * placed in a site-keyed cluster) produces a console warning. Turning it off
 * is the cleanest way to keep headers uniform across the origin.
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
    originAgentCluster: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
}
