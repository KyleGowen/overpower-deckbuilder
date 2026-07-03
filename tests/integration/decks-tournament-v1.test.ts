import request from 'supertest';
import { app, initializeTestServer } from '../../src/test-server';
import { TOURNAMENT_DECKS_USER_ID } from '../../src/constants/tournamentDecksUser';
import { integrationTestUtils } from '../setup-integration';

describe('GET /api/v1/decks/tournament', () => {
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

  it('returns only tournament_decks user decks sorted by lastModified descending', async () => {
    const configRes = await request(app).get('/api/v1/config/app').expect(200);
    expect(configRes.body.tournamentDecksUserId).toBe(TOURNAMENT_DECKS_USER_ID);

    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    const pool = DataSourceConfig.getInstance().getPool();

    const older = await deckRepository.createDeck(
      TOURNAMENT_DECKS_USER_ID,
      `IT Tournament Older ${Date.now()}`,
      'older'
    );
    createdDeckIds.push(older.id);
    integrationTestUtils.trackTestDeck(older.id);

    await pool.query(
      `UPDATE decks SET updated_at = NOW() - INTERVAL '1 hour' WHERE id = $1`,
      [older.id]
    );
    await markPublicLegal(older.id);

    const newer = await deckRepository.createDeck(
      TOURNAMENT_DECKS_USER_ID,
      `IT Tournament Newer ${Date.now()}`,
      'newer'
    );
    createdDeckIds.push(newer.id);
    integrationTestUtils.trackTestDeck(newer.id);
    await markPublicLegal(newer.id);

    const res = await request(app)
      .get('/api/v1/decks/tournament')
      .set('Cookie', authCookie)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const tournamentDecks = res.body.data.filter(
      (d: { metadata: { userId: string } }) => d.metadata.userId === TOURNAMENT_DECKS_USER_ID
    );
    expect(tournamentDecks.length).toBeGreaterThan(0);
    for (const deck of tournamentDecks) {
      expect(deck.metadata.userId).toBe(TOURNAMENT_DECKS_USER_ID);
      expect(deck.metadata.is_private).toBe(false);
      expect(deck.metadata.is_valid).toBe(true);
    }

    const ids = tournamentDecks.map((d: { metadata: { id: string } }) => d.metadata.id);
    const newerIndex = ids.indexOf(newer.id);
    const olderIndex = ids.indexOf(older.id);
    expect(newerIndex).toBeGreaterThanOrEqual(0);
    expect(olderIndex).toBeGreaterThanOrEqual(0);
    expect(newerIndex).toBeLessThan(olderIndex);

    await deckRepository.deleteDeck(newer.id);
    await deckRepository.deleteDeck(older.id);
    createdDeckIds.length = 0;
  });

  it('excludes private and not-legal tournament_decks decks from the rail', async () => {
    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    const pool = DataSourceConfig.getInstance().getPool();

    const publicLegal = await deckRepository.createDeck(
      TOURNAMENT_DECKS_USER_ID,
      `IT Tournament Public Legal ${Date.now()}`,
      'visible'
    );
    createdDeckIds.push(publicLegal.id);
    integrationTestUtils.trackTestDeck(publicLegal.id);
    await markPublicLegal(publicLegal.id);

    const privateDeck = await deckRepository.createDeck(
      TOURNAMENT_DECKS_USER_ID,
      `IT Tournament Private ${Date.now()}`,
      'hidden private'
    );
    createdDeckIds.push(privateDeck.id);
    integrationTestUtils.trackTestDeck(privateDeck.id);
    await pool.query(
      `UPDATE decks SET is_private = true, is_valid = true WHERE id = $1`,
      [privateDeck.id]
    );

    const notLegal = await deckRepository.createDeck(
      TOURNAMENT_DECKS_USER_ID,
      `IT Tournament Not Legal ${Date.now()}`,
      'hidden not legal'
    );
    createdDeckIds.push(notLegal.id);
    integrationTestUtils.trackTestDeck(notLegal.id);
    await pool.query(
      `UPDATE decks SET is_private = false, is_valid = false WHERE id = $1`,
      [notLegal.id]
    );

    const res = await request(app)
      .get('/api/v1/decks/tournament')
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
});
