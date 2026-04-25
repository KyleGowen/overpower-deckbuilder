import crypto from 'crypto';
import type { Request, Response } from 'express';
import type { V1Envelope } from './v1Envelope';

/**
 * Phase 3 §7.1.1-§7.1.3 — catalog cache helpers.
 *
 * Catalog endpoints are globally cacheable (no per-user data), so we emit
 *   - `Cache-Control: public, max-age=300, stale-while-revalidate=3600`
 *   - a strong `ETag` derived from the response payload + `catalog_data_version`
 * and honor `If-None-Match` with a `304 Not Modified`.
 *
 * `catalog_data_version` is a process-local integer that bumps whenever the
 * catalog is re-ingested. A future migration can persist it; today the bumper
 * is exposed so the ingestion script (and tests) can bump it explicitly.
 *
 * Kill switches:
 *   - `DISABLE_CATALOG_CACHE_HEADERS=1` → `Cache-Control: no-store`, no ETag
 *     comparison, no 304s.
 *   - `DISABLE_SINCE_SYNC=1` → `?since_version=` / `?since=` query params
 *     ignored.
 */
const DEFAULT_MAX_AGE = 300;
const DEFAULT_SWR = 3600;

let currentVersion = 1;
let lastUpdated = new Date();

/** Read the current catalog data version (monotonically increasing). */
export function getCatalogDataVersion(): number {
  return currentVersion;
}

/** Read the timestamp of the last version bump. */
export function getCatalogLastUpdated(): Date {
  return lastUpdated;
}

/** Bump the catalog data version. Intended to be called by the ingestion path. */
export function bumpCatalogDataVersion(): number {
  currentVersion += 1;
  lastUpdated = new Date();
  return currentVersion;
}

/** Test-only hook. */
export function resetCatalogDataVersionForTests(): void {
  if (process.env.NODE_ENV !== 'test') return;
  currentVersion = 1;
  lastUpdated = new Date(0);
}

export interface SendCachedCatalogOptions {
  /** Override the default 300-second max-age. */
  maxAge?: number;
  /** Override the default 3600-second stale-while-revalidate window. */
  staleWhileRevalidate?: number;
}

/**
 * Serialize a data array (or any JSON-shape) into the v1 envelope, emit cache
 * headers, and honor `If-None-Match`. Returns `true` when a 304 was sent so
 * the caller can early-return.
 */
export function sendCachedCatalogResponse<T>(
  req: Request,
  res: Response,
  data: T,
  options: SendCachedCatalogOptions = {}
): boolean {
  const envelope: V1Envelope<T> = {
    data,
    meta: { ...(withCatalogVersionMeta()) },
    errors: [],
    success: true
  };
  const body = JSON.stringify(envelope);
  const etag = `"${currentVersion}-${crypto.createHash('sha1').update(body).digest('hex')}"`;

  if (process.env.DISABLE_CATALOG_CACHE_HEADERS === '1') {
    res.set('Cache-Control', 'no-store');
    res.status(200).type('application/json').send(body);
    return false;
  }

  const maxAge = options.maxAge ?? DEFAULT_MAX_AGE;
  const swr = options.staleWhileRevalidate ?? DEFAULT_SWR;

  res.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${swr}`);
  res.set('ETag', etag);
  res.set('Vary', 'Accept-Encoding');

  const ifNoneMatch = req.headers['if-none-match'];
  if (typeof ifNoneMatch === 'string' && ifNoneMatch === etag) {
    res.status(304).end();
    return true;
  }

  res.status(200).type('application/json').send(body);
  return false;
}

function withCatalogVersionMeta(): { catalogDataVersion: number; catalogLastUpdated: string } {
  return {
    catalogDataVersion: currentVersion,
    catalogLastUpdated: lastUpdated.toISOString()
  };
}

/**
 * Parse `?since_version=<n>` query. Returns `null` when the filter is
 * disabled, absent, or invalid. Filtering is currently advisory — catalog
 * rows don't carry a per-row version yet, so callers either return the full
 * payload (with a 304 if the ETag matches) or an empty data array when
 * `sinceVersion >= currentVersion`. The query shape is reserved so a future
 * migration can add per-row versioning without changing the public contract.
 */
export function parseSinceVersionQuery(req: Request): number | null {
  if (process.env.DISABLE_SINCE_SYNC === '1') return null;
  const raw = req.query.since_version;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
