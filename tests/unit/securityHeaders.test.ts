import express from 'express';
import request from 'supertest';
import { createSecurityHeadersMiddleware } from '../../src/middleware/securityHeaders';

function buildApp(killSwitch?: string) {
  const saved = process.env.DISABLE_HELMET;
  if (killSwitch === undefined) {
    delete process.env.DISABLE_HELMET;
  } else {
    process.env.DISABLE_HELMET = killSwitch;
  }

  const app = express();
  app.use(createSecurityHeadersMiddleware());
  app.get('/probe', (_req, res) => res.json({ ok: true }));

  return {
    app,
    restore: () => {
      if (saved === undefined) delete process.env.DISABLE_HELMET;
      else process.env.DISABLE_HELMET = saved;
    },
  };
}

describe('createSecurityHeadersMiddleware', () => {
  it('emits HSTS, nosniff, referrer-policy, and frame-options on responses', async () => {
    const { app, restore } = buildApp();
    try {
      const res = await request(app).get('/probe');
      expect(res.status).toBe(200);
      expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['x-frame-options']).toBe('DENY');
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
    const { app, restore } = buildApp('1');
    try {
      const res = await request(app).get('/probe');
      expect(res.headers['strict-transport-security']).toBeUndefined();
      expect(res.headers['x-frame-options']).toBeUndefined();
    } finally {
      restore();
    }
  });
});
