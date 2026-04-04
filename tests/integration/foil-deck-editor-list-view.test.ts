/**
 * Integration tests for foil handling in Deck Editor List View.
 *
 * Verifies:
 * 1. Deck API returns foil card IDs when deck has foil cards
 * 2. Deck editor page loads foil-related scripts for list view (foil-btn in list items)
 *
 * Note: Foil UI (foil-btn in .deck-list-item) is rendered by client-side JS.
 * We verify the data and script loading that enable foil rendering.
 */

import request from 'supertest';
import { Pool } from 'pg';
import { app, initializeTestServer } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../setup-integration';

describe('Foil Deck Editor List View Integration Tests', () => {
  let pool: Pool;
  let testUser: any;
  let testDeckId: string;
  let authCookie: string;
  let foilPowerCardId: string;

  beforeAll(async () => {
    const { server: _server } = await initializeTestServer();
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower',
    });

    await integrationTestUtils.ensureGuestUser();

    const timestamp = Date.now();
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    testUser = await userRepository.createUser(
      `foil-list-${timestamp}`,
      `foil-list-${timestamp}@example.com`,
      'password123',
      'USER'
    );
    integrationTestUtils.trackTestUser(testUser.id);

    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    const deck = await deckRepository.createDeck(
      testUser.id,
      'Foil List View Test Deck',
      'Deck for foil list view tests'
    );
    testDeckId = deck.id;
    integrationTestUtils.trackTestDeck(testDeckId);

    const foilMapResult = await pool.query(
      'SELECT foil_card_id FROM foil_card_map WHERE card_type = $1 LIMIT 1',
      ['power']
    );
    if (foilMapResult.rows.length === 0) {
      throw new Error('No foil power cards in foil_card_map - run migrations');
    }
    foilPowerCardId = foilMapResult.rows[0].foil_card_id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: `foil-list-${timestamp}`,
        password: 'password123',
      });
    expect(loginResponse.status).toBe(200);
    authCookie = loginResponse.headers['set-cookie']![0].split(';')[0];

    await request(app)
      .post(`/api/v1/decks//cards`)
      .set('Cookie', authCookie)
      .send({ cardId: foilPowerCardId, cardType: 'power', quantity: 1 })
      .expect(200);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should return deck with foil card when deck has foil power card', async () => {
    const deckResponse = await request(app)
      .get(`/api/v1/decks/${testDeckId}`)
      .set('Cookie', authCookie)
      .expect(200);

    expect(deckResponse.body.success).toBe(true);
    const powerCard = deckResponse.body.data.cards?.find(
      (c: { type: string }) => c.type === 'power'
    );
    expect(powerCard).toBeTruthy();
    expect(powerCard.cardId).toBe(foilPowerCardId);
  });

  it('should load deck editor with foil scripts for list view', async () => {
    const htmlResponse = await request(app)
      .get(`/users/${testUser.id}/decks/${testDeckId}`)
      .expect(200);

    const html = htmlResponse.text;
    expect(html).toContain('deck-editor-rendering.js');
    expect(html).toContain('foil-effect.css');
  });
});
