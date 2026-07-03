/**
 * Generate browser favicon and Apple touch icon from the emblem master (logo6).
 * Run with: npm run generate:favicon
 *
 * Source: src/resources/images/logo/logo6.png
 * Outputs:
 *   src/resources/images/favicon.png (32×32)
 *   src/resources/images/apple-touch-icon.png (180×180)
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const FORCE_REGENERATE = process.argv.includes('--force');

const IMAGES_DIR = path.join(process.cwd(), 'src/resources/images');
const SOURCE_FILE = path.join(IMAGES_DIR, 'logo/logo6.png');

const OUTPUTS = [
  { file: 'favicon.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
] as const;

/** Turn near-black pixels transparent so the favicon has no filled background. */
async function keyOutNearBlack(input: Buffer): Promise<Buffer> {
  const THRESHOLD = 28;
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (r <= THRESHOLD && g <= THRESHOLD && b <= THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Trim padding, then scale emblem to fill the square (slight wing clip at 32px). */
async function emblemToSquarePng(size: number): Promise<Buffer> {
  const keyed = await keyOutNearBlack(await fs.promises.readFile(SOURCE_FILE));

  const trimmed = await sharp(keyed)
    .trim({ threshold: 1 })
    .toBuffer();

  // Zoom ~8% past the square so the mark reads larger at favicon scale; center-crop wins back the square.
  const zoom = size <= 32 ? 1.08 : 1.04;
  const zoomed = Math.round(size * zoom);

  return sharp(trimmed)
    .resize({ width: zoomed, height: zoomed, fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .resize({ width: size, height: size, fit: 'cover', position: 'centre', kernel: 'lanczos3' })
    .png({ compressionLevel: 9, force: true })
    .toBuffer();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

async function needsRegenerate(outputPath: string): Promise<boolean> {
  if (FORCE_REGENERATE || !fs.existsSync(outputPath)) return true;
  const sourceMtime = fs.statSync(SOURCE_FILE).mtimeMs;
  const outputMtime = fs.statSync(outputPath).mtimeMs;
  return outputMtime < sourceMtime;
}

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Missing emblem source: ${SOURCE_FILE}`);
    process.exit(1);
  }

  let generated = 0;
  let skipped = 0;

  for (const { file, size } of OUTPUTS) {
    const outputPath = path.join(IMAGES_DIR, file);
    if (!(await needsRegenerate(outputPath))) {
      const meta = await sharp(outputPath).metadata();
      console.log(
        `Skipped (up to date): ${file} ${meta.width}×${meta.height} — run with --force to regenerate`,
      );
      skipped += 1;
      continue;
    }

    await emblemToSquarePng(size).then((buf) => fs.promises.writeFile(outputPath, buf));

    const outputSize = fs.statSync(outputPath).size;
    console.log(`Generated ${file}: ${size}×${size} (${formatBytes(outputSize)})`);
    generated += 1;
  }

  if (generated === 0 && skipped === OUTPUTS.length) {
    return;
  }

  const sourceSize = fs.statSync(SOURCE_FILE).size;
  console.log(`Source: logo6.png (${formatBytes(sourceSize)})`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
