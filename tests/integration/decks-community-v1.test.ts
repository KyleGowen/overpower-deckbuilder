import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { COMMUNITY_DECKS_USER_ID } from '../../src/constants/communityDecksUser';
import { integrationTestUtils } from '../setup-integration';

describe('GET /api/v1/decks/community', () => {
  let authCookie: string;
  const createdDeckIds: string[] = [];

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
    if (createdDeckIds.length > 0) {
      const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
      const pool = DataSourceConfig.getInstance().getPool();
      for (const deckId of createdDeckIds) {
        await pool.query('DELETE FROM deck_cards WHERE deck_id = $1', [deckId]);
        await pool.query('DELETE FROM decks WHERE id = $1', [deckId]);
      }
    }
  });

  async function markPublicLegal(deckId: string): Promise<void> {
    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const pool = DataSourceConfig.getInstance().getPool();
    await pool.query(
      `UPDATE decks SET is_private = false, is_valid = true WHERE id = $1`,
      [deckId]
    );
  }

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
    createdDeckIds.push(older.id);
    integrationTestUtils.trackTestDeck(older.id);

    const pool = DataSourceConfig.getInstance().getPool();
    await pool.query(
      `UPDATE decks SET updated_at = NOW() - INTERVAL '1 hour' WHERE id = $1`,
      [older.id]
    );
    await markPublicLegal(older.id);

    const newer = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Newer ${Date.now()}`,
      'newer'
    );
    createdDeckIds.push(newer.id);
    integrationTestUtils.trackTestDeck(newer.id);
    await markPublicLegal(newer.id);

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
      expect(deck.metadata.is_private).toBe(false);
      expect(deck.metadata.is_valid).toBe(true);
    }

    const ids = communityDecks.map((d: { metadata: { id: string } }) => d.metadata.id);
    const newerIndex = ids.indexOf(newer.id);
    const olderIndex = ids.indexOf(older.id);
    expect(newerIndex).toBeGreaterThanOrEqual(0);
    expect(olderIndex).toBeGreaterThanOrEqual(0);
    expect(newerIndex).toBeLessThan(olderIndex);

    await deckRepository.deleteDeck(newer.id);
    await deckRepository.deleteDeck(older.id);
    createdDeckIds.length = 0;
  });

  it('excludes private and not-legal community_decks decks from the rail', async () => {
    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    const pool = DataSourceConfig.getInstance().getPool();

    const publicLegal = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Public Legal ${Date.now()}`,
      'visible'
    );
    createdDeckIds.push(publicLegal.id);
    integrationTestUtils.trackTestDeck(publicLegal.id);
    await markPublicLegal(publicLegal.id);

    const privateDeck = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Private ${Date.now()}`,
      'hidden private'
    );
    createdDeckIds.push(privateDeck.id);
    integrationTestUtils.trackTestDeck(privateDeck.id);
    await pool.query(
      `UPDATE decks SET is_private = true, is_valid = true WHERE id = $1`,
      [privateDeck.id]
    );

    const notLegal = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community Not Legal ${Date.now()}`,
      'hidden not legal'
    );
    createdDeckIds.push(notLegal.id);
    integrationTestUtils.trackTestDeck(notLegal.id);
    await pool.query(
      `UPDATE decks SET is_private = false, is_valid = false WHERE id = $1`,
      [notLegal.id]
    );

    const res = await request(app)
      .get('/api/v1/decks/community')
      .set('Cookie', authCookie)
      .expect(200);

    const ids = res.body.data.map((d: { metadata: { id: string } }) => d.metadata.id);
    expect(ids).toContain(publicLegal.id);
    expect(ids).not.toContain(privateDeck.id);
    expect(ids).not.toContain(notLegal.id);

    await deckRepository.deleteDeck(publicLegal.id);
    await deckRepository.deleteDeck(privateDeck.id);
    await deckRepository.deleteDeck(notLegal.id);
    createdDeckIds.length = 0;
  });

  it('returns cardCount matching playable deck_cards quantity sum for each community deck', async () => {
    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    const pool = DataSourceConfig.getInstance().getPool();

    const seedDeck = await deckRepository.createDeck(
      COMMUNITY_DECKS_USER_ID,
      `IT Community cardCount ${Date.now()}`,
      'cardCount fixture'
    );
    createdDeckIds.push(seedDeck.id);
    integrationTestUtils.trackTestDeck(seedDeck.id);
    await markPublicLegal(seedDeck.id);

    const powerRow = await pool.query<{ id: string }>(
      `SELECT id FROM power_cards WHERE one_per_deck = false ORDER BY value ASC LIMIT 1`
    );
    expect(powerRow.rows.length).toBeGreaterThan(0);
    await pool.query(
      `INSERT INTO deck_cards (deck_id, card_type, card_id, quantity) VALUES ($1, $2, $3, $4)`,
      [seedDeck.id, 'power', powerRow.rows[0].id, 3]
    );

    const res = await request(app)
      .get('/api/v1/decks/community')
      .set('Cookie', authCookie)
      .expect(200);

    const communityDecks = res.body.data.filter(
      (d: { metadata: { userId: string } }) => d.metadata.userId === COMMUNITY_DECKS_USER_ID
    );
    expect(communityDecks.length).toBeGreaterThan(0);

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

    await deckRepository.deleteDeck(seedDeck.id);
    createdDeckIds.length = 0;
  });
});
