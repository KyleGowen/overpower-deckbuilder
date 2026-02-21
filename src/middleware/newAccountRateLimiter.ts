/**
 * Rate limiter for new Google account creation.
 * Prevents abuse by limiting the number of new accounts created per IP and globally.
 *
 * Limits:
 * - 5 new accounts per IP per minute
 * - 10 new accounts globally per minute
 *
 * IMPORTANT - Trust Proxy:
 * This module uses req.ip to identify the client. For req.ip to correctly reflect
 * the real client IP when the app runs behind a reverse proxy (nginx, load balancer),
 * you MUST configure Express with:
 *   app.set('trust proxy', 1);
 *
 * Without trust proxy, req.ip would return the proxy's IP (e.g. 127.0.0.1) instead
 * of the client's IP, making per-IP rate limiting ineffective.
 *
 * When trust proxy is enabled:
 * - Express reads X-Forwarded-For header (if present) and uses the leftmost IP
 * - req.ip returns the client's actual IP when behind one proxy
 * - See: https://expressjs.com/en/guide/behind-proxies.html
 */

const IP_LIMIT = 5;
const GLOBAL_LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

interface WindowEntry {
  count: number;
  resetAt: number;
}

const ipWindows = new Map<string, WindowEntry>();
let globalCount = 0;
let globalResetAt = 0;

/**
 * Check if the given IP is within rate limits for new account creation.
 * @param ip - Client IP (use req.ip; requires trust proxy for correct value behind nginx)
 * @returns false if over limit, true if within limits
 */
export function checkLimit(ip: string): boolean {
  const now = Date.now();

  // Clean up expired IP windows
  for (const [key, entry] of ipWindows.entries()) {
    if (now > entry.resetAt) {
      ipWindows.delete(key);
    }
  }

  // Reset global window if expired
  if (now > globalResetAt) {
    globalCount = 0;
    globalResetAt = now + WINDOW_MS;
  }

  // Check global limit first
  if (globalCount >= GLOBAL_LIMIT) {
    return false;
  }

  // Check IP limit
  const ipEntry = ipWindows.get(ip);
  if (ipEntry) {
    if (now > ipEntry.resetAt) {
      ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else if (ipEntry.count >= IP_LIMIT) {
      return false;
    }
  }

  return true;
}

/**
 * Record that a new account was created. Must be called immediately before
 * createGoogleUser so limits are enforced accurately.
 * @param ip - Client IP (use req.ip)
 */
export function recordCreation(ip: string): void {
  const now = Date.now();

  // Update global count
  if (now > globalResetAt) {
    globalCount = 1;
    globalResetAt = now + WINDOW_MS;
  } else {
    globalCount++;
  }

  // Update IP count
  const ipEntry = ipWindows.get(ip);
  if (ipEntry) {
    if (now > ipEntry.resetAt) {
      ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      ipEntry.count++;
    }
  } else {
    ipWindows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }
}

/**
 * Reset rate limiter state. For testing only.
 * @internal
 */
export function resetForTesting(): void {
  ipWindows.clear();
  globalCount = 0;
  globalResetAt = 0;
}
