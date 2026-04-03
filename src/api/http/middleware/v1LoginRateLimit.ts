import type { Request, Response, NextFunction } from 'express';
import { sendV1Json } from '../v1Envelope';

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 15;

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Test-only hook to avoid cross-test pollution (see unit tests). */
export function resetV1LoginRateLimitForTests(): void {
  if (process.env.NODE_ENV !== 'test') return;
  buckets.clear();
}

/**
 * Aggressive per-IP rate limit for POST /api/v1/auth/login only.
 */
export function v1LoginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  if (b.count >= MAX_ATTEMPTS) {
    sendV1Json(res, 429, null, [
      {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again later.'
      }
    ]);
    res.setHeader('Retry-After', String(Math.ceil((b.resetAt - now) / 1000)));
    return;
  }
  b.count += 1;
  next();
}
