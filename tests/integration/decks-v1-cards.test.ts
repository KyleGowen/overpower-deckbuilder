/**
 * Integration: GET/POST/PUT/DELETE /api/v1/decks/:id/cards (session auth, v1 envelope).
 */
import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('GET/POST/PUT/DELETE /api/v1/decks/:id/cards', () => {
  beforeAll(async () => {
    await initializeTestServer();
  });

  it('returns 401 without session for GET cards', async () => {
    const res = await request(app).get('/api/v1/decks/00000000-0000-0000-0000-000000000001/cards').expect(401);
    expect(res.body.errors?.[0]?.code).toBe('UNAUTHORIZED');
    expect(res.body.data).toBeNull();
  });

  it('GET empty, POST add, GET list, DELETE card, PUT replace, GET, DELETE card, DELETE deck', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const cat = await request(app).get('/api/v1/catalog/characters').expect(200);
    expect(cat.body.errors).toEqual([]);
    const chars = cat.body.data as Array<{ id: string }>;
    expect(chars.length).toBeGreaterThan(0);
    const charId = chars[0].id;

    const name = `v1 deck cards ${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookie)
      .send({ name, description: 'd' })
      .expect(201);
    const deckId = create.body.data.id as string;
    integrationTestUtils.trackTestDeck(deckId);

    const get0 = await request(app).get(`/api/v1/decks/${deckId}/cards`).set('Cookie', cookie).expect(200);
    expect(get0.body.errors).toEqual([]);
    expect(Array.isArray(get0.body.data)).toBe(true);
    expect(get0.body.data.length).toBe(0);

    const postOne = await request(app)
      .post(`/api/v1/decks/${deckId}/cards`)
      .set('Cookie', cookie)
      .send({ cardType: 'character', cardId: charId, quantity: 1 })
      .expect(200);
    expect(postOne.body.errors).toEqual([]);
    expect(postOne.body.data.metadata.id).toBe(deckId);

    const get1 = await request(app).get(`/api/v1/decks/${deckId}/cards`).set('Cookie', cookie).expect(200);
    expect(get1.body.data.some((c: { cardId: string }) => c.cardId === charId)).toBe(true);

    const delCard = await request(app)
      .delete(`/api/v1/decks/${deckId}/cards`)
      .set('Cookie', cookie)
      .send({ cardType: 'character', cardId: charId, quantity: 1 })
      .expect(200);
    expect(delCard.body.errors).toEqual([]);

    const getEmpty = await request(app).get(`/api/v1/decks/${deckId}/cards`).set('Cookie', cookie).expect(200);
    expect(getEmpty.body.data.length).toBe(0);

    const put = await request(app)
      .put(`/api/v1/decks/${deckId}/cards`)
      .set('Cookie', cookie)
      .send({ cards: [{ cardType: 'character', cardId: charId, quantity: 1 }] })
      .expect(200);
    expect(put.body.errors).toEqual([]);
    expect(put.body.data.metadata.id).toBe(deckId);

    const getAfterPut = await request(app).get(`/api/v1/decks/${deckId}/cards`).set('Cookie', cookie).expect(200);
    expect(getAfterPut.body.data.some((c: { cardId: string }) => c.cardId === charId)).toBe(true);

    await request(app)
      .delete(`/api/v1/decks/${deckId}/cards`)
      .set('Cookie', cookie)
      .send({ cardType: 'character', cardId: charId, quantity: 1 })
      .expect(200);

    const get2 = await request(app).get(`/api/v1/decks/${deckId}/cards`).set('Cookie', cookie).expect(200);
    expect(get2.body.data.length).toBe(0);

    await request(app).delete(`/api/v1/decks/${deckId}`).set('Cookie', cookie).expect(200);
    integrationTestUtils.untrackTestDeck(deckId);
  });
});
