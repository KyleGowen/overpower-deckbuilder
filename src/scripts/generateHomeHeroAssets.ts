/**
 * Generate 2× retina PNGs for every home hero banner master.
 * Run with: npm run generate:home-hero
 *
 * Masters: src/resources/images/home/banners/*.png (excluding *-2x.png)
 * Outputs: matching *-2x.png files in the same directory
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const FORCE_REGENERATE = process.argv.includes('--force');

const BANNERS_DIR = path.join(process.cwd(), 'src/resources/images/home/banners');

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function generateRetinaAsset(sourceFile: string): Promise<void> {
  const sourceName = path.basename(sourceFile);
  const outputName = sourceName.replace(/\.png$/i, '-2x.png');
  const outputFile = path.join(BANNERS_DIR, outputName);

  if (!FORCE_REGENERATE && fs.existsSync(outputFile)) {
    const sourceMtime = fs.statSync(sourceFile).mtimeMs;
    const outputMtime = fs.statSync(outputFile).mtimeMs;
    if (outputMtime >= sourceMtime) {
      const meta = await sharp(outputFile).metadata();
      console.log(
        `Skipped (up to date): ${outputName} ${meta.width}×${meta.height} — run with --force to regenerate`,
      );
      return;
    }
  }

  const sourceMeta = await sharp(sourceFile).metadata();
  const width = sourceMeta.width;
  const height = sourceMeta.height;
  if (!width || !height) {
    throw new Error(`Could not read dimensions from ${sourceName}`);
  }

  await sharp(sourceFile)
    .resize({ width: width * 2, height: height * 2, kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(outputFile);

  const sourceSize = fs.statSync(sourceFile).size;
  const outputSize = fs.statSync(outputFile).size;
  const outputMeta = await sharp(outputFile).metadata();

  console.log(
    `Generated ${outputName}: ${outputMeta.width}×${outputMeta.height} (${formatBytes(outputSize)}) from ${sourceName} ${width}×${height} (${formatBytes(sourceSize)})`,
  );
}

async function main(): Promise<void> {
  if (!fs.existsSync(BANNERS_DIR)) {
    console.error(`Missing banner directory: ${BANNERS_DIR}`);
    process.exit(1);
  }

  const sourceFiles = fs
    .readdirSync(BANNERS_DIR)
    .filter((fileName) => fileName.endsWith('.png') && !fileName.endsWith('-2x.png'))
    .sort()
    .map((fileName) => path.join(BANNERS_DIR, fileName));

  if (sourceFiles.length === 0) {
    console.error(`No banner masters found in ${BANNERS_DIR}`);
    process.exit(1);
  }

  for (const sourceFile of sourceFiles) {
    await generateRetinaAsset(sourceFile);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
