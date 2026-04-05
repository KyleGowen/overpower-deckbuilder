/**
 * Guest decks are keyed by sessionId (cookie), not user id alone — other sessions must not access them.
 * Also verifies guest deck titles do not appear as persisted rows in `decks`.
 */
import request from 'supertest';
import { Pool } from 'pg';
import { app, initializeTestServer } from '../../../src/test-server';
import { integrationTestUtils } from '../../setup-integration';

const v1 = '/api/v1/guest/decks';

describe('Guest deck session isolation (v1)', () => {
  let pool: Pool;
  const guestPassword = 'GuestIsoPw1';

  beforeAll(async () => {
    await initializeTestServer();
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('does not persist guest deck metadata in PostgreSQL decks table', async () => {
    const guestUser = await integrationTestUtils.createTestUser({
      name: 'guest-iso-db',
      email: 'guest-iso-db@example.com',
      role: 'GUEST',
      password: guestPassword
    });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: guestUser.username, password: guestPassword });
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const uniqueName = `guest-session-only-${Date.now()}`;
    const createRes = await request(app)
      .post(v1)
      .set('Cookie', cookie)
      .send({ name: uniqueName, description: 'mem' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.id).toMatch(/^guest_/);

    const dbCount = await pool.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM decks WHERE name = $1', [
      uniqueName
    ]);
    expect(dbCount.rows[0].c).toBe(0);
  });

  it('blocks another guest session from GET/PUT/POST cards/DELETE on a deck created in session A', async () => {
    const guestA = await integrationTestUtils.createTestUser({
      name: 'guest-iso-a',
      email: 'guest-iso-a@example.com',
      role: 'GUEST',
      password: guestPassword
    });
    const guestB = await integrationTestUtils.createTestUser({
      name: 'guest-iso-b',
      email: 'guest-iso-b@example.com',
      role: 'GUEST',
      password: guestPassword
    });

    const loginA = await request(app)
      .post('/api/auth/login')
      .send({ username: guestA.username, password: guestPassword });
    const loginB = await request(app)
      .post('/api/auth/login')
      .send({ username: guestB.username, password: guestPassword });
    expect(loginA.status).toBe(200);
    expect(loginB.status).toBe(200);
    const cookieA = loginA.headers['set-cookie'][0].split(';')[0];
    const cookieB = loginB.headers['set-cookie'][0].split(';')[0];

    const createRes = await request(app)
      .post(v1)
      .set('Cookie', cookieA)
      .send({ name: 'Session A deck', description: '' });
    expect(createRes.status).toBe(201);
    const deckId = createRes.body.data.id as string;

    const listB = await request(app).get(v1).set('Cookie', cookieB).expect(200);
    expect(listB.body.errors).toEqual([]);
    const idsB = (listB.body.data as { metadata?: { id: string }; id?: string }[]).map((d) => d.metadata?.id ?? d.id);
    expect(idsB).not.toContain(deckId);

    const charResult = await pool.query<{ id: string }>('SELECT id FROM characters LIMIT 1');
    const characterId = charResult.rows[0].id;

    for (const [method, path, body] of [
      ['get', `${v1}/${deckId}`, undefined],
      ['put', `${v1}/${deckId}`, { name: 'Hacked' }],
      [
        'put',
        `${v1}/${deckId}/cards`,
        { cards: [{ cardType: 'character', cardId: characterId, quantity: 1 }] }
      ],
      ['post', `${v1}/${deckId}/cards`, { cardType: 'character', cardId: characterId, quantity: 1 }],
      ['delete', `${v1}/${deckId}`, undefined]
    ] as const) {
      const agent = request(app) as any;
      let req = agent[method](path).set('Cookie', cookieB);
      if (body !== undefined) req = req.send(body);
      const res = await req;
      expect(res.status).toBe(404);
      expect(res.body.errors?.[0]?.code).toBe('DECK_NOT_FOUND');
    }
  });
});
