/**
 * Integration: GET /api/v1/decks/stats (session auth, v1 envelope).
 */
import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';

describe('GET /api/v1/decks/stats', () => {
  beforeAll(async () => {
    await initializeTestServer();
  });

  it('returns 401 without session', async () => {
    const res = await request(app).get('/api/v1/decks/stats').expect(401);
    expect(res.body.errors?.[0]?.code).toBe('UNAUTHORIZED');
    expect(res.body.data).toBeNull();
  });

  it('returns v1 envelope with aggregate stats when authenticated', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const res = await request(app).get('/api/v1/decks/stats').set('Cookie', cookie).expect(200);

    expect(res.body.meta).toEqual({});
    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toMatchObject({
      totalDecks: expect.any(Number),
      totalCards: expect.any(Number),
      averageCardsPerDeck: expect.any(Number),
      largestDeckSize: expect.any(Number)
    });
  });
});
