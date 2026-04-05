import type { Application } from 'express';
import request from 'supertest';

/**
 * Session cookie header (`sessionId=...`) for integration tests (same-origin as the app).
 * Uses legacy POST /api/auth/login so the in-memory session matches `authenticateUser`.
 */
export async function getSessionCookieHeader(
  app: Application,
  username: string,
  password: string
): Promise<string> {
  const login = await request(app).post('/api/auth/login').send({ username, password });
  if (login.status !== 200) {
    throw new Error(`integration login failed: ${login.status} ${JSON.stringify(login.body)}`);
  }
  const raw = login.headers['set-cookie'];
  if (!raw) {
    throw new Error('integration login: no set-cookie');
  }
  const first = Array.isArray(raw) ? raw[0] : raw;
  return first.split(';')[0];
}

export async function getKyleSessionCookieHeader(app: Application): Promise<string> {
  return getSessionCookieHeader(app, 'kyle', 'test');
}
