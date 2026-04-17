import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Request-ID middleware.
 *
 * Accepts an incoming `X-Request-Id` if the client sends one (up to 128 chars,
 * printable ASCII only) and falls back to a fresh UUIDv4. The value is exposed
 * on `req.id` for downstream consumers (pino-http reads it) and echoed on the
 * response so callers can correlate logs.
 *
 * See `docs/current/API_V1_LOGGING.md` for the logging contract.
 */
const SAFE_ID = /^[A-Za-z0-9._~+/=-]{1,128}$/;

export type RequestWithId = Request & { id: string };

export function createRequestIdMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.header('x-request-id');
    const id = incoming && SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
    (req as RequestWithId).id = id;
    res.setHeader('X-Request-Id', id);
    next();
  };
}
