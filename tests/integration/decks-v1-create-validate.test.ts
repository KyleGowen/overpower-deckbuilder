/**
 * Integration: POST /api/v1/decks and POST /api/v1/decks/validate (session auth, v1 envelope).
 */
import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('POST /api/v1/decks and /decks/validate', () => {
  beforeAll(async () => {
    await initializeTestServer();
  });

  it('returns 401 without session for create', async () => {
    const res = await request(app).post('/api/v1/decks').send({ name: 'x' }).expect(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 without session for validate', async () => {
    const res = await request(app)
      .post('/api/v1/decks/validate')
      .send({ cards: [] })
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it('creates a deck with v1 envelope and cleans up', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const name = `v1 create integration ${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookie)
      .send({ name, description: 'd' })
      .expect(201);

    expect(res.body.errors).toEqual([]);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe(name);
    const id = res.body.data.id as string;
    integrationTestUtils.trackTestDeck(id);

    const del = await request(app).delete(`/api/decks/${id}`).set('Cookie', cookie).expect(200);
    expect(del.body.success).toBe(true);
  });

  it('returns validate success v1 envelope when authenticated', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const res = await request(app)
      .post('/api/v1/decks/validate')
      .set('Cookie', cookie)
      .send({
        cards: [
          { type: 'character', cardId: 'char1', quantity: 1 },
          { type: 'character', cardId: 'char2', quantity: 1 },
          { type: 'character', cardId: 'char3', quantity: 1 },
          { type: 'character', cardId: 'char4', quantity: 1 },
          { type: 'mission', cardId: 'mission1', quantity: 1 },
          { type: 'mission', cardId: 'mission2', quantity: 1 },
          { type: 'mission', cardId: 'mission3', quantity: 1 },
          { type: 'mission', cardId: 'mission4', quantity: 1 },
          { type: 'mission', cardId: 'mission5', quantity: 1 },
          { type: 'mission', cardId: 'mission6', quantity: 1 },
          { type: 'mission', cardId: 'mission7', quantity: 1 },
          { type: 'power_card', cardId: 'power1', quantity: 40 }
        ]
      })
      .expect(200);

    expect(res.body.errors).toEqual([]);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.message).toMatch(/valid/i);
  });
});
