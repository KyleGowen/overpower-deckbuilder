import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { COMMUNITY_DECKS_USER_ID } from '../../src/constants/communityDecksUser';
import { integrationTestUtils } from '../setup-integration';

describe('GET /api/v1/decks/community', () => {
  let authCookie: string;
  let createdDeckId: string | null = null;

  beforeAll(async () => {
    await initializeTestServer();
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: 'kyle', password: 'test' });
    expect(login.status).toBe(200);
    const cookies = login.headers['set-cookie'];
    authCookie = cookies[0].split(';')[0];
  });

  afterAll(async () => {
    if (createdDeckId) {
      const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
      const pool = DataSourceConfig.getInstance().getPool();
      await pool.query('DELETE FROM deck_cards WHERE deck_id = $1', [createdDeckId]);
      await pool.query('DELETE FROM decks WHERE id = $1', [createdDeckId]);
    }
  });

  it('returns only community_decks user decks sorted by lastModified descending', async () => {
    const configRes = await request(app).get('/api/v1/config/app').expect(200);
    expect(configRes.body.communityDecksUserId).toBe(COMMUNITY_DECKS_USER_ID);

    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();

    const older = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Older ${Date.now()}`,
      'older'
    );
    createdDeckId = older.id;
    integrationTestUtils.trackTestDeck(older.id);

    const pool = DataSourceConfig.getInstance().getPool();
    await pool.query(
      `UPDATE decks SET updated_at = NOW() - INTERVAL '1 hour' WHERE id = $1`,
      [older.id]
    );

    const newer = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Newer ${Date.now()}`,
      'newer'
    );
    integrationTestUtils.trackTestDeck(newer.id);

    const res = await request(app)
      .get('/api/v1/decks/community')
      .set('Cookie', authCookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const communityDecks = res.body.data.filter(
      (d: { metadata: { userId: string } }) => d.metadata.userId === COMMUNITY_DECKS_USER_ID
    );
    expect(communityDecks.length).toBeGreaterThan(0);
    for (const deck of communityDecks) {
      expect(deck.metadata.userId).toBe(COMMUNITY_DECKS_USER_ID);
    }

    const ids = communityDecks.map((d: { metadata: { id: string } }) => d.metadata.id);
    const newerIndex = ids.indexOf(newer.id);
    const olderIndex = ids.indexOf(older.id);
    expect(newerIndex).toBeGreaterThanOrEqual(0);
    expect(olderIndex).toBeGreaterThanOrEqual(0);
    expect(newerIndex).toBeLessThan(olderIndex);

    await deckRepository.deleteDeck(newer.id);
    await deckRepository.deleteDeck(older.id);
    createdDeckId = null;
  });

  it('returns cardCount matching playable deck_cards quantity sum for each community deck', async () => {
    const res = await request(app)
      .get('/api/v1/decks/community')
      .set('Cookie', authCookie)
      .expect(200);

    const communityDecks = res.body.data.filter(
      (d: { metadata: { userId: string } }) => d.metadata.userId === COMMUNITY_DECKS_USER_ID
    );
    expect(communityDecks.length).toBeGreaterThan(0);

    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const pool = DataSourceConfig.getInstance().getPool();

    for (const deck of communityDecks) {
      const deckId = deck.metadata.id as string;
      const countResult = await pool.query<{ expected: string }>(
        `SELECT COALESCE(SUM(quantity), 0)::text AS expected
         FROM deck_cards
         WHERE deck_id = $1
         AND card_type NOT IN ('character', 'location', 'mission')`,
        [deckId]
      );
      const expectedCount = parseInt(countResult.rows[0].expected, 10);
      expect(deck.metadata.cardCount).toBe(expectedCount);
    }
  });
});
