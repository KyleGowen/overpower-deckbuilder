/**
 * One-off script to generate icon_first_action_only.png from reference.
 * Output: 512x512 PNG, transparent background, monochrome white "1ST" glyph.
 * Run: npx ts-node scripts/generateFirstActionIcon.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SIZE = 512;
const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/resources/images/icons/specials/icon_first_action_only.png'
);

// SVG: large bold "1", smaller superscript "ST", thin underline. White on transparent.
// Layout matches reference: 1ST symbol centered with balanced padding.
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="none"/>
  <g fill="white">
    <text x="128" y="318" font-family="Arial Black, Arial, sans-serif" font-size="280" font-weight="900">1</text>
    <text x="258" y="213" font-family="Arial, sans-serif" font-size="95" font-weight="bold">ST</text>
  </g>
  <line x1="163" y1="348" x2="333" y2="348" stroke="white" stroke-width="8" stroke-linecap="square"/>
</svg>
`.trim();

async function main(): Promise<void> {
  const buffer = Buffer.from(SVG);
  const png = await sharp(buffer)
    .resize(SIZE, SIZE)
    .png()
    .toBuffer();

  fs.writeFileSync(OUTPUT_PATH, png);

  // Verify output
  const meta = await sharp(png).metadata();
  const stats = fs.statSync(OUTPUT_PATH);
  console.log('Generated:', OUTPUT_PATH);
  console.log('  size:', meta.width, 'x', meta.height);
  console.log('  format:', meta.format);
  console.log('  hasAlpha:', meta.hasAlpha);
  console.log('  fileSize:', stats.size, 'bytes');

  if (meta.width !== SIZE || meta.height !== SIZE) {
    throw new Error(`Expected ${SIZE}x${SIZE}, got ${meta.width}x${meta.height}`);
  }
  if (meta.hasAlpha !== true) {
    throw new Error('Expected alpha channel (transparent background)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
