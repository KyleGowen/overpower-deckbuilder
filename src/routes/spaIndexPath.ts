import fs from 'fs';
import path from 'path';

/**
 * Resolves the HTML entry document to serve for app (non-API) routes.
 *
 * Primary: the built React SPA at `frontend/dist/index.html` (the v2 frontend).
 * Fallback: the legacy `public/index.html` when the SPA has not been built yet
 * (e.g. a fresh checkout before `npm --prefix frontend run build`). This keeps
 * the server bootable during the transition.
 *
 * The result is cached after the first existence check; set
 * `EXCELSIOR_DISABLE_SPA=1` to force the legacy page (escape hatch).
 */
const SPA_INDEX = path.join(process.cwd(), 'frontend', 'dist', 'index.html');
const LEGACY_INDEX = path.join(process.cwd(), 'public', 'index.html');
const SPA_DIST_DIR = path.join(process.cwd(), 'frontend', 'dist');

let cached: string | null = null;

export function spaDistDir(): string {
  return SPA_DIST_DIR;
}

export function isSpaBuilt(): boolean {
  if (process.env.EXCELSIOR_DISABLE_SPA === '1') return false;
  try {
    return fs.existsSync(SPA_INDEX);
  } catch {
    return false;
  }
}

/** Absolute path to the HTML shell to serve for app routes. */
export function resolveSpaIndexPath(): string {
  if (cached) return cached;
  cached = isSpaBuilt() ? SPA_INDEX : LEGACY_INDEX;
  return cached;
}

/** Test/util hook to clear the memoized path (e.g. after a rebuild in dev). */
export function clearSpaIndexPathCache(): void {
  cached = null;
}
