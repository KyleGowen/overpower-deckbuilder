/**
 * Generate thumbnails for card images across all card-art directories.
 * Scans each directory for all image formats, outputs resized WebP thumbnails to thumb subdirectories.
 * Run with: npm run generate:thumbnails
 *
 * Excludes non-card assets (e.g. backgrounds/).
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp, { type ResizeOptions } from 'sharp';

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.gif'];
const WEBP_QUALITY = 80;

/** When true, every thumbnail is regenerated (ignores mtime skip). Use after changing resize strategy. */
const FORCE_REGENERATE = process.argv.includes('--force');

// Dimensions are 2× the CSS pixel display sizes for retina/HiDPI sharpness.
type ThumbResizeConfig = {
  width: number;
  height: number;
  fit: NonNullable<ResizeOptions['fit']>;
  /** Used with fit 'contain' / 'fill' — letterbox/pad to canvas size */
  background?: ResizeOptions['background'];
};

const PRESET_CHARACTER: ThumbResizeConfig = { width: 380, height: 280, fit: 'cover' };
const PRESET_MISSION: ThumbResizeConfig = { width: 264, height: 378, fit: 'cover' };
/** Matches deck tile location slot 236×151 (2×); `cover` fills the frame (may crop tall/wide art). */
const PRESET_LOCATION: ThumbResizeConfig = { width: 472, height: 302, fit: 'cover' };

/** One entry per top-level folder under src/resources/cards/images (excluding backgrounds, etc.). */
const THUMB_CONFIGS: Record<string, ThumbResizeConfig> = {
  characters: PRESET_CHARACTER,
  missions: PRESET_MISSION,
  locations: PRESET_LOCATION,
  specials: PRESET_CHARACTER,
  'power-cards': PRESET_CHARACTER,
  events: PRESET_MISSION,
  aspects: PRESET_CHARACTER,
  'advanced-universe': PRESET_CHARACTER,
  'teamwork-universe': PRESET_CHARACTER,
  'ally-universe': PRESET_CHARACTER,
  'training-universe': PRESET_CHARACTER,
  'basic-universe': PRESET_CHARACTER,
};

const THUMBNAIL_DIRS = [
  'characters',
  'missions',
  'locations',
  'specials',
  'power-cards',
  'events',
  'aspects',
  'advanced-universe',
  'teamwork-universe',
  'ally-universe',
  'training-universe',
  'basic-universe',
] as const;

const IMAGES_BASE = path.join(process.cwd(), 'src/resources/cards/images');

function getAllImageFiles(dir: string, basePath: string = dir): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'thumb') continue;
      results.push(...getAllImageFiles(fullPath, basePath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function getThumbnailPath(sourcePath: string, sourceDir: string, thumbDir: string): string {
  const relativeToSource = path.relative(sourceDir, sourcePath);
  const dir = path.dirname(relativeToSource);
  const basename = path.basename(sourcePath, path.extname(sourcePath));
  const thumbRelative = path.join(dir, `${basename}.webp`);
  return path.join(thumbDir, thumbRelative);
}

function shouldSkip(sourcePath: string, thumbPath: string): boolean {
  if (FORCE_REGENERATE) return false;
  if (!fs.existsSync(thumbPath)) return false;
  const sourceStat = fs.statSync(sourcePath);
  const thumbStat = fs.statSync(thumbPath);
  return thumbStat.mtimeMs >= sourceStat.mtimeMs;
}

async function processDirectory(
  sourceDir: string,
  thumbDir: string,
  label: string,
  thumbConfig: ThumbResizeConfig
): Promise<{ processed: number; skipped: number; errors: number }> {
  const imageFiles = getAllImageFiles(sourceDir);
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const sourcePath of imageFiles) {
    const thumbPath = getThumbnailPath(sourcePath, sourceDir, thumbDir);

    if (shouldSkip(sourcePath, thumbPath)) {
      skipped++;
      continue;
    }

    try {
      fs.mkdirSync(path.dirname(thumbPath), { recursive: true });
      const resizeOpts: ResizeOptions = {
        width: thumbConfig.width,
        height: thumbConfig.height,
        fit: thumbConfig.fit,
        ...(thumbConfig.background ? { background: thumbConfig.background } : {}),
      };
      await sharp(sourcePath)
        .resize(resizeOpts)
        .webp({ quality: WEBP_QUALITY })
        .toFile(thumbPath);
      processed++;
      const rel = path.relative(sourceDir, sourcePath);
      const thumbRel = path.relative(thumbDir, thumbPath);
      console.log(`   ✓ ${rel} → thumb/${thumbRel}`);
    } catch (err) {
      errors++;
      console.error(`   ✗ ${path.relative(sourceDir, sourcePath)}:`, err instanceof Error ? err.message : err);
    }
  }

  return { processed, skipped, errors };
}

async function generateThumbnails(): Promise<void> {
  console.log('🖼️  Generating card thumbnails (all card-art directories; backgrounds excluded)...');
  if (FORCE_REGENERATE) {
    console.log('   --force: regenerating all thumbnails (ignoring skip cache)');
  }
  console.log(
    '   Presets: character-like 380×280 cover; mission/event-like 264×378 cover; locations 472×302 cover (2× retina) | WebP quality:',
    WEBP_QUALITY
  );
  console.log('');

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const dirName of THUMBNAIL_DIRS) {
    const sourceDir = path.join(IMAGES_BASE, dirName);
    const thumbDir = path.join(sourceDir, 'thumb');

    if (!fs.existsSync(sourceDir)) {
      console.log(`⏭️  Skipping ${dirName}/ (directory not found)`);
      continue;
    }

    const config = THUMB_CONFIGS[dirName];
    console.log(`📁 ${dirName}/  (${config.width}×${config.height}, ${config.fit})`);
    const { processed, skipped, errors } = await processDirectory(sourceDir, thumbDir, dirName, config);
    totalProcessed += processed;
    totalSkipped += skipped;
    totalErrors += errors;
    console.log(`   ${processed} generated, ${skipped} skipped, ${errors} error(s)\n`);
  }

  console.log(`✅ Done: ${totalProcessed} generated, ${totalSkipped} skipped (up to date), ${totalErrors} error(s)`);
}

generateThumbnails().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
