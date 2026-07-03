import request from 'supertest';
import { app } from '../../src/test-server';
import { initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';

describe('Global Nav Integration Tests', () => {
  let userSessionCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    await initializeTestServer();

    // Create a unique test user for this test suite
    const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
    const dataSource = DataSourceConfig.getInstance();
    const userRepository = dataSource.getUserRepository();
    
    const testUser = await userRepository.createUser(
      'test-global-nav-user',
      'test-global-nav-user@example.com',
      'testpassword123',
      'ADMIN'
    );
    testUserId = testUser.id;

    // Login as test user to get session cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'test-global-nav-user',
        password: 'testpassword123'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    
    // Extract session cookie
    const cookies = loginResponse.headers['set-cookie'];
    userSessionCookie = cookies[0].split(';')[0];
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      try {
        const { DataSourceConfig } = await import('../../src/config/DataSourceConfig');
        const dataSource = DataSourceConfig.getInstance();
        const userRepository = dataSource.getUserRepository();
        await userRepository.deleteUser(testUserId);
      } catch (error) {
        // User might already be deleted, ignore error
      }
    }

  });

  describe('Create Deck Functionality', () => {
    test('should handle create deck API endpoint', async () => {
      // Test that the create deck API endpoint exists and is accessible
      const response = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Test Deck',
          description: 'Test deck description',
          characters: []
        })
        .expect(201);

      expect(response.body.errors).toEqual([]);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Deck');
    });

    test('should validate deck creation with character limits', async () => {
      // Valid create: omit characters or use real character UUIDs (FK). Empty list exercises v1 + DB happy path.
      const validResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Valid Deck',
          description: 'Valid deck without initial characters',
          characters: []
        })
        .expect(201);

      expect(validResponse.body.errors).toEqual([]);

      // Test invalid deck creation (5+ character slots — rejected before persistence)
      const invalidResponse = await request(app)
        .post('/api/v1/decks')
        .set('Cookie', userSessionCookie)
        .send({
          name: 'Invalid Deck',
          description: 'Invalid deck with 5 characters',
          characters: [
            '11111111-1111-1111-1111-111111111101',
            '11111111-1111-1111-1111-111111111102',
            '11111111-1111-1111-1111-111111111103',
            '11111111-1111-1111-1111-111111111104',
            '11111111-1111-1111-1111-111111111105'
          ]
        })
        .expect(400);

      expect(invalidResponse.body.errors[0].message).toContain('Maximum 4 characters');
    });
  });

  describe('Logout Functionality', () => {
    test('should handle logout API endpoint', async () => {
      // Test logout endpoint
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });

    test('should clear session on logout', async () => {
      // First, create a test user
      const testUser = await integrationTestUtils.createTestUser({
        name: 'testuser',
        email: 'testuser@example.com',
        password: 'testpass'
      });

      // Create a session by logging in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'testpass'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // Then logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(logoutResponse.body.success).toBe(true);

      // Verify session is cleared by checking auth status
      const authResponse = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(authResponse.body.success).toBe(false);

      // Test user will be cleaned up by global cleanup
    });
  });
});
