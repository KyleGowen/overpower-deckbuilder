import fs from 'fs';
import path from 'path';

/** Built React SPA entry document at `frontend/dist/index.html`. */
const SPA_INDEX = path.join(process.cwd(), 'frontend', 'dist', 'index.html');
const SPA_DIST_DIR = path.join(process.cwd(), 'frontend', 'dist');

let cached: string | null = null;

export function spaDistDir(): string {
  return SPA_DIST_DIR;
}

/** True when the v2 SPA build output exists on disk. */
export function isSpaBuilt(): boolean {
  try {
    return fs.existsSync(SPA_INDEX);
  } catch {
    return false;
  }
}

/** Absolute path to the HTML shell to serve for app routes. */
export function resolveSpaIndexPath(): string {
  if (cached) return cached;
  if (!isSpaBuilt()) {
    throw new Error(
      'SPA not built: frontend/dist/index.html is missing. Run `npm --prefix frontend run build` or use the Vite dev server on :5173.'
    );
  }
  cached = SPA_INDEX;
  return cached;
}

/** Test/util hook to clear the memoized path (e.g. after a rebuild in dev). */
export function clearSpaIndexPathCache(): void {
  cached = null;
}
