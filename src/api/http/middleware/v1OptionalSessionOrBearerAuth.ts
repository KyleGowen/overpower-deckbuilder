import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { V1BearerAuthDeps } from './v1BearerAuth';

export interface V1OptionalSessionOrBearerAuthDeps extends V1BearerAuthDeps {
  /** Optional session auth: attaches `req.user` if a valid session exists, never rejects. */
  optionalAuthenticate: RequestHandler;
}

/**
 * Guest-viewable v1 routes (community feed, public profiles). Attaches `req.user`
 * when a valid Bearer JWT or session cookie is present, but NEVER rejects — an
 * unauthenticated request proceeds as a guest (`req.user` left undefined).
 */
export function createV1OptionalSessionOrBearerAuthMiddleware(
  deps: V1OptionalSessionOrBearerAuthDeps
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      const token = header.slice('Bearer '.length).trim();
      if (token) {
        try {
          const payload = deps.jwtTokenService.verifyAccessToken(token);
          const user = await deps.getUserById(payload.sub);
          if (user) req.user = user;
        } catch {
          // Invalid token → proceed as guest.
        }
      }
      next();
      return;
    }
    deps.optionalAuthenticate(req, res, next);
  };
}
