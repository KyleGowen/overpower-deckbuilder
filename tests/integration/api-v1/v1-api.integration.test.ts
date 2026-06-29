/**
 * Integration tests for /api/v1 (auth + dbv-catalog routers).
 */
import request from 'supertest';
import { app } from '../../../src/test-server';
import { DataSourceConfig } from '../../../src/config/DataSourceConfig';
import { integrationTestUtils } from '../../setup-integration';

describe('API v1 integration', () => {
  let username: string;
  let password: string;

  beforeAll(async () => {
    await integrationTestUtils.ensureGuestUser();
    const ts = Date.now();
    username = `v1-api-${ts}`;
    password = 'v1IntegrationPass123';
    const userRepository = DataSourceConfig.getInstance().getUserRepository();
    const user = await userRepository.createUser(username, `${username}@example.com`, password, 'USER');
    integrationTestUtils.trackTestUser(user.id);
  });

  describe('dbv-catalog.http', () => {
    it('GET /api/v1/catalog/characters returns 200 without session (optional auth)', async () => {
      const res = await request(app).get('/api/v1/catalog/characters').expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/catalog/characters returns v1 envelope and character rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/characters').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/locations returns v1 envelope and location rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/locations').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/special-cards returns v1 envelope and special card rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/special-cards').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/missions returns v1 envelope and mission rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/missions').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/events returns v1 envelope and event rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/events').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/aspects returns v1 envelope and aspect rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/aspects').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/advanced-universe returns v1 envelope and advanced universe rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/advanced-universe').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/teamwork returns v1 envelope and teamwork rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/teamwork').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/ally-universe returns v1 envelope and ally universe rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/ally-universe').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/training returns v1 envelope and training rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/training').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/basic-universe returns v1 envelope and basic universe rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/basic-universe').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/catalog/power-cards returns v1 envelope and power card rows', async () => {
      const login = await request(app).post('/api/auth/login').send({ username, password }).expect(200);
      const cookie = login.headers['set-cookie']![0].split(';')[0];
      const res = await request(app).get('/api/v1/catalog/power-cards').set('Cookie', cookie).expect(200);
      expect(res.body.errors).toEqual([]);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('auth.http', () => {
    it('login with JWT and GET /api/v1/auth/me returns user profile', async () => {
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username, password })
        .expect(200);
      expect(login.body.data.accessToken).toBeDefined();
      const token = login.body.data.accessToken as string;

      const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      expect(me.body.data.username).toBe(username);
      expect(me.body.data.role).toBe('USER');
    });

    it('POST /api/v1/auth/logout returns v1 envelope with Bearer token', async () => {
      const login = await request(app)
        .post('/api/v1/auth/login')
        .send({ username, password })
        .expect(200);
      const token = login.body.data.accessToken as string;

      const out = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(out.body.errors).toEqual([]);
      expect(out.body.data).toEqual({ loggedOut: true });
    });

    it('POST /api/v1/auth/logout without token still returns 200 (idempotent)', async () => {
      const out = await request(app).post('/api/v1/auth/logout').expect(200);
      expect(out.body.errors).toEqual([]);
      expect(out.body.data).toEqual({ loggedOut: true });
    });
  });
});
