/**
 * JWT signing configuration for /api/v1. Secrets must never be committed.
 */
export interface JwtConfig {
  secret: string;
  /** jsonwebtoken `expiresIn` string, e.g. `2h`, `15m` */
  expiresIn: string;
}

const DEV_FALLBACK_SECRET = 'dev-only-jwt-secret-do-not-use-in-production';

/**
 * Resolve JWT config. In production, JWT_SECRET is required.
 */
export function resolveJwtConfig(): JwtConfig {
  const isProd = process.env.NODE_ENV === 'production';
  const secret = (process.env.JWT_SECRET ?? '').trim();
  if (isProd && !secret) {
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  }
  return {
    secret: secret || DEV_FALLBACK_SECRET,
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '2h').trim() || '2h'
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
