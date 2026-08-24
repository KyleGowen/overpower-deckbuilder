import { Pool } from 'pg';
import { User, UserRole } from '../types';
import {
  UserRepository,
  type UserAnalyticsCounts,
  type UserAnalyticsQuery
} from '../repository/UserRepository';
import { PasswordUtils } from '../utils/passwordUtils';

export class PostgreSQLUserRepository implements UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async initialize(): Promise<void> {
    // PostgreSQL UserRepository doesn't need to load data from files
    // Data is already in the database from migrations
    console.log('✅ PostgreSQL UserRepository initialized');
  }

  async createUser(name: string, email: string, password: string, role: UserRole = 'USER'): Promise<User> {
    const client = await this.pool.connect();
    try {
      // Hash the password before storing it
      const passwordHash = await PasswordUtils.hashPassword(password);
      
      const result = await client.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, passwordHash, role]
      );
      
      const user = result.rows[0];
      return this.mapRowToUser(user);
    } finally {
      client.release();
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const user = result.rows[0];
      return this.mapRowToUser(user);
    } finally {
      client.release();
    }
  }

  async getUserAuthMeta(id: string): Promise<{ auth_provider: string | null } | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT auth_provider FROM users WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return undefined;
      }
      const row = result.rows[0];
      return { auth_provider: (row.auth_provider as string | null) ?? null };
    } finally {
      client.release();
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const user = result.rows[0];
      return this.mapRowToUser(user);
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async createGoogleUser(email: string, name: string, firebaseUid: string): Promise<User> {
    const client = await this.pool.connect();
    try {
      let username = name || email.split('@')[0] || 'Google User';
      username = username.trim() || 'Google User';

      let finalUsername = username;
      let suffix = 2;
      for (;;) {
        const existing = await client.query(
          'SELECT id FROM users WHERE username = $1',
          [finalUsername]
        );
        if (existing.rows.length === 0) break;
        finalUsername = `${username}${suffix}`;
        suffix++;
      }

      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, role, auth_provider, firebase_uid)
         VALUES ($1, $2, NULL, 'USER', 'google', $3)
         RETURNING *`,
        [finalUsername, email, firebaseUid]
      );

      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async linkGoogleToUser(userId: string, firebaseUid: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE users SET firebase_uid = $1, auth_provider = $2, updated_at = NOW() WHERE id = $3',
        [firebaseUid, 'google', userId]
      );
    } finally {
      client.release();
    }
  }

  private normalizeAuthProvider(value: unknown): string {
    return typeof value === 'string' && value.length > 0 ? value : 'password';
  }

  private mapRowToUser(user: Record<string, unknown>): User {
    return {
      id: user.id as string,
      name: user.username as string,
      email: user.email as string,
      role: user.role as UserRole,
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at as string) : null,
      authProvider: this.normalizeAuthProvider(user.auth_provider),
      displayName: (user.display_name as string | null) ?? null
    };
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      // First, get the user by username to retrieve the stored hash
      const result = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const user = result.rows[0];

      // Google/OAuth users have no password_hash
      if (!user.password_hash) return undefined;
      
      // Compare the provided password with the stored hash using bcrypt
      const isPasswordValid = await PasswordUtils.comparePassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        return undefined;
      }
      
      return this.mapRowToUser(user);
    } finally {
      client.release();
    }
  }

  async getAllUsers(): Promise<User[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at');
      
      return result.rows.map((user) => this.mapRowToUser(user));
    } finally {
      client.release();
    }
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = ANY($1::uuid[])', [ids]);
      return result.rows.map((user) => this.mapRowToUser(user));
    } finally {
      client.release();
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const client = await this.pool.connect();
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        setClause.push(`username = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.email !== undefined) {
        setClause.push(`email = $${paramCount++}`);
        values.push(updates.email);
      }
      if (updates.role !== undefined) {
        setClause.push(`role = $${paramCount++}`);
        values.push(updates.role);
      }
      if (updates.displayName !== undefined) {
        setClause.push(`display_name = $${paramCount++}`);
        values.push(updates.displayName);
      }

      if (setClause.length === 0) {
        return this.getUserById(id);
      }

      setClause.push(`updated_at = NOW()`);
      values.push(id);

      // setClause is built from a fixed whitelist of column assignments; values remain parameterized.
      const result = await client.query( // nosemgrep: pg-sql-template-interpolation
        `UPDATE users SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.mapRowToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async updateUserPassword(id: string, newPlainPassword: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const passwordHash = await PasswordUtils.hashPassword(newPlainPassword);
      const result = await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, id]
      );
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async updateLastLoginAt(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }

  async getUserStats(): Promise<{ users: number }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT COUNT(*) as count FROM users');
      return {
        users: parseInt(result.rows[0].count)
      };
    } finally {
      client.release();
    }
  }

  async getUserAnalytics(query: UserAnalyticsQuery): Promise<UserAnalyticsCounts> {
    const client = await this.pool.connect();
    const excludedUsernames = [...query.excludedUsernames];
    try {
      const [summaryResult, monthlyResult, recencyResult] = await Promise.all([
        client.query(
          `SELECT
             COUNT(*)::int AS standard_user_accounts,
             COUNT(*) FILTER (WHERE created_at >= $2::timestamp AND created_at < $1::timestamp)::int AS new_standard_accounts,
             COUNT(*) FILTER (WHERE last_login_at >= $1::timestamp - INTERVAL '30 days' AND last_login_at <= $1::timestamp)::int AS logged_in_last_30_days,
             COUNT(*) FILTER (WHERE LOWER(COALESCE(auth_provider, 'password')) = 'google')::int AS google_auth_users,
             COUNT(*) FILTER (WHERE last_login_at IS NOT NULL)::int AS recorded_login_users
           FROM users
           WHERE role = 'USER'
             AND NOT (LOWER(username) = ANY($3::text[]))`,
          [query.asOf, query.acquisitionStart, excludedUsernames]
        ),
        client.query(
          `WITH months AS (
             SELECT generate_series($2::timestamptz, $3::timestamptz - INTERVAL '1 month', INTERVAL '1 month') AS month_start
           ), eligible_users AS (
             SELECT created_at
             FROM users
             WHERE role = 'USER'
               AND NOT (LOWER(username) = ANY($4::text[]))
               AND created_at >= $2
               AND created_at < $3
               AND created_at <= $1::timestamp
           )
           SELECT TO_CHAR(months.month_start AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
                  COUNT(eligible_users.created_at)::int AS count
           FROM months
           LEFT JOIN eligible_users
             ON eligible_users.created_at >= months.month_start
            AND eligible_users.created_at < months.month_start + INTERVAL '1 month'
           GROUP BY months.month_start
           ORDER BY months.month_start`,
          [query.asOf, query.signupChartStart, query.signupChartEnd, excludedUsernames]
        ),
        client.query(
          `SELECT
             COUNT(*) FILTER (WHERE last_login_at >= $1::timestamp - INTERVAL '7 days' AND last_login_at <= $1::timestamp)::int AS days_0_to_7,
             COUNT(*) FILTER (WHERE last_login_at < $1::timestamp - INTERVAL '7 days' AND last_login_at >= $1::timestamp - INTERVAL '30 days')::int AS days_8_to_30,
             COUNT(*) FILTER (WHERE last_login_at < $1::timestamp - INTERVAL '30 days' AND last_login_at >= $1::timestamp - INTERVAL '60 days')::int AS days_31_to_60,
             COUNT(*) FILTER (WHERE last_login_at < $1::timestamp - INTERVAL '60 days' AND last_login_at >= $1::timestamp - INTERVAL '90 days')::int AS days_61_to_90,
             COUNT(*) FILTER (WHERE last_login_at < $1::timestamp - INTERVAL '90 days')::int AS days_90_plus
           FROM users
           WHERE role = 'USER'
             AND NOT (LOWER(username) = ANY($2::text[]))`,
          [query.asOf, excludedUsernames]
        )
      ]);

      const summary = summaryResult.rows[0] as Record<string, number>;
      const recency = recencyResult.rows[0] as Record<string, number>;
      return {
        standardUserAccounts: summary.standard_user_accounts ?? 0,
        newStandardAccounts: summary.new_standard_accounts ?? 0,
        loggedInLast30Days: summary.logged_in_last_30_days ?? 0,
        googleAuthUsers: summary.google_auth_users ?? 0,
        recordedLoginUsers: summary.recorded_login_users ?? 0,
        signupMonths: monthlyResult.rows.map((row: { month: string; count: number }) => ({
          month: row.month,
          count: row.count
        })),
        loginRecency: {
          days0To7: recency.days_0_to_7 ?? 0,
          days8To30: recency.days_8_to_30 ?? 0,
          days31To60: recency.days_31_to_60 ?? 0,
          days61To90: recency.days_61_to_90 ?? 0,
          days90Plus: recency.days_90_plus ?? 0
        }
      };
    } finally {
      client.release();
    }
  }
}
