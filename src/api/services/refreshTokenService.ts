import { Pool } from 'pg';
import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

/**
 * Phase 2 §6.1.1 — Refresh token lifecycle.
 *
 * A refresh token is a signed JWT whose `jti` claim points at a row in
 * `refresh_tokens`. The row's `revoked_at` and `rotated_from_jti` columns
 * implement the rotation + reuse-detection contract documented in
 * `docs/current/API_V1_AUTH_REFRESH.md`.
 *
 * Why a JWT and not an opaque string: callers only ever read/write the JWT,
 * so the JTI lookup is stateless in the app but stateful in Postgres. We sign
 * with the same secret as the access JWT but a distinct issuer.
 */
export interface RefreshTokenRow {
  id: string;
  jti: string;
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  rotatedFromJti: string | null;
}

export interface RefreshTokenServiceConfig {
  secret: string;
  ttlSeconds: number;
}

export interface IssueResult {
  refreshToken: string;
  jti: string;
  expiresAt: Date;
}

export interface VerifyResult {
  row: RefreshTokenRow;
  userId: string;
}

const ISSUER = 'excelsior-api-v1-refresh';

export class RefreshTokenService {
  constructor(private readonly pool: Pool, private readonly config: RefreshTokenServiceConfig) {}

  /** Issue a new refresh token and persist the row. Optional `rotatedFromJti` chains the rotation family. */
  async issue(userId: string, rotatedFromJti: string | null = null): Promise<IssueResult> {
    const jti = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.ttlSeconds * 1000);

    await this.pool.query(
      `INSERT INTO refresh_tokens (jti, user_id, expires_at, rotated_from_jti)
       VALUES ($1, $2, $3, $4)`,
      [jti, userId, expiresAt, rotatedFromJti]
    );

    const token = jwt.sign(
      { sub: userId, jti },
      this.config.secret as Secret,
      {
        issuer: ISSUER,
        expiresIn: this.config.ttlSeconds
      } as SignOptions
    );

    return { refreshToken: token, jti, expiresAt };
  }

  /**
   * Verify a refresh token and its backing row. If the JTI belongs to a
   * previously-rotated row (reuse), the whole family is revoked and an error
   * is thrown with code `REFRESH_REUSED`.
   */
  async verify(token: string): Promise<VerifyResult> {
    const decoded = jwt.verify(token, this.config.secret as Secret, { issuer: ISSUER });
    if (typeof decoded !== 'object' || decoded === null) {
      const err = new Error('Invalid refresh token');
      (err as Error & { code?: string }).code = 'REFRESH_INVALID';
      throw err;
    }
    const payload = decoded as { sub?: string; jti?: string };
    if (!payload.sub || !payload.jti) {
      const err = new Error('Invalid refresh token');
      (err as Error & { code?: string }).code = 'REFRESH_INVALID';
      throw err;
    }

    const row = await this.findByJti(payload.jti);
    if (!row) {
      const err = new Error('Refresh token unknown');
      (err as Error & { code?: string }).code = 'REFRESH_UNKNOWN';
      throw err;
    }

    if (row.revokedAt !== null) {
      // Reuse: revoke the whole chain to fail-shut.
      await this.revokeFamily(row.jti);
      const err = new Error('Refresh token reused; family revoked');
      (err as Error & { code?: string }).code = 'REFRESH_REUSED';
      throw err;
    }

    if (row.expiresAt.getTime() <= Date.now()) {
      const err = new Error('Refresh token expired');
      (err as Error & { code?: string }).code = 'REFRESH_EXPIRED';
      throw err;
    }

    return { row, userId: row.userId };
  }

  /** Rotate: revoke the old row and issue a new one chained via `rotated_from_jti`. */
  async rotate(oldJti: string, userId: string): Promise<IssueResult> {
    await this.revokeByJti(oldJti);
    return this.issue(userId, oldJti);
  }

  async revokeByJti(jti: string): Promise<void> {
    await this.pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1 AND revoked_at IS NULL`,
      [jti]
    );
  }

  /**
   * Revoke every row in the rotation family that contains `jti` — walking both
   * directions (ancestors via `rotated_from_jti`, descendants via the inverse).
   * Recursive CTE keeps it to a single query.
   */
  async revokeFamily(jti: string): Promise<void> {
    await this.pool.query(
      `WITH RECURSIVE ancestors AS (
         SELECT jti, rotated_from_jti FROM refresh_tokens WHERE jti = $1
         UNION
         SELECT rt.jti, rt.rotated_from_jti
         FROM refresh_tokens rt
         INNER JOIN ancestors a ON rt.jti = a.rotated_from_jti
       ),
       descendants AS (
         SELECT jti, rotated_from_jti FROM refresh_tokens WHERE jti = $1
         UNION
         SELECT rt.jti, rt.rotated_from_jti
         FROM refresh_tokens rt
         INNER JOIN descendants d ON rt.rotated_from_jti = d.jti
       )
       UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE revoked_at IS NULL
         AND jti IN (
           SELECT jti FROM ancestors
           UNION
           SELECT jti FROM descendants
         )`,
      [jti]
    );
  }

  async findByJti(jti: string): Promise<RefreshTokenRow | null> {
    const result = await this.pool.query<{
      id: string;
      jti: string;
      user_id: string;
      expires_at: Date;
      revoked_at: Date | null;
      created_at: Date;
      rotated_from_jti: string | null;
    }>(
      `SELECT id, jti, user_id, expires_at, revoked_at, created_at, rotated_from_jti
       FROM refresh_tokens
       WHERE jti = $1`,
      [jti]
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      id: r.id,
      jti: r.jti,
      userId: r.user_id,
      expiresAt: r.expires_at,
      revokedAt: r.revoked_at,
      createdAt: r.created_at,
      rotatedFromJti: r.rotated_from_jti
    };
  }
}
