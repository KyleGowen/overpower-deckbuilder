/**
 * Preload full-res art and reveal on an in-DOM layer after decode (no flash).
 * Session registry tracks revealed URLs within a route scope (metadata only).
 * See docs/current/PROGRESSIVE_IMAGE_LOADING.md.
 */

export type ProgressiveImageSessionScope = 'database' | 'deck-editor';

export const PROGRESSIVE_SESSION_MAX_ENTRIES = 400;
const IDLE_TTL_MS = 30 * 60 * 1000;

export interface ProgressiveLoadHandle {
  cancel: () => void;
}

export interface ProgressiveImageTarget {
  src: string;
  decode: () => Promise<void>;
}

interface SessionState {
  revealed: Map<string, number>;
  accessOrder: string[];
  inFlight: Map<string, Promise<void>>;
}

const sessions = new Map<ProgressiveImageSessionScope, SessionState>();

function getSession(scope: ProgressiveImageSessionScope): SessionState {
  let session = sessions.get(scope);
  if (!session) {
    session = { revealed: new Map(), accessOrder: [], inFlight: new Map() };
    sessions.set(scope, session);
  }
  return session;
}

function touchLru(session: SessionState, url: string): void {
  const idx = session.accessOrder.indexOf(url);
  if (idx >= 0) session.accessOrder.splice(idx, 1);
  session.accessOrder.push(url);
}

function evictOldest(session: SessionState): void {
  while (session.accessOrder.length > PROGRESSIVE_SESSION_MAX_ENTRIES) {
    const oldest = session.accessOrder.shift();
    if (oldest) session.revealed.delete(oldest);
  }
}

/** True when the user prefers thumbnails only (mobile data saver / reduced-data). */
export function shouldSkipFullResUpgrade(): boolean {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return true;
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return true;
  }
  return false;
}

export function isFullResRevealed(
  url: string,
  scope: ProgressiveImageSessionScope = 'database',
): boolean {
  if (!url) return false;
  const session = getSession(scope);
  const revealedAt = session.revealed.get(url);
  if (revealedAt === undefined) return false;

  if (Date.now() - revealedAt > IDLE_TTL_MS) {
    session.revealed.delete(url);
    session.accessOrder = session.accessOrder.filter((entry) => entry !== url);
    return false;
  }

  touchLru(session, url);
  return true;
}

export function markFullResRevealed(
  url: string,
  scope: ProgressiveImageSessionScope = 'database',
): void {
  if (!url) return;
  const session = getSession(scope);
  if (!session.revealed.has(url)) {
    session.accessOrder.push(url);
  }
  session.revealed.set(url, Date.now());
  touchLru(session, url);
  evictOldest(session);
}

export function clearProgressiveImageSession(scope: ProgressiveImageSessionScope): void {
  sessions.delete(scope);
}

/** @internal Test helper — count revealed URLs in a session. */
export function revealedUrlCountForTests(scope: ProgressiveImageSessionScope = 'database'): number {
  return getSession(scope).revealed.size;
}

function revealOnTarget(
  fullUrl: string,
  targetImg: ProgressiveImageTarget,
  onRevealed: () => void,
  scope: ProgressiveImageSessionScope,
): void {
  targetImg.src = fullUrl;
  targetImg
    .decode()
    .then(() => {
      markFullResRevealed(fullUrl, scope);
      onRevealed();
    })
    .catch(() => {
      markFullResRevealed(fullUrl, scope);
      onRevealed();
    });
}

function runNetworkPreload(fullUrl: string, scope: ProgressiveImageSessionScope): Promise<void> {
  const session = getSession(scope);
  const existing = session.inFlight.get(fullUrl);
  if (existing) return existing;

  const pending = new Promise<void>((resolve) => {
    const preload = new Image();
    preload.onload = () => resolve();
    preload.onerror = () => resolve();
    preload.src = fullUrl;
  }).finally(() => {
    session.inFlight.delete(fullUrl);
  });

  session.inFlight.set(fullUrl, pending);
  return pending;
}

export function preloadAndRevealFullRes(
  fullUrl: string,
  targetImg: ProgressiveImageTarget,
  onRevealed: () => void,
  options?: { scope?: ProgressiveImageSessionScope },
): ProgressiveLoadHandle {
  const scope = options?.scope ?? 'database';
  let cancelled = false;

  if (isFullResRevealed(fullUrl, scope)) {
    revealOnTarget(fullUrl, targetImg, onRevealed, scope);
    return { cancel: () => {} };
  }

  runNetworkPreload(fullUrl, scope).then(() => {
    if (cancelled) return;
    revealOnTarget(fullUrl, targetImg, onRevealed, scope);
  });

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}
