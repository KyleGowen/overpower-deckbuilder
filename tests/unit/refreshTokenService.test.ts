import type { Pool } from 'pg';
import { RefreshTokenService } from '../../src/api/services/refreshTokenService';

interface Row {
  id: string;
  jti: string;
  user_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
  rotated_from_jti: string | null;
}

/**
 * Minimal Postgres fake that understands the exact query shapes used by
 * RefreshTokenService. Good enough for unit coverage of the rotation/reuse
 * contract without a real database.
 */
function createFakePool(): Pool & { rows: Row[] } {
  const rows: Row[] = [];

  function insert(jti: string, userId: string, expiresAt: Date, rotatedFromJti: string | null): void {
    rows.push({
      id: `id-${jti}`,
      jti,
      user_id: userId,
      expires_at: expiresAt,
      revoked_at: null,
      created_at: new Date(),
      rotated_from_jti: rotatedFromJti
    });
  }

  function findByJti(jti: string): Row | null {
    return rows.find((r) => r.jti === jti) ?? null;
  }

  function revokeByJti(jti: string): void {
    const r = findByJti(jti);
    if (r && !r.revoked_at) r.revoked_at = new Date();
  }

  function revokeFamily(jti: string): void {
    const family = new Set<string>([jti]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const r of rows) {
        if (family.has(r.jti) && r.rotated_from_jti && !family.has(r.rotated_from_jti)) {
          family.add(r.rotated_from_jti);
          grew = true;
        }
        if (r.rotated_from_jti && family.has(r.rotated_from_jti) && !family.has(r.jti)) {
          family.add(r.jti);
          grew = true;
        }
      }
    }
    for (const r of rows) {
      if (family.has(r.jti) && !r.revoked_at) r.revoked_at = new Date();
    }
  }

  const pool = {
    query: async (sql: string, params: unknown[] = []) => {
      if (sql.trim().startsWith('INSERT INTO refresh_tokens')) {
        const [jti, userId, expiresAt, rotatedFromJti] = params as [
          string,
          string,
          Date,
          string | null
        ];
        insert(jti, userId, expiresAt, rotatedFromJti);
        return { rows: [] };
      }
      if (sql.trim().startsWith('SELECT id, jti, user_id, expires_at')) {
        const [jti] = params as [string];
        const r = findByJti(jti);
        return { rows: r ? [r] : [] };
      }
      if (sql.trim().startsWith('UPDATE refresh_tokens SET revoked_at')) {
        const [jti] = params as [string];
        revokeByJti(jti);
        return { rows: [] };
      }
      if (sql.trim().startsWith('WITH RECURSIVE ancestors')) {
        const [jti] = params as [string];
        revokeFamily(jti);
        return { rows: [] };
      }
      throw new Error(`Unhandled SQL in fake pool: ${sql.slice(0, 80)}`);
    }
  } as unknown as Pool & { rows: Row[] };
  (pool as unknown as { rows: Row[] }).rows = rows;
  return pool;
}

describe('RefreshTokenService', () => {
  const config = { secret: 'unit-test-secret', ttlSeconds: 3600 };

  it('issues and verifies a refresh token', async () => {
    const pool = createFakePool();
    const svc = new RefreshTokenService(pool, config);

    const issued = await svc.issue('user-1');
    expect(issued.refreshToken.length).toBeGreaterThan(0);
    expect(issued.jti).toMatch(/^[0-9a-f-]{36}$/);

    const verified = await svc.verify(issued.refreshToken);
    expect(verified.userId).toBe('user-1');
    expect(verified.row.jti).toBe(issued.jti);
  });

  it('rotate revokes the old row and issues a new chained row', async () => {
    const pool = createFakePool();
    const svc = new RefreshTokenService(pool, config);
    const issued = await svc.issue('user-2');

    const rotated = await svc.rotate(issued.jti, 'user-2');
    expect(rotated.jti).not.toBe(issued.jti);

    const oldRow = pool.rows.find((r) => r.jti === issued.jti)!;
    expect(oldRow.revoked_at).not.toBeNull();

    const newRow = pool.rows.find((r) => r.jti === rotated.jti)!;
    expect(newRow.rotated_from_jti).toBe(issued.jti);
    expect(newRow.revoked_at).toBeNull();
  });

  it('reusing a rotated (revoked) refresh token revokes the whole family', async () => {
    const pool = createFakePool();
    const svc = new RefreshTokenService(pool, config);
    const first = await svc.issue('user-3');
    const second = await svc.rotate(first.jti, 'user-3');

    await expect(svc.verify(first.refreshToken)).rejects.toMatchObject({ code: 'REFRESH_REUSED' });

    const secondRow = pool.rows.find((r) => r.jti === second.jti)!;
    expect(secondRow.revoked_at).not.toBeNull();
  });

  it('rejects a token whose row is unknown', async () => {
    const pool = createFakePool();
    const svc = new RefreshTokenService(pool, config);
    const issued = await svc.issue('user-4');
    // Drop the row so verify sees no match.
    pool.rows.length = 0;

    await expect(svc.verify(issued.refreshToken)).rejects.toMatchObject({ code: 'REFRESH_UNKNOWN' });
  });

  it('rejects an expired token', async () => {
    const pool = createFakePool();
    const svc = new RefreshTokenService(pool, { secret: 'unit-test-secret', ttlSeconds: 1 });
    const issued = await svc.issue('user-5');
    // Manually expire the row (token itself still has a 1s TTL; backdate the row).
    const row = pool.rows.find((r) => r.jti === issued.jti)!;
    row.expires_at = new Date(Date.now() - 1000);

    await expect(svc.verify(issued.refreshToken)).rejects.toMatchObject({ code: 'REFRESH_EXPIRED' });
  });
});
