import express, { type RequestHandler } from 'express';
import request from 'supertest';
import { V1JwtTokenService } from '../../../../src/api/services/v1JwtTokenService';
import { createV1SessionOrBearerAuthMiddleware } from '../../../../src/api/http/middleware/v1SessionOrBearerAuth';
import { sendV1Unauthorized } from '../../../../src/api/http/v1Envelope';
import type { User } from '../../../../src/types';

describe('v1SessionOrBearerAuth', () => {
  const user: User = {
    id: 'u-cat',
    name: 'bob',
    email: 'b@example.com',
    role: 'USER'
  };

  const jwtTokenService = new V1JwtTokenService({ secret: 'unit-test-secret-key-32chars!!', expiresIn: '1h' });
  const { token } = jwtTokenService.signAccessToken(user);

  const sessionOnly: RequestHandler = (req, res, next) => {
    if (req.headers.cookie?.includes('sessionId=ok')) {
      (req as express.Request & { user?: User }).user = user;
      next();
      return;
    }
    sendV1Unauthorized(res, 'Authentication required');
  };

  function buildApp(): express.Application {
    const app = express();
    const auth = createV1SessionOrBearerAuthMiddleware({
      jwtTokenService,
      getUserById: jest.fn().mockResolvedValue(user),
      authenticateUser: sessionOnly
    });
    app.get('/x', auth, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    return app;
  }

  it('returns 401 when no Bearer and no session cookie', async () => {
    const res = await request(buildApp()).get('/x').expect(401);
    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].code).toBe('UNAUTHORIZED');
  });

  it('allows session cookie without Bearer', async () => {
    await request(buildApp()).get('/x').set('Cookie', 'sessionId=ok').expect(200);
  });

  it('allows valid Bearer when header present', async () => {
    await request(buildApp()).get('/x').set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('returns 401 for invalid Bearer without falling back to session', async () => {
    const res = await request(buildApp())
      .get('/x')
      .set('Authorization', 'Bearer not-a-real-token')
      .set('Cookie', 'sessionId=ok')
      .expect(401);
    expect(res.body.errors[0].code).toBe('UNAUTHORIZED');
  });
});
