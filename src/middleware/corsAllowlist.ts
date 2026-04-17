import cors, { CorsOptions } from 'cors';
import type { RequestHandler } from 'express';

/**
 * CORS middleware with an allowlist read from the `ALLOWED_ORIGINS` env var
 * (comma-separated). Same-origin requests (no `Origin` header) always pass.
 * Unknown origins get a normal pass-through response without the ACAO header,
 * which the browser treats as "blocked".
 *
 * Kill switch: `DISABLE_CORS=1` short-circuits to a no-op so callers fall back
 * to same-origin-only behavior.
 *
 * See `docs/current/API_V1_CORS.md` for how to register a new origin.
 */
export function createCorsMiddleware(): RequestHandler {
  if (process.env.DISABLE_CORS === '1') {
    return (_req, _res, next) => next();
  }

  const raw = process.env.ALLOWED_ORIGINS ?? '';
  const allowlist = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const options: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowlist.includes(origin) || allowlist.includes('*')) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600,
  };

  return cors(options);
}

/**
 * Test helper — returns the current allowlist as parsed from the env.
 */
export function getCorsAllowlistForTests(): string[] {
  const raw = process.env.ALLOWED_ORIGINS ?? '';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}
