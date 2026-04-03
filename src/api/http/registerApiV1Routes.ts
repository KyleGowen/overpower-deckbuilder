import type { Application, IRouter } from 'express';
import express from 'express';
import type { AuthenticationService } from '../../services/AuthenticationService';
import type { UserRole } from '../../types';
import { resolveJwtConfig } from '../config/jwtConfig';
import { V1JwtTokenService } from '../services/v1JwtTokenService';
import { CatalogService } from '../services/catalogService';
import { registerAuthV1HttpRoutes } from './auth.http';
import { registerDbvCatalogV1HttpRoutes } from './dbv-catalog.http';

export interface RegisterApiV1Deps {
  authenticationService: AuthenticationService;
  userRepository: {
    getUserById: (id: string) => Promise<
      | { id: string; name: string; email: string; role: UserRole; lastLoginAt?: Date | null }
      | undefined
      | null
    >;
    updateLastLoginAt: (id: string) => Promise<void>;
  };
  catalogService: CatalogService;
}

/**
 * Returns the `/api/v1` router (no mount). Use for tests, or mount on a standalone app at `/api/v1`.
 */
export function createApiV1Router(deps: RegisterApiV1Deps): IRouter {
  const jwtConfig = resolveJwtConfig();
  const jwtTokenService = new V1JwtTokenService(jwtConfig);
  const router = express.Router();

  registerAuthV1HttpRoutes(router, {
    authenticationService: deps.authenticationService,
    userRepository: deps.userRepository,
    jwtTokenService
  });

  registerDbvCatalogV1HttpRoutes(router, {
    catalogService: deps.catalogService
  });

  return router;
}

/**
 * Mounts `/api/v1` JSON API (Bearer JWT + v1 envelope). Call from composition root after `setupMiddleware`.
 */
export function registerApiV1Routes(app: Application, deps: RegisterApiV1Deps): void {
  app.use('/api/v1', createApiV1Router(deps));
}
