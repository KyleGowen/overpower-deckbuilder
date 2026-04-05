/**
 * v1 deck list isolation and unauthenticated mutation responses (v1 error envelope).
 */
import request from 'supertest';
import { Pool } from 'pg';
import { app } from '../../../src/test-server';
import { integrationTestUtils } from '../../setup-integration';

function expectV1Unauthorized(res: { status: number; body: Record<string, unknown> }): void {
  expect(res.status).toBe(401);
  expect(res.body.errors).toBeDefined();
  expect(Array.isArray(res.body.errors)).toBe(true);
  expect((res.body.errors as { code: string }[])[0]?.code).toBe('UNAUTHORIZED');
  expect(res.body.data).toBeNull();
}

describe('v1 decks list isolation and unauthenticated authz', () => {
  let pool: Pool;
  let testCharacterId: string;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    const result = await pool.query<{ id: string }>('SELECT id FROM characters LIMIT 1');
    if (result.rows.length < 1) {
      throw new Error('Not enough test cards available in database');
    }
    testCharacterId = result.rows[0].id;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/v1/decks does not include another user’s deck ids', async () => {
    const userA = await integrationTestUtils.createTestUser({
      name: 'deck-list-owner',
      email: 'deck-list-owner@example.com',
      role: 'USER',
      password: 'password123'
    });
    const userB = await integrationTestUtils.createTestUser({
      name: 'deck-list-peer',
      email: 'deck-list-peer@example.com',
      role: 'USER',
      password: 'password123'
    });

    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ username: userA.username, password: 'password123' });
    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ username: userB.username, password: 'password123' });
    expect(loginA.status).toBe(200);
    expect(loginB.status).toBe(200);
    const cookieA = loginA.headers['set-cookie'][0].split(';')[0];
    const cookieB = loginB.headers['set-cookie'][0].split(';')[0];

    const createDeck = await request(app)
      .post('/api/v1/decks')
      .set('Cookie', cookieA)
      .send({ name: 'Owner only list', description: '', cards: [] });
    expect(createDeck.status).toBe(201);
    const deckId = createDeck.body.data.id as string;
    integrationTestUtils.trackTestDeck(deckId);

    const listB = await request(app).get('/api/v1/decks').set('Cookie', cookieB).expect(200);
    expect(listB.body.errors).toEqual([]);
    const ids = (listB.body.data as { metadata?: { id: string }; id?: string }[]).map((d) => d.metadata?.id ?? d.id);
    expect(ids).not.toContain(deckId);
  });

  it('returns v1 UNAUTHORIZED (401) for mutations without session', async () => {
    const deckId = '00000000-0000-0000-0000-000000000099';

    expectV1Unauthorized(
      await request(app).put(`/api/v1/decks/${deckId}`).send({ name: 'x' })
    );
    expectV1Unauthorized(
      await request(app).post(`/api/v1/decks/${deckId}/cards`).send({ cardType: 'character', cardId: testCharacterId, quantity: 1 })
    );
    expectV1Unauthorized(
      await request(app)
        .put(`/api/v1/decks/${deckId}/cards`)
        .send({ cards: [{ cardType: 'character', cardId: testCharacterId, quantity: 1 }] })
    );
    expectV1Unauthorized(
      await request(app).put(`/api/v1/decks/${deckId}/ui-preferences`).send({ viewMode: 'tile' })
    );
    expectV1Unauthorized(
      await request(app)
        .delete(`/api/v1/decks/${deckId}/cards`)
        .send({ cardType: 'character', cardId: testCharacterId, quantity: 1 })
    );
    expectV1Unauthorized(await request(app).delete(`/api/v1/decks/${deckId}`));
  });
});
