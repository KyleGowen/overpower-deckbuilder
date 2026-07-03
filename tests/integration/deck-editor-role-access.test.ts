import request from 'supertest';
import { app, integrationTestUtils } from '../setup-integration';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { UserRepository } from '../../src/repository/UserRepository';

describe('Deck Editor Role-Based Access Integration Tests', () => {
  let userRepository: UserRepository;
  let guestUser: any;
  let userRoleUser: any;
  let adminUser: any;
  let guestSessionCookie: string;
  let userSessionCookie: string;
  let adminSessionCookie: string;

  beforeAll(async () => {
    const dataSourceConfig = DataSourceConfig.getInstance();
    userRepository = dataSourceConfig.getUserRepository();

    // Create test users for each role
    guestUser = await userRepository.createUser(
      'test-guest-editor',
      'test-guest-editor@example.com',
      'testpassword',
      'GUEST'
    );

    userRoleUser = await userRepository.createUser(
      'test-user-editor',
      'test-user-editor@example.com',
      'testpassword',
      'USER'
    );

    adminUser = await userRepository.createUser(
      'test-admin-editor',
      'test-admin-editor@example.com',
      'testpassword',
      'ADMIN'
    );

    // Login all users to get session cookies
    const guestLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test-guest-editor',
        password: 'testpassword'
      });

    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test-user-editor',
        password: 'testpassword'
      });

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test-admin-editor',
        password: 'testpassword'
      });

    expect(guestLoginResponse.status).toBe(200);
    expect(userLoginResponse.status).toBe(200);
    expect(adminLoginResponse.status).toBe(200);

    guestSessionCookie = guestLoginResponse.headers['set-cookie'][0].split(';')[0];
    userSessionCookie = userLoginResponse.headers['set-cookie'][0].split(';')[0];
    adminSessionCookie = adminLoginResponse.headers['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    // Clean up test users
    try {
      await userRepository.deleteUser(guestUser.id);
      await userRepository.deleteUser(userRoleUser.id);
      await userRepository.deleteUser(adminUser.id);
    } catch (error) {
      // Users might already be deleted, ignore error
    }
  });

  describe('Deck Creation API Restrictions', () => {
    it('should deny GUEST users from creating decks via main API (POST /api/decks)', async () => {
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', guestSessionCookie)
        .send({
          name: 'Test Deck by Guest',
          description: 'A deck creation attempt by GUEST user'
        });

      expect(createDeckResponse.status).toBe(403);
      expect(createDeckResponse.body.errors?.length).toBeGreaterThan(0);
      expect(createDeckResponse.body.errors?.[0]?.code).toBe('GUEST_FORBIDDEN');
    });

    it('should allow GUEST users to create and save a deck via guest API (POST /api/v1/guest/decks)', async () => {
      const createRes = await request(app)
        .post('/api/v1/guest/decks')
        .set('Cookie', guestSessionCookie)
        .send({ name: 'Guest Session Deck', description: 'Session-scoped deck' });
      expect(createRes.status).toBe(201);
      expect(createRes.body.errors).toEqual([]);
      expect(createRes.body.data.id).toMatch(/^guest_/);
      const deckId = createRes.body.data.id;

      const putRes = await request(app)
        .put(`/api/v1/guest/decks/${deckId}/cards`)
        .set('Cookie', guestSessionCookie)
        .send({ cards: [] });
      expect(putRes.status).toBe(200);
      expect(putRes.body.errors).toEqual([]);
    });

    it('should allow USER role users to create decks via API', async () => {
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck by User Role',
          description: 'A deck created by USER role user'
        });

      expect(createDeckResponse.status).toBe(201);
      expect(createDeckResponse.body.errors).toEqual([]);
        expect(createDeckResponse.body.data).toBeDefined();
      expect(createDeckResponse.body.data.name).toBe('Test Deck by User Role');

      const deckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(deckId);
    });

    it('should allow ADMIN users to create decks via API', async () => {
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', adminSessionCookie)
        .send({
          name: 'Test Deck by Admin Role',
          description: 'A deck created by ADMIN role user'
        });

      expect(createDeckResponse.status).toBe(201);
      expect(createDeckResponse.body.errors).toEqual([]);
        expect(createDeckResponse.body.data).toBeDefined();
      expect(createDeckResponse.body.data.name).toBe('Test Deck by Admin Role');

      const deckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(deckId);
    });
  });

  describe('Deck Modification API Restrictions', () => {
    it('should deny GUEST users from modifying decks via API', async () => {
      // Create a test deck first
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck for Guest Modification Test',
          description: 'A deck to test guest modification restrictions'
        });

      expect(createDeckResponse.status).toBe(201);
      const testDeckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(testDeckId);

      const modifyDeckResponse = await request(app)
        .put(`/api/v1/decks/${testDeckId}`)
        .set('Cookie', guestSessionCookie)
        .send({
          name: 'Modified Deck Name by Guest',
          description: 'Modified description by guest'
        });

      expect(modifyDeckResponse.status).toBe(403);
      expect(modifyDeckResponse.body.errors?.[0]?.code).toBe('GUEST_FORBIDDEN');
    });

    it('should allow USER role users to modify their own decks via API', async () => {
      // Create a test deck for this specific test
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck for User Modification',
          description: 'A deck to test user modification permissions'
        });

      expect(createDeckResponse.status).toBe(201);
      const testDeckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(testDeckId);

      const modifyDeckResponse = await request(app)
        .put(`/api/v1/decks/${testDeckId}`)
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Modified Deck Name by User',
          description: 'Modified description by user'
        });

      expect(modifyDeckResponse.status).toBe(200);
      expect(modifyDeckResponse.body.errors).toEqual([]);
      expect(modifyDeckResponse.body.data.metadata.name).toBe('Modified Deck Name by User');
    });

    it('should allow ADMIN users to modify decks via API', async () => {
      // Create a test deck with admin user for this specific test
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', adminSessionCookie)
        .send({
          name: 'Test Deck for Admin Modification',
          description: 'A deck to test admin modification permissions'
        });

      expect(createDeckResponse.status).toBe(201);
      const testDeckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(testDeckId);

      const modifyDeckResponse = await request(app)
        .put(`/api/v1/decks/${testDeckId}`)
        .set('Cookie', adminSessionCookie)
        .send({
          name: 'Modified Deck Name by Admin',
          description: 'Modified description by admin'
        });

      expect(modifyDeckResponse.status).toBe(200);
      expect(modifyDeckResponse.body.errors).toEqual([]);
      expect(modifyDeckResponse.body.data.metadata.name).toBe('Modified Deck Name by Admin');
    });
  });

  describe('Deck Deletion API Restrictions', () => {
    it('should deny GUEST users from deleting decks via API', async () => {
      // Create a test deck for this specific test
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck for Guest Deletion Test',
          description: 'A deck to test guest deletion restrictions'
        });

      expect(createDeckResponse.status).toBe(201);
      const testDeckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(testDeckId);

      const deleteDeckResponse = await request(app)
        .delete(`/api/v1/decks/${testDeckId}`)
        .set('Cookie', guestSessionCookie);

      expect(deleteDeckResponse.status).toBe(403);
      expect(deleteDeckResponse.body.errors?.[0]?.code).toBe('GUEST_FORBIDDEN');
    });

    it('should allow USER role users to delete their own decks via API', async () => {
      // Create a test deck for this specific test
      const createDeckResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck for User Deletion',
          description: 'A deck to test user deletion permissions'
        });

      expect(createDeckResponse.status).toBe(201);
      const testDeckId = createDeckResponse.body.data.id;
      
      // Track this deck for cleanup
      integrationTestUtils.trackTestDeck(testDeckId);

      const deleteDeckResponse = await request(app)
        .delete(`/api/v1/decks/${testDeckId}`)
        .set('Cookie', userSessionCookie);

      expect(deleteDeckResponse.status).toBe(200);
      expect(deleteDeckResponse.body.errors).toEqual([]);
      expect(deleteDeckResponse.body.data?.message).toBe('Deck deleted successfully');

      // Untrack since it's deleted
      integrationTestUtils.untrackTestDeck(testDeckId);
    });
  });
});
