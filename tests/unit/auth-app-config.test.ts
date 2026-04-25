import express from 'express';
import request from 'supertest';
import { registerAuthRoutes } from '../../src/routes/auth.routes';

function buildApp(): express.Application {
  const app = express();
  registerAuthRoutes(app, {
    authService: {
      handleLogin: jest.fn(),
      handleSignup: jest.fn(),
      handleGoogleLogin: jest.fn(),
      handleLogout: jest.fn(),
      handleSessionValidation: jest.fn(),
      createAuthMiddleware: jest.fn(),
      destroySession: jest.fn(),
    },
  });
  return app;
}

describe('/js/app-config.js', () => {
  const originalCdnBaseUrl = process.env.CDN_BASE_URL;

  afterEach(() => {
    if (originalCdnBaseUrl === undefined) {
      delete process.env.CDN_BASE_URL;
    } else {
      process.env.CDN_BASE_URL = originalCdnBaseUrl;
    }
  });

  it('serves an empty CDN base for local development', async () => {
    delete process.env.CDN_BASE_URL;

    const response = await request(buildApp()).get('/js/app-config.js');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/javascript');
    expect(response.headers['cache-control']).toBe('public, max-age=300');
    expect(response.text).toBe('window.APP_CDN_BASE = "";');
  });

  it('serves the configured production CDN base', async () => {
    process.env.CDN_BASE_URL = 'https://d6vp4hrkfkf5v.cloudfront.net';

    const response = await request(buildApp()).get('/js/app-config.js');

    expect(response.status).toBe(200);
    expect(response.text).toBe('window.APP_CDN_BASE = "https://d6vp4hrkfkf5v.cloudfront.net";');
  });
});
