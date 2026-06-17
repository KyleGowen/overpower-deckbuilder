/**
 * Generate 2× retina PNG for the home hero banner from the 1× master.
 * Run with: npm run generate:home-hero
 *
 * Master: src/resources/images/home/home-hero.png
 * Output: src/resources/images/home/home-hero-2x.png
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const FORCE_REGENERATE = process.argv.includes('--force');

const HOME_DIR = path.join(process.cwd(), 'src/resources/images/home');
const SOURCE_FILE = path.join(HOME_DIR, 'home-hero.png');
const OUTPUT_FILE = path.join(HOME_DIR, 'home-hero-2x.png');

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Missing master asset: ${SOURCE_FILE}`);
    process.exit(1);
  }

  if (!FORCE_REGENERATE && fs.existsSync(OUTPUT_FILE)) {
    const sourceMtime = fs.statSync(SOURCE_FILE).mtimeMs;
    const outputMtime = fs.statSync(OUTPUT_FILE).mtimeMs;
    if (outputMtime >= sourceMtime) {
      const meta = await sharp(OUTPUT_FILE).metadata();
      console.log(
        `Skipped (up to date): home-hero-2x.png ${meta.width}×${meta.height} — run with --force to regenerate`,
      );
      return;
    }
  }

  const sourceMeta = await sharp(SOURCE_FILE).metadata();
  const width = sourceMeta.width;
  const height = sourceMeta.height;
  if (!width || !height) {
    console.error('Could not read dimensions from home-hero.png');
    process.exit(1);
  }

  await sharp(SOURCE_FILE)
    .resize({ width: width * 2, height: height * 2, kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT_FILE);

  const sourceSize = fs.statSync(SOURCE_FILE).size;
  const outputSize = fs.statSync(OUTPUT_FILE).size;
  const outputMeta = await sharp(OUTPUT_FILE).metadata();

  console.log(
    `Generated home-hero-2x.png: ${outputMeta.width}×${outputMeta.height} (${formatBytes(outputSize)}) from ${width}×${height} (${formatBytes(sourceSize)})`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
