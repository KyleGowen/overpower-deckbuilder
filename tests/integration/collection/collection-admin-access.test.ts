/**
 * Integration tests for Collection Access Control
 * 
 * Tests that all collection endpoints allow access for all authenticated users:
 * - ADMIN users can access all endpoints
 * - USER users can access all endpoints
 * - GUEST users can access all endpoints (frontend handles localStorage sandbox)
 * - Unauthenticated users receive 401 Unauthorized
 */

import request from 'supertest';
import { Pool } from 'pg';
import { app } from '../../../src/test-server';
import { DataSourceConfig } from '../../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../../setup-integration';

describe('Collection Access Control Integration Tests', () => {
  let pool: Pool;
  let adminUser: any;
  let regularUser: any;
  let guestUser: any;
  let adminAuthCookie: string;
  let regularAuthCookie: string;
  let guestAuthCookie: string;
  let adminUsername: string;
  let regularUsername: string;
  let testCharacterId: string;

  beforeAll(async () => {
    await integrationTestUtils.ensureGuestUser();
    await integrationTestUtils.ensureAdminUser();

    // Initialize database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/overpower_deckbuilder_test'
    });

    // Get test card ID
    const characterResult = await pool.query('SELECT id FROM characters LIMIT 1');
    if (characterResult.rows.length === 0) {
      throw new Error('No test cards available in database');
    }
    testCharacterId = characterResult.rows[0].id;

    // Create users with different roles
    const timestamp = Date.now();
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    
    // Create ADMIN user
    adminUsername = `collection-admin-${timestamp}`;
    adminUser = await userRepository.createUser(
      adminUsername,
      `admin-${timestamp}@example.com`,
      'adminpass123',
      'ADMIN'
    );
    integrationTestUtils.trackTestUser(adminUser.id);

    // Create regular USER
    regularUsername = `collection-user-${timestamp}`;
    regularUser = await userRepository.createUser(
      regularUsername,
      `user-${timestamp}@example.com`,
      'userpass123',
      'USER'
    );
    integrationTestUtils.trackTestUser(regularUser.id);

    // Create GUEST user
    const guestUsername = `collection-guest-${timestamp}`;
    guestUser = await userRepository.createUser(
      guestUsername,
      `guest-${timestamp}@example.com`,
      'guestpass123',
      'GUEST'
    );
    integrationTestUtils.trackTestUser(guestUser.id);

    // Login as admin
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: adminUsername,
        password: 'adminpass123'
      });
    adminAuthCookie = adminLoginResponse.headers['set-cookie'][0].split(';')[0];

    // Login as regular user
    const regularLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: regularUsername,
        password: 'userpass123'
      });
    regularAuthCookie = regularLoginResponse.headers['set-cookie'][0].split(';')[0];

    // Login as guest
    const guestLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: guestUsername,
        password: 'guestpass123'
      });
    guestAuthCookie = guestLoginResponse.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/collections/me', () => {
    it('should allow ADMIN users to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me')
        .set('Cookie', adminAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should allow USER to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me')
        .set('Cookie', regularAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should allow GUEST users to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me')
        .set('Cookie', guestAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication required');
    });
  });

  describe('GET /api/v1/collections/me/cards', () => {
    it('should allow ADMIN users to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me/cards')
        .set('Cookie', adminAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow USER to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me/cards')
        .set('Cookie', regularAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should allow GUEST users to access', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me/cards')
        .set('Cookie', guestAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/collections/me/cards')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/collections/me/cards', () => {
    beforeEach(async () => {
      // Clear all test users' collections before each test
      for (const user of [adminUser, regularUser, guestUser]) {
        const collectionResult = await pool.query(
          'SELECT id FROM collections WHERE user_id = $1',
          [user.id]
        );
        if (collectionResult.rows.length > 0) {
          const collectionId = collectionResult.rows[0].id;
          await pool.query('DELETE FROM collection_cards WHERE collection_id = $1', [collectionId]);
        }
      }
    });

    it('should allow ADMIN users to add cards', async () => {
      const response = await request(app)
        .post('/api/v1/collections/me/cards')
        .set('Cookie', adminAuthCookie)
        .send({
          cardId: testCharacterId,
          cardType: 'character',
          quantity: 1,
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should allow USER to add cards', async () => {
      const response = await request(app)
        .post('/api/v1/collections/me/cards')
        .set('Cookie', regularAuthCookie)
        .send({
          cardId: testCharacterId,
          cardType: 'character',
          quantity: 1,
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should allow GUEST users to add cards', async () => {
      const response = await request(app)
        .post('/api/v1/collections/me/cards')
        .set('Cookie', guestAuthCookie)
        .send({
          cardId: testCharacterId,
          cardType: 'character',
          quantity: 1,
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toBeDefined();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/collections/me/cards')
        .send({
          cardId: testCharacterId,
          cardType: 'character',
          quantity: 1,
          imagePath: '/images/test-character.webp'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/collections/me/cards/:cardId', () => {
    beforeEach(async () => {
      // Add a card to all test users' collections for testing updates
      for (const user of [adminUser, regularUser, guestUser]) {
        const collectionResult = await pool.query(
          'SELECT id FROM collections WHERE user_id = $1',
          [user.id]
        );
        let collectionId: string;
        if (collectionResult.rows.length === 0) {
          const insertResult = await pool.query(
            'INSERT INTO collections (user_id) VALUES ($1) RETURNING id',
            [user.id]
          );
          collectionId = insertResult.rows[0].id;
        } else {
          collectionId = collectionResult.rows[0].id;
          await pool.query('DELETE FROM collection_cards WHERE collection_id = $1', [collectionId]);
        }

        await pool.query(
          'INSERT INTO collection_cards (collection_id, card_id, card_type, quantity, image_path) VALUES ($1, $2, $3, $4, $5)',
          [collectionId, testCharacterId, 'character', 1, '/images/test-character.webp']
        );
      }
    });

    it('should allow ADMIN users to update cards', async () => {
      const response = await request(app)
        .put(`/api/v1/collections/me/cards/${testCharacterId}`)
        .set('Cookie', adminAuthCookie)
        .send({
          quantity: 5,
          cardType: 'character',
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.quantity).toBe(5);
    });

    it('should allow USER to update cards', async () => {
      const response = await request(app)
        .put(`/api/v1/collections/me/cards/${testCharacterId}`)
        .set('Cookie', regularAuthCookie)
        .send({
          quantity: 5,
          cardType: 'character',
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.quantity).toBe(5);
    });

    it('should allow GUEST users to update cards', async () => {
      const response = await request(app)
        .put(`/api/v1/collections/me/cards/${testCharacterId}`)
        .set('Cookie', guestAuthCookie)
        .send({
          quantity: 5,
          cardType: 'character',
          imagePath: '/images/test-character.webp'
        })
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.quantity).toBe(5);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/collections/me/cards/${testCharacterId}`)
        .send({
          quantity: 5,
          cardType: 'character',
          imagePath: '/images/test-character.webp'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/collections/me/cards/:cardId', () => {
    beforeEach(async () => {
      // Add a card to all test users' collections for testing deletion
      for (const user of [adminUser, regularUser, guestUser]) {
        const collectionResult = await pool.query(
          'SELECT id FROM collections WHERE user_id = $1',
          [user.id]
        );
        let collectionId: string;
        if (collectionResult.rows.length === 0) {
          const insertResult = await pool.query(
            'INSERT INTO collections (user_id) VALUES ($1) RETURNING id',
            [user.id]
          );
          collectionId = insertResult.rows[0].id;
        } else {
          collectionId = collectionResult.rows[0].id;
          await pool.query('DELETE FROM collection_cards WHERE collection_id = $1', [collectionId]);
        }

        await pool.query(
          'INSERT INTO collection_cards (collection_id, card_id, card_type, quantity, image_path) VALUES ($1, $2, $3, $4, $5)',
          [collectionId, testCharacterId, 'character', 1, '/images/test-character.webp']
        );
      }
    });

    it('should allow ADMIN users to delete cards', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/me/cards/${testCharacterId}?cardType=character`)
        .set('Cookie', adminAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.message).toContain('removed');
    });

    it('should allow USER to delete cards', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/me/cards/${testCharacterId}?cardType=character`)
        .set('Cookie', regularAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.message).toContain('removed');
    });

    it('should allow GUEST users to delete cards', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/me/cards/${testCharacterId}?cardType=character`)
        .set('Cookie', guestAuthCookie)
        .expect(200);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data.message).toContain('removed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/collections/me/cards/${testCharacterId}?cardType=character`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication requirement across all endpoints', () => {
    it('should require authentication for all collection endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/v1/collections/me' },
        { method: 'get', path: '/api/v1/collections/me/cards' },
        { method: 'post', path: '/api/v1/collections/me/cards', body: { cardId: testCharacterId, cardType: 'character', quantity: 1, imagePath: '/images/test.webp' } },
        { method: 'put', path: `/api/v1/collections/me/cards/${testCharacterId}`, body: { quantity: 5, cardType: 'character', imagePath: '/images/test.webp' } },
        { method: 'delete', path: `/api/v1/collections/me/cards/${testCharacterId}?cardType=character` }
      ];

      for (const endpoint of endpoints) {
        const agent = request(app) as any;
        const response = await agent[endpoint.method](endpoint.path)
          .send(endpoint.body || {})
          .expect(401);

        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('All authenticated users can access collection endpoints', () => {
    it('should allow all authenticated users to access GET endpoints', async () => {
      const cookies = [adminAuthCookie, regularAuthCookie, guestAuthCookie];
      
      for (const cookie of cookies) {
        const meResponse = await request(app)
          .get('/api/v1/collections/me')
          .set('Cookie', cookie)
          .expect(200);
        expect(meResponse.body.errors).toEqual([]);

        const cardsResponse = await request(app)
          .get('/api/v1/collections/me/cards')
          .set('Cookie', cookie)
          .expect(200);
        expect(cardsResponse.body.errors).toEqual([]);
      }
    });
  });
});
