import type { Request, Response } from 'express';
import type { DeckData } from '../types';

// ----- Read-only mode -----

export function isReadOnlyMode(req: Request): boolean {
  const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
  const readonlyParam = urlParams.get('readonly');
  const queryReadonly = req.query.readonly;
  const headerReadonly = req.headers['x-readonly-mode'];
  return readonlyParam === 'true' || queryReadonly === 'true' || headerReadonly === 'true';
}

export function blockInReadOnlyMode(req: Request, res: Response, operation: string, options?: { v1?: boolean }): boolean {
  if (isReadOnlyMode(req)) {
    console.log(`🔒 SECURITY: Blocking ${operation} - read-only mode detected`);
    if (options?.v1) {
      res.status(403).type('application/json').json({
        data: null,
        meta: {},
        errors: [{ code: 'READ_ONLY_MODE', message: 'Operation not allowed in read-only mode' }]
      });
    } else {
      res.status(403).json({ success: false, error: `Operation not allowed in read-only mode` });
    }
    return true;
  }
  return false;
}

// ----- Rate limit -----

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 100;

export function checkRateLimit(req: Request, res: Response, operation: string, options?: { v1?: boolean }): boolean {
  const clientIP = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const key = `${clientIP}:${operation}`;
  const current = rateLimitMap.get(key);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    console.log(`🔒 SECURITY: Rate limit exceeded for ${operation} from IP ${clientIP}`);
    const msg = `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute allowed.`;
    if (options?.v1) {
      res.status(429).type('application/json').json({
        data: null,
        meta: {},
        errors: [{ code: 'RATE_LIMIT_EXCEEDED', message: msg }]
      });
    } else {
      res.status(429).json({ success: false, error: msg });
    }
    return true;
  }
  current.count++;
  return false;
}

const rateLimitCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

if (process.env.NODE_ENV === 'test' && typeof (rateLimitCleanupInterval as { unref?: () => void }).unref === 'function') {
  (rateLimitCleanupInterval as { unref: () => void }).unref();
}

// ----- Guest session -----

export function requireGuestSession(req: Request, res: Response): string | null {
  if (req.user?.role !== 'GUEST') {
    console.log(`🔒 SECURITY: Guest deck endpoint rejected - role is ${req.user?.role ?? 'unauthenticated'}`);
    res.status(403).json({ success: false, error: 'Guest deck endpoints are only available to GUEST users' });
    return null;
  }
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    console.log('🔒 SECURITY: Guest deck request blocked - missing session cookie');
    res.status(401).json({ success: false, error: 'Session required for guest decks' });
    return null;
  }
  return sessionId;
}

export function transformGuestDeckToListItem(deckData: DeckData) {
  return {
    metadata: {
      id: deckData.metadata.id,
      name: deckData.metadata.name,
      description: deckData.metadata.description,
      created: deckData.metadata.created,
      lastModified: deckData.metadata.lastModified,
      cardCount: deckData.metadata.cardCount ?? deckData.cards?.length ?? 0,
      threat: 0,
      is_valid: false,
      userId: deckData.metadata.userId,
      uiPreferences: deckData.metadata.uiPreferences,
      is_limited: false,
      background_image_path: null
    },
    cards: deckData.cards || []
  };
}

// ----- Collection card types (shared with v1 collections HTTP) -----

export { isValidCollectionCardType } from '../validation/collectionCardType';
