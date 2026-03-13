/**
 * Integration tests for guest deck API (/api/guest/decks).
 * GUEST users can create/list/get/update/delete session-scoped decks (not persisted to DB).
 * Non-GUEST users receive 403 on guest deck endpoints.
 */
import request from 'supertest';
import { app } from '../setup-integration';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { UserRepository } from '../../src/repository/UserRepository';

describe('Guest deck API integration tests', () => {
  let userRepository: UserRepository;
  let guestSessionCookie: string;
  let userSessionCookie: string;

  beforeAll(async () => {
    const dataSourceConfig = DataSourceConfig.getInstance();
    userRepository = dataSourceConfig.getUserRepository();

    const guestUser = await userRepository.createUser(
      'test-guest-deck-api',
      'test-guest-deck-api@example.com',
      'testpassword',
      'GUEST'
    );
    const regularUser = await userRepository.createUser(
      'test-regular-deck-api',
      'test-regular-deck-api@example.com',
      'testpassword',
      'USER'
    );

    const guestLogin = await request(app).post('/api/auth/login').send({ username: 'test-guest-deck-api', password: 'testpassword' });
    const userLogin = await request(app).post('/api/auth/login').send({ username: 'test-regular-deck-api', password: 'testpassword' });
    expect(guestLogin.status).toBe(200);
    expect(userLogin.status).toBe(200);
    guestSessionCookie = guestLogin.headers['set-cookie'][0].split(';')[0];
    userSessionCookie = userLogin.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    try {
      const guest = await userRepository.getUserByUsername('test-guest-deck-api');
      const user = await userRepository.getUserByUsername('test-regular-deck-api');
      if (guest) await userRepository.deleteUser(guest.id);
      if (user) await userRepository.deleteUser(user.id);
    } catch {
      // ignore
    }
  });

  describe('GUEST session', () => {
    it('should create a guest deck and return 201 with id', async () => {
      const res = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'My Guest Deck', description: 'Session only' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^guest_/);
      expect(res.body.data.name).toBe('My Guest Deck');
    });

    it('should list guest decks for session', async () => {
      const createRes = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'List Test Deck', description: '' });
      expect(createRes.status).toBe(201);
      const deckId = createRes.body.data.id;

      const listRes = await request(app).get('/api/guest/decks').set('Cookie', guestSessionCookie);
      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data)).toBe(true);
      const found = listRes.body.data.find((d: { metadata?: { id: string }; id?: string }) => (d.metadata && d.metadata.id === deckId) || d.id === deckId);
      expect(found).toBeDefined();
    });

    it('should get a guest deck by id', async () => {
      const createRes = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'Get Test Deck', description: '' });
      expect(createRes.status).toBe(201);
      const deckId = createRes.body.data.id;

      const getRes = await request(app).get(`/api/guest/decks/${deckId}`).set('Cookie', guestSessionCookie);
      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.metadata.id).toBe(deckId);
      expect(getRes.body.data.metadata.name).toBe('Get Test Deck');
      expect(getRes.body.data.cards).toEqual([]);
    });

    it('should update guest deck cards', async () => {
      const createRes = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'Cards Test Deck', description: '' });
      expect(createRes.status).toBe(201);
      const deckId = createRes.body.data.id;

      const putRes = await request(app)
        .put(`/api/guest/decks/${deckId}/cards`)
        .set('Cookie', guestSessionCookie)
        .send({
          cards: [
            { cardType: 'character', cardId: '00000000-0000-0000-0000-000000000001', quantity: 1 },
            { cardType: 'power', cardId: '00000000-0000-0000-0000-000000000002', quantity: 2 }
          ]
        });
      expect(putRes.status).toBe(200);
      expect(putRes.body.success).toBe(true);
      expect(putRes.body.data.cards.length).toBe(2); // character qty 1, power qty 2 = 2 entries
    });

    it('should delete a guest deck', async () => {
      const createRes = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'Delete Test Deck', description: '' });
      expect(createRes.status).toBe(201);
      const deckId = createRes.body.data.id;

      const delRes = await request(app).delete(`/api/guest/decks/${deckId}`).set('Cookie', guestSessionCookie);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      const getRes = await request(app).get(`/api/guest/decks/${deckId}`).set('Cookie', guestSessionCookie);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Non-GUEST cannot use guest deck API', () => {
    it('should return 403 when USER calls POST /api/guest/decks', async () => {
      const res = await request(app)
        .post('/api/guest/decks')
        .set('Cookie', userSessionCookie)
        .send({ name: 'Not Allowed', description: '' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when USER calls GET /api/guest/decks', async () => {
      const res = await request(app).get('/api/guest/decks').set('Cookie', userSessionCookie);
      expect(res.status).toBe(403);
    });
  });

  describe('GUEST still cannot use main deck API', () => {
    it('should return 403 when GUEST calls POST /api/decks', async () => {
      const res = await request(app)
        .post('/api/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'Guest Main Deck', description: '' });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Guests may not create decks');
    });
  });
});
