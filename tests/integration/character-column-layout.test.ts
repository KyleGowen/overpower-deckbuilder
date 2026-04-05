/**
 * Integration test for character column layout in deck editor
 * Tests that character cards always display in single column layout
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.SKIP_MIGRATIONS = 'true';

// Import test server
import request from 'supertest';
import { app } from '../../src/test-server';
import { DataSourceConfig } from '../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../setup-integration';

describe('Character Column Layout Integration Tests', () => {
  let testUser: any;
  let testDeck: any;
  let authCookie: string;

  beforeAll(async () => {
    // Ensure guest user exists
    await integrationTestUtils.ensureGuestUser();
  });

  afterAll(async () => {
    // Clean up test users
    const userRepo = DataSourceConfig.getInstance().getUserRepository();
    if (testUser) {
      try {
        await userRepo.deleteUser(testUser.id);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  beforeEach(async () => {
    // Create test user and deck for each test
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    const deckRepository = DataSourceConfig.getInstance().getDeckRepository();
    
    testUser = await userRepository.createUser(
      `charlayout_${Date.now()}`,
      `charlayout_${Date.now()}@example.com`,
      'testpass123',
      'USER'
    );

    // Create a test deck
    testDeck = await deckRepository.createDeck(
      testUser.id,
      'Character Layout Test Deck',
      'A deck for testing character column layout'
    );
    
    // Track this deck for cleanup
    integrationTestUtils.trackTestDeck(testDeck.id);

    // Login and get auth cookie
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUser.name,
        password: 'testpass123'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    
    // Extract session cookie
    authCookie = loginResponse.headers['set-cookie']![0].split(';')[0];
  });

  afterEach(async () => {
    // Clean up test user created in beforeEach
    const userRepo = DataSourceConfig.getInstance().getUserRepository();
    if (testUser) {
      try {
        await userRepo.deleteUser(testUser.id);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Character Column Layout', () => {
    // Layout logic lives in /js/deck-editor-layout.js (not inlined in index.html).
    async function assertLayoutAssetServed(): Promise<string> {
      const layoutRes = await request(app).get('/js/deck-editor-layout.js');
      expect(layoutRes.status).toBe(200);
      expect(layoutRes.text).toContain('forceCharacterSingleColumnLayout');
      expect(layoutRes.text).toContain('#deck-type-character');
      return layoutRes.text;
    }

    it('should display character cards in single column when deck editor first loads', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('deckEditorModal');
      expect(response.text).toContain('<script src="/js/deck-editor-layout.js"');
      expect(response.text).toContain('<link rel="stylesheet" href="/css/index.css">');
      expect(response.text).toContain('deck-type-cards');

      await assertLayoutAssetServed();
    });

    it('should maintain single column layout after adding cards to deck', async () => {
      const addCardResponse = await request(app)
        .post(`/api/v1/decks/${testDeck.id}/cards`)
        .set('Cookie', authCookie)
        .send({
          cardId: 'test-character-1',
          cardType: 'character'
        });

      expect([200, 404]).toContain(addCardResponse.status);

      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('deckEditorModal');
      expect(response.text).toContain('<link rel="stylesheet" href="/css/index.css">');
      expect(response.text).toContain('deck-type-cards');
      expect(response.text).toContain('<script src="/js/deck-editor-layout.js"');
    });

    it('should have JavaScript function that enforces single column layout', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);

      const layoutSrc = await assertLayoutAssetServed();
      expect(layoutSrc).toContain('querySelectorAll');
      expect(layoutSrc).toContain('grid-template-columns');
      expect(layoutSrc).toContain('force-single-column');
    });

    it('should call the layout function at multiple points in deck loading', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);

      const coreRes = await request(app).get('/js/deck-editor-core.js');
      expect(coreRes.status).toBe(200);
      expect(coreRes.text).toContain('forceCharacterSingleColumnLayout();');
      expect(coreRes.text).toContain('setTimeout');
    });

    it('should override read-only mode 4-column layout for character cards', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('<link rel="stylesheet" href="/css/index.css">');
      expect(response.text).toContain('read-only-mode');
    });

    it('should have multiple CSS selectors targeting character cards', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('deck-type-cards');
      expect(response.text).toContain('character-card');

      const layoutSrc = await assertLayoutAssetServed();
      expect(layoutSrc).toContain('.deck-type-section[data-type="character"]');
    });

    it('should include character layout scripts and styles without relying on debug logs', async () => {
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);

      expect(response.status).toBe(200);
      expect(response.text).toContain('<script src="/js/deck-editor-layout.js"');
      expect(response.text).toContain('<link rel="stylesheet" href="/css/index.css">');
      await assertLayoutAssetServed();
    });
  });

  describe('Character Layout Performance', () => {
    it('should load deck editor with character layout fix within reasonable time', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get(`/users/${testUser.id}/decks/${testDeck.id}`)
        .set('Cookie', authCookie);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });
});
