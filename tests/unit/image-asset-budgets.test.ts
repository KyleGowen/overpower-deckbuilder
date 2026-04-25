import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_ICON_MAX_BYTES = 60 * 1024;
const ROOT_ICON_MAX_EDGE_PX = 128;
const repeatedUiIcons = [
  'energy.png',
  'combat.png',
  'brute_force.png',
  'intelligence.png',
  'any-power.png',
  'threat.png',
];

describe('UI image asset budgets', () => {
  it.each(repeatedUiIcons)('%s stays small enough for repeated UI chrome use', async (filename) => {
    const filePath = path.join(process.cwd(), 'src/resources/images/icons', filename);
    const stat = fs.statSync(filePath);
    const metadata = await sharp(filePath).metadata();

    expect(stat.size).toBeLessThanOrEqual(ROOT_ICON_MAX_BYTES);
    expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBeLessThanOrEqual(ROOT_ICON_MAX_EDGE_PX);
  });
});
