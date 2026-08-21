/**
 * Integration: GET/PUT/DELETE /api/v1/decks/:id and GET .../full (session auth, v1 envelope).
 */
import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('GET/PUT/DELETE /api/v1/decks/:id and /full', () => {
  beforeAll(async () => {
    await initializeTestServer();
  });

  it('returns 404 without session for GET :id on a private deck', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const name = `v1 private ${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookie)
      .send({ name, description: 'd' })
      .expect(201);
    const id = create.body.data.id as string;
    integrationTestUtils.trackTestDeck(id);

    const res = await request(app).get(`/api/v1/decks/${id}`).expect(404);
    expect(res.body.errors?.[0]?.code).toBe('DECK_NOT_FOUND');
    expect(res.body.data).toBeNull();

    await request(app).delete(`/api/v1/decks/${id}`).set('Cookie', cookie).expect(200);
    integrationTestUtils.untrackTestDeck(id);
  });

  it('returns 200 without session for GET :id on a public deck', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const name = `v1 public ${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookie)
      .send({ name, description: 'd' })
      .expect(201);
    const id = create.body.data.id as string;
    integrationTestUtils.trackTestDeck(id);

    await request(app)
      .put(`/api/v1/decks/${id}`)
      .set('Cookie', cookie)
      .send({ is_private: false })
      .expect(200);

    const res = await request(app).get(`/api/v1/decks/${id}`).expect(200);
    expect(res.body.errors).toEqual([]);
    expect(res.body.data.metadata.id).toBe(id);
    expect(res.body.data.metadata.isOwner).toBe(false);
    expect(res.headers['cache-control']).toBe('no-store');

    await request(app).delete(`/api/v1/decks/${id}`).set('Cookie', cookie).expect(200);
    integrationTestUtils.untrackTestDeck(id);
  });

  it('CRUD flow: create, GET, GET full, PUT, DELETE with v1 envelope', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const name = `v1 detail ${Date.now()}`;
    const create = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookie)
      .send({ name, description: 'd' })
      .expect(201);
    const id = create.body.data.id as string;
    integrationTestUtils.trackTestDeck(id);

    const get = await request(app).get(`/api/v1/decks/${id}`).set('Cookie', cookie).expect(200);
    expect(get.body.errors).toEqual([]);
    expect(get.body.data.metadata.name).toBe(name);
    expect(get.body.data.metadata.isOwner).toBe(true);

    const full = await request(app).get(`/api/v1/decks/${id}/full`).set('Cookie', cookie).expect(200);
    expect(full.body.errors).toEqual([]);
    expect(full.body.data.metadata.id).toBe(id);
    expect(full.headers['cache-control']).toBe('no-store');

    const put = await request(app)
      .put(`/api/v1/decks/${id}`)
      .set('Cookie', cookie)
      .send({ name: `${name} updated` })
      .expect(200);
    expect(put.body.errors).toEqual([]);
    expect(put.body.data.metadata.name).toBe(`${name} updated`);
    expect(put.body.data.cards).toEqual([]);

    const del = await request(app).delete(`/api/v1/decks/${id}`).set('Cookie', cookie).expect(200);
    expect(del.body.errors).toEqual([]);
    expect(del.body.data.message).toBe('Deck deleted successfully');
    integrationTestUtils.untrackTestDeck(id);
  });
});
