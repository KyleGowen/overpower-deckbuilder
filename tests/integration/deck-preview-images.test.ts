/**
 * Integration test: deck list preview images after bulk card replace.
 *
 * Verifies:
 * 1. replaceAllCardsInDeck refreshes character preview metadata
 * 2. GET /api/v1/decks returns character preview cards with defaultImage
 * 3. LATERAL fallback still returns defaultImage when denormalized refs are cleared
 */

import request from 'supertest';
import { Pool } from 'pg';
import { app, initializeTestServer } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../setup-integration';
import { fetchMinimalValidDeckCards } from './helpers/minimalValidDeckCards';

describe('Deck list preview images integration tests', () => {
  let server: unknown;
  let pool: Pool;

  beforeAll(async () => {
    const { server: initializedServer } = await initializeTestServer();
    server = initializedServer;
    pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('bulk replace + deck list preview', () => {
    let testUser: { id: string; username: string };
    let testDeckId: string;
    let authCookie: string;
    let characterIds: string[];

    beforeAll(async () => {
      await integrationTestUtils.ensureGuestUser();
    });

    beforeEach(async () => {
      testUser = await integrationTestUtils.createTestUser({
        name: 'deck_preview_img_test',
        email: 'deck_preview_img_test@example.com',
        password: 'password123',
        role: 'USER',
      });

      const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
      const deck = await deckRepository.createDeck(
        testUser.id,
        'Deck Preview Image Test',
        'Deck for testing list preview defaultImage',
      );
      testDeckId = deck.id;
      integrationTestUtils.trackTestDeck(testDeckId);

      const charRows = await pool.query<{ id: string; image_path: string }>(
        `SELECT id, image_path FROM characters
         WHERE image_path IS NOT NULL AND TRIM(image_path) <> ''
         ORDER BY threat_level ASC NULLS LAST, id
         LIMIT 4`,
      );
      expect(charRows.rows.length).toBeGreaterThanOrEqual(4);
      characterIds = charRows.rows.map((r) => r.id);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: testUser.username, password: 'password123' });
      expect(loginResponse.status).toBe(200);
      authCookie = loginResponse.headers['set-cookie']![0].split(';')[0];
    });

    afterEach(async () => {
      const userRepo = DataSourceConfig.getInstance().getUserRepository();
      if (testUser) {
        try {
          await userRepo.deleteUser(testUser.id);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('returns defaultImage for characters after PUT cards (bulk replace)', async () => {
      const cards = characterIds.map((id) => ({
        cardType: 'character',
        cardId: id,
        quantity: 1,
      }));

      const putResponse = await request(app)
        .put(`/api/v1/decks/${testDeckId}/cards`)
        .set('Cookie', authCookie)
        .send({ cards });

      expect(putResponse.status).toBe(200);
      expect(putResponse.body.success).toBe(true);

      const decksRow = await pool.query(
        `SELECT character_1_id, character_2_id, character_3_id, character_4_id
         FROM decks WHERE id = $1`,
        [testDeckId],
      );
      expect(decksRow.rows[0].character_1_id).toBeTruthy();

      const listResponse = await request(app).get('/api/v1/decks').set('Cookie', authCookie);
      expect(listResponse.status).toBe(200);

      const deck = listResponse.body.data?.find(
        (d: { metadata?: { id?: string } }) => d.metadata?.id === testDeckId,
      );
      expect(deck).toBeTruthy();

      const previewChars = (deck.cards ?? []).filter(
        (c: { type?: string }) => c.type === 'character',
      );
      expect(previewChars.length).toBeGreaterThanOrEqual(4);
      previewChars.forEach((c: { defaultImage?: string }) => {
        expect(typeof c.defaultImage).toBe('string');
        expect(c.defaultImage!.trim().length).toBeGreaterThan(0);
      });
    });

    it('returns defaultImage via deck_cards fallback when denormalized character refs are cleared', async () => {
      const minimalCards = await fetchMinimalValidDeckCards(pool);
      const characters = minimalCards.filter((c) => c.type === 'character');

      const putResponse = await request(app)
        .put(`/api/v1/decks/${testDeckId}/cards`)
        .set('Cookie', authCookie)
        .send({
          cards: minimalCards.map((c) => ({
            cardType: c.type,
            cardId: c.cardId,
            quantity: c.quantity,
          })),
        });

      expect(putResponse.status).toBe(200);

      await pool.query(
        `UPDATE decks
         SET character_1_id = NULL,
             character_2_id = NULL,
             character_3_id = NULL,
             character_4_id = NULL
         WHERE id = $1`,
        [testDeckId],
      );

      const listResponse = await request(app).get('/api/v1/decks').set('Cookie', authCookie);
      expect(listResponse.status).toBe(200);

      const deck = listResponse.body.data?.find(
        (d: { metadata?: { id?: string } }) => d.metadata?.id === testDeckId,
      );
      expect(deck).toBeTruthy();

      const previewChars = (deck.cards ?? []).filter(
        (c: { type?: string }) => c.type === 'character',
      );
      expect(previewChars.length).toBe(characters.length);

      previewChars.forEach((c: { defaultImage?: string; cardId?: string }) => {
        expect(typeof c.defaultImage).toBe('string');
        expect(c.defaultImage!.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
