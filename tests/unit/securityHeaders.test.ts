import express from 'express';
import request from 'supertest';
import { createSecurityHeadersMiddleware } from '../../src/middleware/securityHeaders';

function buildApp(opts?: { killSwitch?: string; cookieSecure?: string }) {
  const savedHelmet = process.env.DISABLE_HELMET;
  const savedCookieSecure = process.env.COOKIE_SECURE;

  if (opts?.killSwitch === undefined) {
    delete process.env.DISABLE_HELMET;
  } else {
    process.env.DISABLE_HELMET = opts.killSwitch;
  }

  if (opts?.cookieSecure === undefined) {
    delete process.env.COOKIE_SECURE;
  } else {
    process.env.COOKIE_SECURE = opts.cookieSecure;
  }

  const app = express();
  app.use(createSecurityHeadersMiddleware());
  app.get('/probe', (_req, res) => res.json({ ok: true }));

  return {
    app,
    restore: () => {
      if (savedHelmet === undefined) delete process.env.DISABLE_HELMET;
      else process.env.DISABLE_HELMET = savedHelmet;
      if (savedCookieSecure === undefined) delete process.env.COOKIE_SECURE;
      else process.env.COOKIE_SECURE = savedCookieSecure;
    },
  };
}

describe('createSecurityHeadersMiddleware', () => {
  it('emits nosniff, referrer-policy, and frame-options; omits HSTS when COOKIE_SECURE is unset (HTTP-only default)', async () => {
    const { app, restore } = buildApp();
    try {
      const res = await request(app).get('/probe');
      expect(res.status).toBe(200);
      expect(res.headers['strict-transport-security']).toBeUndefined();
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['x-frame-options']).toBe('DENY');
    } finally {
      restore();
    }
  });

  it('emits HSTS when COOKIE_SECURE=true (HTTPS opt-in)', async () => {
    const { app, restore } = buildApp({ cookieSecure: 'true' });
    try {
      const res = await request(app).get('/probe');
      expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
    } finally {
      restore();
    }
  });

  it('does NOT emit a CSP (intentionally disabled)', async () => {
    const { app, restore } = buildApp();
    try {
      const res = await request(app).get('/probe');
      expect(res.headers['content-security-policy']).toBeUndefined();
    } finally {
      restore();
    }
  });

  it('DISABLE_HELMET=1 short-circuits to a no-op', async () => {
    const { app, restore } = buildApp({ killSwitch: '1' });
    try {
      const res = await request(app).get('/probe');
      expect(res.headers['strict-transport-security']).toBeUndefined();
      expect(res.headers['x-frame-options']).toBeUndefined();
    } finally {
      restore();
    }
  });
});
