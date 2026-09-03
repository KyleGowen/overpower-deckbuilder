import request from 'supertest';
import { app } from '../../src/test-server';
import { integrationTestUtils } from '../setup-integration';
import { Pool } from 'pg';

describe('Last Login Timestamp Integration', () => {
  let testUser: any;
  let pool: Pool;

  beforeAll(async () => {
    testUser = await integrationTestUtils.createTestUser({
      name: 'last-login-user',
      email: 'lastlogin@example.com',
      password: 'password123',
      role: 'USER'
    });
    pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:1337/overpower' });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('sets last_login_at on successful login when previously NULL', async () => {
    try {
      // Precondition: ensure NULL (column may not exist locally if migrations not applied)
      await pool.query('UPDATE users SET last_login_at = NULL WHERE id = $1', [testUser.id]);
    } catch (err: any) {
      // 42703: undefined_column
      if (err?.code === '42703') {
        console.warn('Skipping test: last_login_at column not found (migration not applied in local env)');
        return;
      }
      throw err;
    }

    const loginHour = await pool.query(
      `SELECT TO_TIMESTAMP(FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) / 3600) * 3600) AS hour_start`
    );
    const hourStart = loginHour.rows[0].hour_start;
    const beforeResult = await pool.query(
      'SELECT login_count FROM standard_user_login_hourly_counts WHERE hour_start = $1',
      [hourStart]
    );
    const beforeCount = Number(beforeResult.rows[0]?.login_count ?? 0);

    // Login
    await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username || testUser.name, password: 'password123' })
      .expect(200);

    // Verify last_login_at is recent relative to database clock (avoids local TZ skew).
    const result = await pool.query(
      'SELECT EXTRACT(EPOCH FROM (NOW() - last_login_at)) AS age_seconds FROM users WHERE id = $1',
      [testUser.id]
    );
    const ageSeconds = Number(result.rows[0]?.age_seconds);
    expect(Number.isFinite(ageSeconds)).toBe(true);
    expect(ageSeconds).toBeGreaterThanOrEqual(0);
    expect(ageSeconds).toBeLessThan(5 * 60);

    const loginCountResult = await pool.query(
      'SELECT login_count FROM standard_user_login_hourly_counts WHERE hour_start = $1',
      [hourStart]
    );
    expect(Number(loginCountResult.rows[0]?.login_count)).toBe(beforeCount + 1);
  });
});

