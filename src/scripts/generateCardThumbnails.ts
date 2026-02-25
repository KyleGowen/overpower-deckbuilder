/**
 * Generate thumbnails for card images (characters, missions, locations).
 * Scans each directory for all image formats, outputs resized WebP thumbnails to thumb subdirectories.
 * Run with: npm run generate:thumbnails
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg', '.gif'];
const WEBP_QUALITY = 80;

// Dimensions match the exact CSS pixel sizes used on deck tiles.
// Generating at display size avoids downloading 3x more pixels than needed.
const THUMB_CONFIGS: Record<string, { width: number; height: number }> = {
  characters: { width: 190, height: 140 },
  locations:  { width: 250, height: 160 },
  missions:   { width: 140, height: 200 },
};

const IMAGES_BASE = path.join(process.cwd(), 'src/resources/cards/images');
const THUMBNAIL_DIRS = ['characters', 'missions', 'locations'] as const;

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
  if (!fs.existsSync(thumbPath)) return false;
  const sourceStat = fs.statSync(sourcePath);
  const thumbStat = fs.statSync(thumbPath);
  return thumbStat.mtimeMs >= sourceStat.mtimeMs;
}

async function processDirectory(
  sourceDir: string,
  thumbDir: string,
  label: string,
  thumbConfig: { width: number; height: number }
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
      await sharp(sourcePath)
        .resize({ width: thumbConfig.width, height: thumbConfig.height, fit: 'cover' })
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
  console.log('🖼️  Generating card thumbnails (characters, missions, locations)...');
  console.log('   Dimensions: characters 190×140, locations 250×160, missions 140×200 | WebP quality:', WEBP_QUALITY);
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
    console.log(`📁 ${dirName}/  (${config.width}×${config.height})`);
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
