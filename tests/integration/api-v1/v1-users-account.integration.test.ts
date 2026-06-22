import request from 'supertest';
import { app, integrationTestUtils } from '../../setup-integration';

describe('v1 users account integration', () => {
  let user: { id: string; username: string };
  let authCookie: string = '';

  beforeAll(async () => {
    user = await integrationTestUtils.createTestUser({
      name: 'v1_acct_user',
      email: 'v1_acct@example.com',
      password: 'startpass1',
      role: 'USER'
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'startpass1' });
    const setCookie = loginRes.headers['set-cookie'];
    authCookie = Array.isArray(setCookie)
      ? setCookie.find((c: string) => c.startsWith('sessionId=')) ?? ''
      : setCookie;
  });

  afterAll(async () => {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower'
    });
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
    } finally {
      await pool.end();
    }
  });

  it('POST /api/v1/users/change-email rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-email')
      .send({ email: 'x@example.com' });
    expect([401, 403]).toContain(res.status);
  });

  it('POST /api/v1/users/change-email rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-email')
      .set('Cookie', authCookie)
      .send({ email: 'bad' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].code).toBe('EMAIL_INVALID');
  });

  it('POST /api/v1/users/change-email updates email', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-email')
      .set('Cookie', authCookie)
      .send({ email: 'v1_acct_new@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('v1_acct_new@example.com');

    const me = await request(app).get('/api/auth/me').set('Cookie', authCookie);
    expect(me.body.data.email).toBe('v1_acct_new@example.com');
  });

  it('POST /api/v1/users/change-password rejects mismatch', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-password')
      .set('Cookie', authCookie)
      .send({ newPassword: 'one', confirmPassword: 'two' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].code).toBe('PASSWORD_MISMATCH');
  });

  it('POST /api/v1/users/change-password updates password', async () => {
    const res = await request(app)
      .post('/api/v1/users/change-password')
      .set('Cookie', authCookie)
      .send({ newPassword: 'newpass789', confirmPassword: 'newpass789' });
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Password updated');

    await request(app).post('/api/auth/logout').set('Cookie', authCookie);

    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ username: user.username, password: 'newpass789' });
    expect(loginNew.status).toBe(200);
  });
});
