import type { Response } from 'express';

/**
 * Per-viewer API responses must not be cached at CloudFront without revalidation.
 * The default CloudFront behavior uses a 1-day TTL when the origin omits
 * Cache-Control; favorites/community reads include viewer-specific `isFavorited`.
 *
 * Matches `GET /api/v1/decks` in decks.http.ts (see CLOUDFRONT_CDN.md).
 */
export function setPrivateUserCacheHeaders(res: Response): void {
  res.set('Cache-Control', 'private, max-age=0, must-revalidate');
  res.set('Vary', 'Cookie');
}
