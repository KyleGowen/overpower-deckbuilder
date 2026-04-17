import express from 'express';
import request from 'supertest';
import { createCorsMiddleware } from '../../src/middleware/corsAllowlist';

function buildApp(allowlist: string | undefined, killSwitch?: string) {
  const savedAllowed = process.env.ALLOWED_ORIGINS;
  const savedDisable = process.env.DISABLE_CORS;

  if (allowlist === undefined) {
    delete process.env.ALLOWED_ORIGINS;
  } else {
    process.env.ALLOWED_ORIGINS = allowlist;
  }
  if (killSwitch === undefined) {
    delete process.env.DISABLE_CORS;
  } else {
    process.env.DISABLE_CORS = killSwitch;
  }

  const app = express();
  app.use(createCorsMiddleware());
  app.get('/probe', (_req, res) => res.json({ ok: true }));

  return {
    app,
    restore: () => {
      if (savedAllowed === undefined) delete process.env.ALLOWED_ORIGINS;
      else process.env.ALLOWED_ORIGINS = savedAllowed;
      if (savedDisable === undefined) delete process.env.DISABLE_CORS;
      else process.env.DISABLE_CORS = savedDisable;
    },
  };
}

describe('createCorsMiddleware', () => {
  it('echoes ACAO for an allowed origin', async () => {
    const { app, restore } = buildApp('https://partner.example.com');
    try {
      const res = await request(app)
        .get('/probe')
        .set('Origin', 'https://partner.example.com');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://partner.example.com');
    } finally {
      restore();
    }
  });

  it('omits ACAO for a disallowed origin', async () => {
    const { app, restore } = buildApp('https://allowed.example.com');
    try {
      const res = await request(app)
        .get('/probe')
        .set('Origin', 'https://not-allowed.example.com');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      restore();
    }
  });

  it('passes same-origin (no Origin header) requests through', async () => {
    const { app, restore } = buildApp('https://allowed.example.com');
    try {
      const res = await request(app).get('/probe');
      expect(res.status).toBe(200);
    } finally {
      restore();
    }
  });

  it('DISABLE_CORS=1 short-circuits to a no-op', async () => {
    const { app, restore } = buildApp('https://allowed.example.com', '1');
    try {
      const res = await request(app)
        .get('/probe')
        .set('Origin', 'https://allowed.example.com');
      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      restore();
    }
  });

  it('responds to preflight OPTIONS for an allowed origin', async () => {
    const { app, restore } = buildApp('https://partner.example.com');
    try {
      const res = await request(app)
        .options('/probe')
        .set('Origin', 'https://partner.example.com')
        .set('Access-Control-Request-Method', 'GET');
      expect([200, 204]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBe('https://partner.example.com');
      expect(res.headers['access-control-allow-methods']).toContain('GET');
    } finally {
      restore();
    }
  });
});
