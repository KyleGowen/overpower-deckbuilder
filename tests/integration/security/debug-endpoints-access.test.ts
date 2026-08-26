import request from 'supertest';
import { app } from '../../../src/test-server';
import { integrationTestUtils } from '../../setup-integration';

describe('Debug/User Endpoint Access Control Integration Tests', () => {
  let userCookie: string;
  let adminCookie: string;

  beforeAll(async () => {
    const user = await integrationTestUtils.createTestUser({
      name: 'debug-access-user',
      email: 'debug-access-user@example.com',
      role: 'USER',
      password: 'password123'
    });
    const admin = await integrationTestUtils.createTestUser({
      name: 'debug-access-admin',
      email: 'debug-access-admin@example.com',
      role: 'ADMIN',
      password: 'adminpass123'
    });

    const loginUser = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'password123' });
    expect(loginUser.status).toBe(200);
    userCookie = loginUser.headers['set-cookie'][0].split(';')[0];

    const loginAdmin = await request(app)
      .post('/api/auth/login')
      .send({ username: admin.username, password: 'adminpass123' });
    expect(loginAdmin.status).toBe(200);
    adminCookie = loginAdmin.headers['set-cookie'][0].split(';')[0];
  });

  const getEndpoints = [
    '/api/v1/admin/user-analytics',
    '/api/v1/admin/users',
    '/api/v1/admin/debug/clear-cache',
    '/api/v1/admin/debug/clear-card-cache',
    '/api/v1/admin/database/status'
  ];

  for (const endpoint of getEndpoints) {
    it(`requires authentication for GET ${endpoint}`, async () => {
      const res = await request(app).get(endpoint);
      expect(res.status).toBe(401);
    });

    it(`blocks non-admin users for GET ${endpoint}`, async () => {
      const res = await request(app).get(endpoint).set('Cookie', userCookie);
      expect(res.status).toBe(403);
      expect(res.body.errors?.[0]?.code).toBe('ADMIN_REQUIRED');
    });

    it(`allows admin users for GET ${endpoint}`, async () => {
      const res = await request(app).get(endpoint).set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.errors).toEqual([]);
    });
  }

  it('returns aggregate deck and collection statistics for an admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/user-analytics')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.deckStatistics).toEqual(expect.objectContaining({
      totalDecks: expect.any(Number),
      legalDecks: expect.any(Number),
      legalPercentage: expect.any(Number),
      limitedDecks: expect.any(Number),
      limitedPercentage: expect.any(Number),
      averageDecksPerUser: expect.any(Number),
      averageLegalDecksPerUser: expect.any(Number)
    }));
    expect(res.body.data.collectionStatistics).toEqual(expect.objectContaining({
      usersWithNonZeroCollections: expect.any(Number),
      adoptionPercentage: expect.any(Number),
      averageCardsPerUser: expect.any(Number),
      averageCardsPerCollector: expect.any(Number)
    }));
  });

  describe('POST /api/v1/admin/users', () => {
    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .send({ username: 'x', password: 'y' });
      expect([401, 403]).toContain(res.status);
    });

    it('blocks non-admin users', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Cookie', userCookie)
        .send({ username: 'x', password: 'y' });
      expect(res.status).toBe(403);
      expect(res.body.errors?.[0]?.code).toBe('ADMIN_REQUIRED');
    });
  });
});
