import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { createV1BearerAuthMiddleware, type V1BearerAuthDeps } from './v1BearerAuth';

export interface V1SessionOrBearerAuthDeps extends V1BearerAuthDeps {
  /** Session cookie auth (same as decks/collections); used when no `Authorization: Bearer` is sent. */
  authenticateUser: RequestHandler;
}

/**
 * DBV catalog and support: **session cookie** (main web app) or **Bearer JWT** (API clients).
 * If `Authorization` starts with `Bearer`, JWT is verified; otherwise `authenticateUser` runs.
 */
export function createV1SessionOrBearerAuthMiddleware(deps: V1SessionOrBearerAuthDeps): RequestHandler {
  const bearer = createV1BearerAuthMiddleware(deps);
  return (req: Request, res: Response, next: NextFunction): unknown => {
    const header = req.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return bearer(req, res, next);
    }
    return deps.authenticateUser(req, res, next);
  };
}
