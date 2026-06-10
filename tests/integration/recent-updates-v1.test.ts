/**
 * Integration tests for v1 recent-updates route (read-only; no test data cleanup required).
 */
import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { getKyleSessionCookieHeader } from './helpers/integrationSessionAuth';

describe('GET /api/v1/recent-updates', () => {
  let catalogAuthCookie: string;

  beforeAll(async () => {
    await initializeTestServer();
    catalogAuthCookie = await getKyleSessionCookieHeader(app);
  });

  it('returns v1 envelope with seeded recent update rows', async () => {
    const res = await request(app)
      .get('/api/v1/recent-updates')
      .set('Cookie', catalogAuthCookie)
      .expect(200);

    expect(res.body.errors).toEqual([]);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    const row = res.body.data[0];
    expect(typeof row.id).toBe('string');
    expect(typeof row.title).toBe('string');
    expect(typeof row.type).toBe('string');
    expect(typeof row.description).toBe('string');
    expect(row.cardImageUrl === null || typeof row.cardImageUrl === 'string').toBe(true);
    expect(typeof row.createdAt).toBe('string');
    expect(typeof row.updatedAt).toBe('string');
  });
});
