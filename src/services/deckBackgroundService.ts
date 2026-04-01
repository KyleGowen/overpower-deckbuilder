import * as fs from 'fs/promises';
import * as path from 'path';

/** Subfolders under `src/resources/images/backgrounds/` scanned for deck background PNGs. */
const BACKGROUND_SUBDIRS = ['landscape', 'portrait'] as const;

/**
 * Service for managing deck background images
 * Provides caching for background image listings
 */
export class DeckBackgroundService {
  private readonly backgroundsBaseDir = path.join(process.cwd(), 'src/resources/images/backgrounds');
  private cachedBackgrounds: string[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  /**
   * List project-root-relative paths for PNG files in one backgrounds subfolder.
   * Returns empty array on read errors (caller may combine with other folders).
   */
  private async listPngPathsInSubdir(subdir: (typeof BACKGROUND_SUBDIRS)[number]): Promise<string[]> {
    const dir = path.join(this.backgroundsBaseDir, subdir);
    try {
      const files = await fs.readdir(dir);
      return files
        .filter(file => file.toLowerCase().endsWith('.png'))
        .map(file => `src/resources/images/backgrounds/${subdir}/${file}`);
    } catch (error) {
      console.error(`DeckBackgroundService: Error reading backgrounds/${subdir}:`, error);
      console.error('Directory path:', dir);
      return [];
    }
  }

  /**
   * Get list of available background images
   * Results are cached for 15 minutes
   */
  async getAvailableBackgrounds(): Promise<string[]> {
    const now = Date.now();

    // Return cached results if still valid
    if (this.cachedBackgrounds && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedBackgrounds;
    }

    const bySubdir = await Promise.all(
      BACKGROUND_SUBDIRS.map(subdir => this.listPngPathsInSubdir(subdir))
    );
    const merged = bySubdir.flat().sort();

    this.cachedBackgrounds = merged;
    this.cacheTimestamp = now;

    const counts = BACKGROUND_SUBDIRS.map((subdir, i) => `${subdir}:${bySubdir[i].length}`).join(', ');
    if (merged.length === 0) {
      console.error('DeckBackgroundService: No background images found in any subfolder');
      console.error('Backgrounds base path:', this.backgroundsBaseDir);
      console.error('Current working directory:', process.cwd());
    } else {
      console.log(`DeckBackgroundService: Found ${merged.length} background images (${counts})`);
    }

    return this.cachedBackgrounds;
  }

  /**
   * Validate that a background image path exists
   * @param imagePath - Relative path from project root (e.g. landscape or portrait under `src/resources/images/backgrounds/`)
   */
  async validateBackgroundPath(imagePath: string | null): Promise<boolean> {
    if (!imagePath) {
      return true; // NULL/null is valid (default background)
    }

    try {
      // Use process.cwd() to get project root, works in both dev and production
      const projectRoot = process.cwd();
      const fullPath = path.join(projectRoot, imagePath); // Resolves "src/resources/..." from project root

      if (!imagePath.includes('backgrounds')) {
        console.warn('Background path validation: Path does not include "backgrounds" directory:', imagePath);
        return false;
      }

      await fs.access(fullPath, fs.constants.F_OK);
      console.log('Background path validation: Valid path:', fullPath);
      return true;
    } catch (error) {
      console.error('Background path validation failed:', imagePath, 'Resolved to:', path.join(process.cwd(), imagePath), error);
      return false;
    }
  }

  /**
   * Clear the cache (useful for testing or when backgrounds are added/removed)
   */
  clearCache(): void {
    this.cachedBackgrounds = null;
    this.cacheTimestamp = 0;
  }
}
