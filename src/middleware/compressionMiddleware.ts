import compression, { type CompressionFilter } from 'compression';
import type { RequestHandler } from 'express';

/**
 * Phase 3 §7.1.4 — response compression.
 *
 * Uses `compression` which negotiates gzip and (on newer Node versions) brotli
 * via `Accept-Encoding`. Responses smaller than 1 KiB are not compressed.
 *
 * Kill switch: `DISABLE_COMPRESSION=1` → no-op middleware.
 */
const filter: CompressionFilter = (req, res) => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
};

export function createCompressionMiddleware(): RequestHandler {
  if (process.env.DISABLE_COMPRESSION === '1') {
    return (_req, _res, next) => next();
  }
  return compression({ filter, threshold: 1024 });
}
