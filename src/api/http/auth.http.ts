import type { Router } from 'express';
import type { AuthenticationService } from '../../services/AuthenticationService';
import { V1JwtTokenService } from '../services/v1JwtTokenService';
import { LoginRequestBody } from './models/auth/LoginRequestBody';
import { sendV1Json, sendV1Success } from './v1Envelope';
import { v1LoginRateLimit } from './middleware/v1LoginRateLimit';
import { createV1BearerAuthMiddleware } from './middleware/v1BearerAuth';
import type { LoginSuccessDataDto } from '../dto/v1/LoginSuccessDataDto';
import type { AuthMeDataDto } from '../dto/v1/AuthMeDataDto';

export interface AuthV1HttpDeps {
  authenticationService: AuthenticationService;
  userRepository: {
    getUserById: (id: string) => Promise<
      | {
          id: string;
          name: string;
          email: string;
          role: AuthMeDataDto['role'];
          lastLoginAt?: Date | null;
        }
      | undefined
      | null
    >;
    updateLastLoginAt: (id: string) => Promise<void>;
  };
  jwtTokenService: V1JwtTokenService;
}

export function registerAuthV1HttpRoutes(router: Router, deps: AuthV1HttpDeps): void {
  const bearerAuth = createV1BearerAuthMiddleware({
    jwtTokenService: deps.jwtTokenService,
    getUserById: async (id: string) => {
      const u = await deps.userRepository.getUserById(id);
      return u ?? null;
    }
  });

  router.post('/auth/login', v1LoginRateLimit, async (req, res) => {
    const parsed = LoginRequestBody.parse(req.body);
    if (!parsed.ok) {
      sendV1Json(res, 400, null, parsed.errors);
      return;
    }
    const user = await deps.authenticationService.authenticateUser({
      username: parsed.value.username,
      password: parsed.value.password
    });
    if (!user) {
      sendV1Json(res, 401, null, [
        { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
      ]);
      return;
    }
    try {
      await deps.userRepository.updateLastLoginAt(user.id);
    } catch {
      // Non-fatal; mirrors session cookie login behavior
    }
    const { token, expiresInSeconds } = deps.jwtTokenService.signAccessToken(user);
    const data: LoginSuccessDataDto = {
      accessToken: token,
      tokenType: 'Bearer',
      expiresInSeconds,
      user: { id: user.id, username: user.name, role: user.role }
    };
    sendV1Success(res, data);
  });

  router.get('/auth/me', bearerAuth, async (req, res) => {
    try {
      const sessionUser = req.user!;
      const full = await deps.userRepository.getUserById(sessionUser.id);
      if (!full) {
        sendV1Json(res, 401, null, [{ code: 'UNAUTHORIZED', message: 'User not found' }]);
        return;
      }
      const data: AuthMeDataDto = {
        id: full.id,
        username: full.name,
        email: full.email,
        role: full.role,
        lastLoginAt: full.lastLoginAt ? full.lastLoginAt.toISOString() : null
      };
      sendV1Success(res, data);
    } catch (error) {
      console.error('v1 /auth/me error:', error);
      sendV1Json(res, 500, null, [{ code: 'INTERNAL_ERROR', message: 'Failed to load user' }]);
    }
  });

  router.post('/auth/logout', (_req, res) => {
    sendV1Success(res, { loggedOut: true });
  });
}
