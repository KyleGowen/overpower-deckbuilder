/**
 * JWT signing configuration for /api/v1. Secrets must never be committed.
 */
export interface JwtConfig {
  secret: string;
  /** jsonwebtoken `expiresIn` string, e.g. `15m`, `2h` */
  expiresIn: string;
  /**
   * Refresh token TTL in seconds (Phase 2 §6.1.2, default 30 days).
   * Optional so callers that only use the access-token side of the service
   * (e.g. `V1JwtTokenService` tests) do not need to specify it.
   */
  refreshTtlSeconds?: number;
}

const DEV_FALLBACK_SECRET = 'dev-only-jwt-secret-do-not-use-in-production';
const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Resolve JWT config. In production, JWT_SECRET is required.
 * `JWT_ACCESS_TTL` controls access TTL (default 15m). `JWT_REFRESH_TTL_SECONDS` controls refresh TTL.
 * Legacy `JWT_EXPIRES_IN` is still read as a fallback for `JWT_ACCESS_TTL`.
 */
export function resolveJwtConfig(): JwtConfig {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = (process.env.JWT_SECRET ?? '').trim();
  if (isProd && !secret) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  }
  const accessTtl =
    (process.env.JWT_ACCESS_TTL ?? process.env.JWT_EXPIRES_IN ?? DEFAULT_ACCESS_TTL).trim() ||
    DEFAULT_ACCESS_TTL;
  const refreshRaw = (process.env.JWT_REFRESH_TTL_SECONDS ?? '').trim();
  const refreshTtlSeconds =
    refreshRaw && /^\d+$/.test(refreshRaw) ? parseInt(refreshRaw, 10) : DEFAULT_REFRESH_TTL_SECONDS;
  return {
    secret: secret || DEV_FALLBACK_SECRET,
    expiresIn: accessTtl,
    refreshTtlSeconds
  };
}

/**
 * Convert common `expiresIn` forms to seconds for API responses (approximate for composite forms).
 */
export function expiresInToSeconds(expiresIn: string): number {
  const s = expiresIn.trim();
  const num = parseInt(s, 10);
  if (/^\d+$/.test(s)) return num;
  const m = s.match(/^(\d+)([smhd])$/i);
  if (!m) return 7200;
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u === 's') return n;
  if (u === 'm') return n * 60;
  if (u === 'h') return n * 3600;
  if (u === 'd') return n * 86400;
  return 7200;
}
