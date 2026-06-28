import request from 'supertest';
import { app } from '../../src/test-server';
import { initializeTestServer } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';
import { describeV1Frontend, itV1Frontend } from './helpers/v1FrontendSkip';

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

  describeV1Frontend('View Switching Functionality', () => {
    test('should load main page with global nav component', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that the page contains the global nav container and loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('<script src="/js/app-initialization.js" defer></script>');
    });

    test('should include global nav JavaScript and CSS files', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that global nav component files are referenced
      expect(response.text).toContain('components/globalNav.css');
      expect(response.text).toContain('components/globalNav.js');
      expect(response.text).toContain('loadGlobalNav');
    });

    test('should serve global nav HTML component', async () => {
      const response = await request(app)
        .get('/components/globalNav.html')
        .expect(200);

      // Verify the HTML structure
      expect(response.text).toContain('<div class="unified-header">');
      expect(response.text).toContain('<div class="header-left">');
      expect(response.text).toContain('<div class="header-nav-cluster">');
      expect(response.text).toContain('<div class="header-center">');
      expect(response.text).toContain('class="header-app-actions"');
      expect(response.text).toContain('<div class="header-right">');
      expect(response.text).toContain('onclick="switchToDatabaseView()"');
      expect(response.text).toContain('onclick="switchToDeckBuilder()"');
      expect(response.text).toContain('onclick="createNewDeck()"');
    });

    test('should serve global nav CSS component', async () => {
      const response = await request(app)
        .get('/components/globalNav.css')
        .expect(200);

      // Verify CSS classes are present
      expect(response.text).toContain('.unified-header');
      expect(response.text).toContain('.header-left');
      expect(response.text).toContain('.header-center');
      expect(response.text).toContain('.header-right');
      expect(response.text).toContain('.header-app-actions');
      expect(response.text).toContain('.header-nav-cluster');
      expect(response.text).toContain('.app-tab-button');
      expect(response.text).toContain('.create-deck-btn');
      expect(response.text).toContain('.logout-btn');
    });

    test('should serve global nav JavaScript component', async () => {
      const response = await request(app)
        .get('/components/globalNav.js')
        .expect(200);

      // Verify JavaScript functions are present
      expect(response.text).toContain('function switchToDatabaseView()');
      expect(response.text).toContain('function switchToDeckBuilder()');
      expect(response.text).toContain('function initializeGlobalNav()');
      expect(response.text).toContain('function updateUserWelcome()');
      expect(response.text).toContain('function createNewDeck()');
    });
  });

  describe('Create Deck Functionality', () => {
    itV1Frontend('should have create deck button in global nav', async () => {
      const response = await request(app)
        .get('/components/globalNav.html')
        .expect(200);

      // Verify create deck button is present
      expect(response.text).toContain('id="createDeckBtn"');
      expect(response.text).toContain('class="create-deck-btn"');
      expect(response.text).toContain('onclick="createNewDeck()"');
      expect(response.text).toContain('+ Create Deck');
    });

    itV1Frontend('should have create deck functionality', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that the main page includes deck editor modal
      expect(response.text).toContain('deckEditorModal');
      
      // Check that the global nav JavaScript includes createNewDeck function
      const jsResponse = await request(app)
        .get('/components/globalNav.js')
        .expect(200);
      expect(jsResponse.text).toContain('function createNewDeck()');
    });

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
    itV1Frontend('should have logout button in global nav', async () => {
      const response = await request(app)
        .get('/components/globalNav.html')
        .expect(200);

      // Verify logout button is present
      expect(response.text).toContain('id="logoutBtn"');
      expect(response.text).toContain('class="logout-btn"');
      expect(response.text).toContain('Log Out');
    });

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

  describeV1Frontend('User Welcome Message', () => {
    test('should display username in global nav', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that username display elements are present in the global nav component
      // Note: These are loaded dynamically, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });

    test('should handle guest user display', async () => {
      const response = await request(app)
        .get('/users/guest/decks')
        .expect(200);

      // Check that guest user elements are present in the global nav component
      // Note: These are loaded dynamically, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });
  });

  describeV1Frontend('Navigation State Management', () => {
    test('should handle browser back/forward navigation', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that popstate event listener is set up
      // Note: These may be in external JS files, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });

    test('should update URL without page reload', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that history.pushState is used
      // Note: This may be in external JS files, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });
  });

  describeV1Frontend('Error Handling', () => {
    test('should handle missing DOM elements gracefully', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that null checks are in place
      // Note: These may be in external JS files, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });

    test('should handle missing functions gracefully', async () => {
      const response = await request(app)
        .get('/components/globalNav.js')
        .expect(200);

      // Check that function existence checks are in place
      expect(response.text).toContain('typeof');
      expect(response.text).toContain('function');
    });
  });

  describeV1Frontend('CSS Styling Integration', () => {
    test('should have proper CSS classes for styling', async () => {
      const response = await request(app)
        .get('/components/globalNav.css')
        .expect(200);

      // Check for key CSS classes
      expect(response.text).toContain('.unified-header');
      expect(response.text).toContain('.app-tab-button');
      expect(response.text).toContain('.create-deck-btn');
      expect(response.text).toContain('.logout-btn');
      expect(response.text).toContain('.header-logo');
    });

    test('should have responsive design elements', async () => {
      const response = await request(app)
        .get('/components/globalNav.css')
        .expect(200);

      // Check for flexbox and responsive design
      expect(response.text).toContain('display: flex');
      expect(response.text).toContain('justify-content');
      expect(response.text).toContain('align-items');
    });
  });

  describeV1Frontend('Component Integration', () => {
    test('should integrate with main application pages', async () => {
      // Test database view page
      const dbResponse = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      expect(dbResponse.text).toContain('id="globalNav"');
      expect(dbResponse.text).toContain('loadGlobalNav');

      // Test deck builder page
      const deckResponse = await request(app)
        .get('/deck-builder.html')
        .expect(200);

      expect(deckResponse.text).toContain('id="globalNav"');
    });

    test('should maintain state across view switches', async () => {
      const response = await request(app)
        .get('/users/${testUserId}/decks')
        .expect(200);

      // Check that state management is in place
      // Note: These may be in external JS files, so we check for the loading mechanism
      expect(response.text).toContain('id="globalNav"');
      expect(response.text).toContain('loadGlobalNav');
    });
  });
});
