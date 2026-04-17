import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Pool } from 'pg';

/**
 * Phase 2 §6.1.6 — asynchronous /api/v1/* access log.
 *
 * The middleware hooks `res.on('finish')` and fires a `fire-and-forget`
 * INSERT into `api_access_log`. The request path is never blocked on the
 * write. Retention is 90 days, enforced by an out-of-band scheduled job.
 *
 * Kill switch: `DISABLE_API_ACCESS_LOG=1` → no-op.
 */
export interface ApiAccessLogDeps {
  pool: Pool;
}

export function createApiAccessLogMiddleware(deps: ApiAccessLogDeps): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.DISABLE_API_ACCESS_LOG === '1') {
      next();
      return;
    }

    res.on('finish', () => {
      const userId = req.user?.id ?? null;
      const routeKey = `${req.method} ${req.route?.path ?? req.baseUrl + (req.path ?? '')}`;
      const requestId = (req as Request & { id?: string }).id ?? null;
      const ip = typeof req.ip === 'string' ? req.ip.slice(0, 64) : null;

      deps.pool
        .query(
          `INSERT INTO api_access_log (user_id, route_key, method, status, ip, request_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, routeKey, req.method, res.statusCode, ip, requestId]
        )
        .catch((err) => {
          // Never let log writes bubble up — metrics are best-effort.
          console.error('api_access_log insert failed:', err instanceof Error ? err.message : err);
        });
    });

    next();
  };
}
