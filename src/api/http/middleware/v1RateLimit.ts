import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { sendV1Json } from '../v1Envelope';

/**
 * Phase 2 §6.1.8 — consolidated per-user/IP rate limits for `/api/v1/*`.
 *
 * Buckets are keyed by `user_id` when an authenticated principal is attached
 * (session or Bearer), else by client IP. Every response — success or 429 —
 * carries `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`
 * headers so clients can back off gracefully.
 *
 * Kill switch: `DISABLE_V1_RATE_LIMIT=1` → no-op (responses still pass but no
 * headers). `LEGACY_RATE_LIMITS=1` is checked by the composition root to keep
 * the old `v1LoginRateLimit` + `checkRateLimit` paths.
 *
 * Per-route budgets live in `V1_RATE_LIMIT_BUDGETS`; new routes should add an
 * entry (see `docs/current/API_V1_RATE_LIMITS.md`).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;

/**
 * Default budgets per route group (requests per WINDOW_MS). Keys are matched
 * against the middleware's `routeKey` option — usually `<METHOD> <pattern>`.
 */
export interface RateLimitBudget {
  limit: number;
  windowMs: number;
}

const DEFAULT_BUDGETS: Record<string, RateLimitBudget> = {
  default: { limit: 120, windowMs: WINDOW_MS },
  login: { limit: 15, windowMs: WINDOW_MS },
  mutation: { limit: 60, windowMs: WINDOW_MS }
};

const buckets = new Map<string, Bucket>();

export function resetV1RateLimitBucketsForTests(): void {
  if (process.env.NODE_ENV !== 'test') return;
  buckets.clear();
}

function getBucketKey(req: Request, routeKey: string): string {
  const principal = req.user?.id ?? null;
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return principal ? `u:${principal}:${routeKey}` : `ip:${ip}:${routeKey}`;
}

export interface CreateV1RateLimitOptions {
  routeKey: string;
  budget?: RateLimitBudget;
}

export function createV1RateLimit(options: CreateV1RateLimitOptions): RequestHandler {
  const budget =
    options.budget ?? DEFAULT_BUDGETS[options.routeKey] ?? DEFAULT_BUDGETS.default;

  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.DISABLE_V1_RATE_LIMIT === '1') {
      next();
      return;
    }

    const key = getBucketKey(req, options.routeKey);
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + budget.windowMs };
      buckets.set(key, bucket);
    }

    const remainingBefore = Math.max(0, budget.limit - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(budget.limit));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(bucket.resetAt / 1000)));

    if (bucket.count >= budget.limit) {
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      sendV1Json(res, 429, null, [
        { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' }
      ]);
      return;
    }

    bucket.count += 1;
    res.setHeader('X-RateLimit-Remaining', String(remainingBefore - 1));
    next();
  };
}

/** Shortcut for tests or ad-hoc wiring. */
export function getDefaultBudgets(): Record<string, RateLimitBudget> {
  return { ...DEFAULT_BUDGETS };
}
