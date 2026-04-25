import type { NextFunction, Request, Response } from 'express';
import path from 'path';

export const APP_SHELL_CACHE_CONTROL = 'no-cache, no-store, must-revalidate';
export const SHORT_STATIC_CACHE_CONTROL = 'public, max-age=300';

const PUBLIC_FRAGMENT_DIRS = ['/public/components/', '/public/templates/'];
const SHORT_CACHE_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
]);

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function isHtmlFragment(normalizedPath: string): boolean {
  return PUBLIC_FRAGMENT_DIRS.some((dir) => normalizedPath.includes(dir));
}

export function setNoStoreHeaders(res: Response): void {
  res.setHeader('Cache-Control', APP_SHELL_CACHE_CONTROL);
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

export function setStaticAssetCacheHeaders(res: Response, filePath: string): void {
  const normalizedPath = normalizeFilePath(filePath);
  const ext = path.extname(normalizedPath).toLowerCase();

  if (ext === '.html' && !isHtmlFragment(normalizedPath)) {
    setNoStoreHeaders(res);
    return;
  }

  if (SHORT_CACHE_EXTENSIONS.has(ext) || isHtmlFragment(normalizedPath)) {
    res.setHeader('Cache-Control', SHORT_STATIC_CACHE_CONTROL);
  }
}

export function buildStaticImageCdnRedirectUrl(originalUrl: string, cdnBaseUrl = process.env.CDN_BASE_URL || ''): string | null {
  const cdnBase = cdnBaseUrl.replace(/\/$/, '');
  if (!cdnBase || !originalUrl.startsWith('/src/resources/images/')) {
    return null;
  }
  return cdnBase + originalUrl;
}

/**
 * When CloudFront fetches the Node custom origin, `Host` is the origin FQDN
 * (e.g. origin.excelsior.cards; see `infra/cloudfront.tf`). A 302 to
 * `CDN_BASE_URL` + path points at the same CloudFront URL the viewer is
 * resolving, so the edge re-fetches the origin in a loop (ERR_TOO_MANY_REDIRECTS).
 * Fall through to `express.static` for those requests instead.
 *
 * `STATIC_IMAGE_CDN_REDIRECT=0` — emergency kill switch: never 302, always static.
 */
export function shouldSkipCdnImageRedirect(req: Request): boolean {
  if (process.env.STATIC_IMAGE_CDN_REDIRECT === '0') {
    return true;
  }
  const h = (req.hostname || '').toLowerCase();
  if (h.startsWith('origin.')) {
    return true;
  }
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') {
    return true;
  }
  return false;
}

export function redirectStaticImagesToCdn(req: Request, res: Response, next: NextFunction): void {
  const redirectUrl = buildStaticImageCdnRedirectUrl(req.originalUrl);
  if (!redirectUrl) {
    next();
    return;
  }
  if (shouldSkipCdnImageRedirect(req)) {
    next();
    return;
  }
  res.redirect(302, redirectUrl);
}
