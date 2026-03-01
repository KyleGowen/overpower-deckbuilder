/**
 * Integration tests for foil handling in Collection View.
 *
 * Verifies:
 * - Create user (ADMIN), add foil card to collection
 * - Collection API returns foil card with is_foil
 * - Collection view page loads foil-related structure (collection-foil-badge, collection-view.js)
 */

import request from 'supertest';
import { Pool } from 'pg';
import { app, initializeTestServer } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../setup-integration';

describe('Foil Collection View Integration Tests', () => {
  let pool: Pool;
  let testUser: any;
  let authCookie: string;
  let foilPowerCardId: string;

  beforeAll(async () => {
    await initializeTestServer();
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower',
    });

    await integrationTestUtils.ensureGuestUser();

    const timestamp = Date.now();
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    testUser = await userRepository.createUser(
      `foil-collection-${timestamp}`,
      `foil-collection-${timestamp}@example.com`,
      'password123',
      'ADMIN'
    );
    integrationTestUtils.trackTestUser(testUser.id);

    const foilMapResult = await pool.query(
      'SELECT foil_card_id FROM foil_card_map WHERE card_type = $1 LIMIT 1',
      ['power']
    );
    if (foilMapResult.rows.length === 0) {
      throw new Error('No foil power cards in foil_card_map - run migrations');
    }
    foilPowerCardId = foilMapResult.rows[0].foil_card_id;

    const powerResult = await pool.query(
      'SELECT image_path FROM power_cards WHERE id = $1',
      [foilPowerCardId]
    );
    const imagePath = powerResult.rows[0]?.image_path || '';

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: `foil-collection-${timestamp}`,
        password: 'password123',
      });
    expect(loginResponse.status).toBe(200);
    authCookie = loginResponse.headers['set-cookie']![0].split(';')[0];

    await request(app)
      .post('/api/collections/me/cards')
      .set('Cookie', authCookie)
      .send({
        cardId: foilPowerCardId,
        cardType: 'power',
        quantity: 1,
        imagePath,
      })
      .expect(200);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should return collection cards with foil card including is_foil', async () => {
    const response = await request(app)
      .get('/api/collections/me/cards')
      .set('Cookie', authCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    const foilCard = response.body.data?.find(
      (c: { card_id: string }) => c.card_id === foilPowerCardId
    );
    expect(foilCard).toBeTruthy();
    expect(foilCard.card_data?.is_foil || foilCard.is_foil).toBe(true);
  });

  it('should load collection view page with foil-related scripts', async () => {
    const htmlResponse = await request(app)
      .get('/')
      .expect(200);

    const html = htmlResponse.text;
    expect(html).toContain('collection-view.js');
    expect(html).toContain('foil-effect.css');
  });
});
