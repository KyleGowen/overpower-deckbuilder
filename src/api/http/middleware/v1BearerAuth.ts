import type { Request, Response, NextFunction } from 'express';
import type { User } from '../../../types';
import { V1JwtTokenService } from '../../services/v1JwtTokenService';
import { sendV1Json } from '../v1Envelope';

export interface V1BearerAuthDeps {
  jwtTokenService: V1JwtTokenService;
  getUserById: (id: string) => Promise<User | null | undefined>;
}

export function createV1BearerAuthMiddleware(deps: V1BearerAuthDeps) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message: 'Bearer token required' }]);
      return;
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message: 'Bearer token required' }]);
      return;
    }
    try {
      const payload = deps.jwtTokenService.verifyAccessToken(token);
      const user = await deps.getUserById(payload.sub);
      if (!user) {
        sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message: 'Invalid or expired token' }]);
        return;
      }
      req.user = user;
      next();
    } catch {
      sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message: 'Invalid or expired token' }]);
    }
  };
}
