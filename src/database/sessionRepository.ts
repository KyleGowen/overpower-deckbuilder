import { Pool } from 'pg';

/** Server-side session TTL (must match cookie maxAge in AuthenticationService). */
export const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export interface ISessionRepository {
  insert(userId: string, sessionToken: string, expiresAt: Date): Promise<void>;
  validateAndSlideExpiry(sessionToken: string, newExpiresAt: Date): Promise<string | null>;
  deleteByToken(sessionToken: string): Promise<void>;
}

/**
 * Persists login sessions in `sessions` (see migrations/V2__Create_sessions_table.sql)
 * so any app replica shares the same session store.
 */
export class SessionRepository implements ISessionRepository {
  constructor(private readonly pool: Pool) {}

  async insert(userId: string, sessionToken: string, expiresAt: Date): Promise<void> {
    await this.pool.query(
      `INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)`,
      [userId, sessionToken, expiresAt]
    );
  }

  /**
   * If the session exists and is not expired, extends `expires_at` and returns `user_id`.
   * Otherwise returns null (expired or unknown token).
   */
  async validateAndSlideExpiry(sessionToken: string, newExpiresAt: Date): Promise<string | null> {
    const result = await this.pool.query<{ user_id: string }>(
      `UPDATE sessions
       SET expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE session_token = $1 AND expires_at > NOW()
       RETURNING user_id`,
      [sessionToken, newExpiresAt]
    );
    return result.rows[0]?.user_id ?? null;
  }

  async deleteByToken(sessionToken: string): Promise<void> {
    await this.pool.query(`DELETE FROM sessions WHERE session_token = $1`, [sessionToken]);
  }
}

/**
 * Process-local sessions (used when tests mock `getPool()` as null).
 * Not suitable for multi-instance production.
 */
export class InMemorySessionRepository implements ISessionRepository {
  private readonly rows = new Map<string, { userId: string; expiresAtMs: number }>();

  async insert(userId: string, sessionToken: string, expiresAt: Date): Promise<void> {
    this.rows.set(sessionToken, { userId, expiresAtMs: expiresAt.getTime() });
  }

  async validateAndSlideExpiry(sessionToken: string, newExpiresAt: Date): Promise<string | null> {
    const row = this.rows.get(sessionToken);
    if (!row) {
      return null;
    }
    if (Date.now() > row.expiresAtMs) {
      this.rows.delete(sessionToken);
      return null;
    }
    row.expiresAtMs = newExpiresAt.getTime();
    return row.userId;
  }

  async deleteByToken(sessionToken: string): Promise<void> {
    this.rows.delete(sessionToken);
  }
}

/** Prefer Postgres; fall back to in-memory when no pool (unit tests with mocked DataSource). */
export function createSessionRepositoryFromDataSource(dataSource: { getPool: () => Pool | null }): ISessionRepository {
  let pool: Pool | null = null;
  try {
    pool = dataSource.getPool();
  } catch {
    pool = null;
  }
  if (pool != null) {
    return new SessionRepository(pool);
  }
  return new InMemorySessionRepository();
}
