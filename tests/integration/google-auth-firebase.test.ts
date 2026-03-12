/**
 * Integration tests for Firebase Google Sign-In endpoints.
 * Tests GET /api/config/firebase and POST /api/auth/google error paths.
 * Full success flow requires Firebase Admin SDK (mocked in unit tests).
 */
import request from 'supertest';
import { app, initializeTestServer, closeTestServer } from '../../src/test-server';

describe('Google Auth / Firebase Integration Tests', () => {
  beforeAll(async () => {
    await initializeTestServer();
  });

  afterAll(async () => {
    await closeTestServer();
  });

  describe('GET /api/config/firebase', () => {
    it('should return Firebase config when env vars are set', async () => {
      const response = await request(app).get('/api/config/firebase');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('apiKey');
      expect(response.body).toHaveProperty('authDomain');
      expect(response.body).toHaveProperty('projectId');
      expect(response.body).toHaveProperty('appId');
      // When configured (e.g. in CI with .env), values are non-empty
      // When not configured, they are empty strings - both are valid responses
    });

    it('should return JSON with all expected keys', async () => {
      const response = await request(app).get('/api/config/firebase');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(typeof response.body.apiKey).toBe('string');
      expect(typeof response.body.authDomain).toBe('string');
      expect(typeof response.body.projectId).toBe('string');
      expect(typeof response.body.appId).toBe('string');
    });
  });

  describe('POST /api/auth/google', () => {
    it('should return 400 when idToken is missing', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('idToken is required');
    });

    it('should return 400 when idToken is empty string', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({ idToken: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('idToken is required');
    });

    it('should return 400 when idToken is not a string', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 12345 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('idToken is required');
    });

    it('should return 503 when Firebase not configured, or 401 when token invalid', async () => {
      // 503 if no service account; 401 if Firebase configured but token is invalid
      const response = await request(app)
        .post('/api/auth/google')
        .send({ idToken: 'fake-invalid-token' });

      expect([401, 503]).toContain(response.status);
      expect(response.body.success).toBe(false);
      if (response.status === 503) {
        expect(response.body.error).toBe('Google sign-in is not configured');
      } else {
        expect(response.body.error).toBe('Invalid or expired token');
      }
    });
  });
});
