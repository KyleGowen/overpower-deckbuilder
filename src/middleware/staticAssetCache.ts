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

export function redirectStaticImagesToCdn(req: Request, res: Response, next: NextFunction): void {
  const redirectUrl = buildStaticImageCdnRedirectUrl(req.originalUrl);
  if (!redirectUrl) {
    next();
    return;
  }
  res.redirect(302, redirectUrl);
}
