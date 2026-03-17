/**
 * Reusable CLI scanner for Special-card function icons.
 *
 * Usage:
 *   ts-node src/scripts/scanSpecialFunctionIcons.ts --all
 *   ts-node src/scripts/scanSpecialFunctionIcons.ts --files=300.webp,banishment.webp
 *
 * Outputs:
 * - JSON with per-card detections and confidence metadata
 * - SQL UPDATE statements for special_cards boolean icon columns
 * - Markdown report with a dedicated questionable-cards section
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

type IconKey =
  | 'icon_offensive_swords'
  | 'icon_defensive_shield'
  | 'icon_remainder_of_battle'
  | 'icon_remainder_of_game'
  | 'icon_attached_paperclip'
  | 'icon_astral_plane'
  | 'icon_first_action_only';

type IconState = Record<IconKey, boolean>;

interface CliOptions {
  files: string[] | null;
  outJson: string;
  outSql: string;
  outReport: string;
  minAccept: number;
  uncertainBelow: number;
}

interface Component {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  area: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  fillRatio: number;
  vector: number[];
}

interface MaskData {
  width: number;
  height: number;
  xStart: number;
  regionWidth: number;
  mask: Uint8Array;
}

interface Detection {
  label: IconKey;
  confidence: number;
  assignedByHeuristic: boolean;
}

interface CardScanResult {
  filename: string;
  imagePath: string;
  detections: Detection[];
  iconState: IconState;
  questionable: string[];
}

const SPECIALS_DIR = path.join(process.cwd(), 'src/resources/cards/images/specials');
const DEFAULT_JSON_OUT = path.join(process.cwd(), 'docs/generated/special-function-icons-scan.json');
const DEFAULT_SQL_OUT = path.join(process.cwd(), 'migrations/generated/special-function-icons-updates.sql');
const DEFAULT_REPORT_OUT = path.join(process.cwd(), 'docs/generated/special-function-icons-scan.md');

const ICON_KEYS: IconKey[] = [
  'icon_offensive_swords',
  'icon_defensive_shield',
  'icon_remainder_of_battle',
  'icon_remainder_of_game',
  'icon_attached_paperclip',
  'icon_astral_plane',
  'icon_first_action_only',
];

const ICON_LABELS: Record<IconKey, string> = {
  icon_offensive_swords: 'Crossed swords (offensive action)',
  icon_defensive_shield: 'Shield (defensive action)',
  icon_remainder_of_battle: 'Half hourglass (remainder of battle)',
  icon_remainder_of_game: 'Full hourglass (remainder of game)',
  icon_attached_paperclip: 'Paperclip (attached to character)',
  icon_astral_plane: 'Astral Plane icon',
  icon_first_action_only: '1ST icon (first action only)',
};

const ICON_ACCEPT_FLOORS: Partial<Record<IconKey, number>> = {
  icon_attached_paperclip: 0.6,
  icon_astral_plane: 0.72,
};

const HOURGLASS_KEYS: IconKey[] = ['icon_remainder_of_battle', 'icon_remainder_of_game'];
const OFFDEF_KEYS: IconKey[] = ['icon_offensive_swords', 'icon_defensive_shield'];
const BOTTOM_KEYS: IconKey[] = ['icon_attached_paperclip', 'icon_astral_plane', 'icon_defensive_shield'];

const CALIBRATION: Record<string, IconKey[]> = {
  '_weighing_ofthe_heart.webp': ['icon_remainder_of_battle', 'icon_offensive_swords'],
  '300.webp': ['icon_offensive_swords', 'icon_defensive_shield'],
  '3_quick_strokes.webp': ['icon_offensive_swords'],
  'abner_perrys_lab_assistant.webp': ['icon_offensive_swords'],
  'early_feminist_leader.webp': ['icon_remainder_of_game', 'icon_offensive_swords', 'icon_defensive_shield', 'icon_astral_plane'],
  'fairy_protection.webp': ['icon_remainder_of_battle', 'icon_defensive_shield', 'icon_attached_paperclip'],
  'lady_of_the_jungle.webp': ['icon_remainder_of_battle', 'icon_offensive_swords'],
  'like_father_like_son.webp': ['icon_remainder_of_battle', 'icon_offensive_swords', 'icon_astral_plane'],
  'all_for_one.webp': ['icon_remainder_of_game', 'icon_offensive_swords', 'icon_attached_paperclip'],
  'battle_of_wits.webp': ['icon_remainder_of_battle', 'icon_offensive_swords'],
  'banishment.webp': ['icon_remainder_of_battle', 'icon_offensive_swords', 'icon_astral_plane'],
  'lower_gravity.webp': ['icon_remainder_of_battle', 'icon_offensive_swords', 'icon_defensive_shield', 'icon_attached_paperclip'],
  'protection_of_saint_michael.webp': ['icon_remainder_of_battle', 'icon_defensive_shield', 'icon_astral_plane'],
  'sacred_wafers_of_amsterdam.webp': ['icon_remainder_of_battle', 'icon_offensive_swords', 'icon_defensive_shield', 'icon_attached_paperclip'],
};

const MANUAL_TRUTH: Record<string, IconKey[]> = {
  '300.webp': ['icon_offensive_swords', 'icon_defensive_shield'],
  'all_for_one.webp': ['icon_remainder_of_game', 'icon_offensive_swords', 'icon_attached_paperclip'],
  'archimedes.webp': ['icon_offensive_swords'],
  'athos.webp': ['icon_offensive_swords'],
  'avenging_my_love.webp': ['icon_offensive_swords'],
  'baptized_in_combat.webp': ['icon_offensive_swords', 'icon_defensive_shield'],
  'burned_at_the_stake.webp': ['icon_offensive_swords'],
  'call_of_cthulhu.webp': ['icon_remainder_of_game', 'icon_offensive_swords', 'icon_astral_plane'],
  'champions_of_barsoom.webp': ['icon_offensive_swords'],
  'chivalrous_protector.webp': ['icon_defensive_shield'],
};

function defaultIconState(): IconState {
  return {
    icon_offensive_swords: false,
    icon_defensive_shield: false,
    icon_remainder_of_battle: false,
    icon_remainder_of_game: false,
    icon_attached_paperclip: false,
    icon_astral_plane: false,
    icon_first_action_only: false,
  };
}

function buildManualTruthResult(filename: string, labels: IconKey[]): CardScanResult {
  const iconState = defaultIconState();
  for (const label of labels) {
    iconState[label] = true;
  }
  return {
    filename,
    imagePath: `specials/${filename}`,
    detections: labels.map((label) => ({
      label,
      confidence: 1,
      assignedByHeuristic: false,
    })),
    iconState,
    questionable: [],
  };
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    files: null,
    outJson: DEFAULT_JSON_OUT,
    outSql: DEFAULT_SQL_OUT,
    outReport: DEFAULT_REPORT_OUT,
    minAccept: 0.58,
    uncertainBelow: 0.72,
  };

  for (const arg of argv) {
    if (arg === '--all') {
      options.files = null;
      continue;
    }
    if (arg.startsWith('--files=')) {
      const value = arg.slice('--files='.length).trim();
      options.files = value.length === 0
        ? []
        : value.split(',').map((item) => item.trim()).filter(Boolean);
      continue;
    }
    if (arg.startsWith('--out-json=')) {
      options.outJson = resolveOutPath(arg.slice('--out-json='.length).trim());
      continue;
    }
    if (arg.startsWith('--out-sql=')) {
      options.outSql = resolveOutPath(arg.slice('--out-sql='.length).trim());
      continue;
    }
    if (arg.startsWith('--out-report=')) {
      options.outReport = resolveOutPath(arg.slice('--out-report='.length).trim());
      continue;
    }
    if (arg.startsWith('--min-accept=')) {
      options.minAccept = clamp01(parseFloat(arg.slice('--min-accept='.length).trim()));
      continue;
    }
    if (arg.startsWith('--uncertain-below=')) {
      options.uncertainBelow = clamp01(parseFloat(arg.slice('--uncertain-below='.length).trim()));
      continue;
    }
  }

  if (options.uncertainBelow < options.minAccept) {
    options.uncertainBelow = options.minAccept;
  }
  return options;
}

function resolveOutPath(value: string): string {
  if (path.isAbsolute(value)) {
    return value;
  }
  return path.join(process.cwd(), value);
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function listSpecialImageFiles(): string[] {
  const files = fs.readdirSync(SPECIALS_DIR, { withFileTypes: true });
  return files
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.webp'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function makeVectorFromMask(mask: Uint8Array, width: number, height: number): number[] {
  const outSize = 32;
  const out: number[] = [];
  for (let oy = 0; oy < outSize; oy += 1) {
    const yStart = Math.floor((oy * height) / outSize);
    const yEnd = Math.max(yStart + 1, Math.floor(((oy + 1) * height) / outSize));
    for (let ox = 0; ox < outSize; ox += 1) {
      const xStart = Math.floor((ox * width) / outSize);
      const xEnd = Math.max(xStart + 1, Math.floor(((ox + 1) * width) / outSize));
      let sum = 0;
      let total = 0;
      for (let y = yStart; y < yEnd; y += 1) {
        for (let x = xStart; x < xEnd; x += 1) {
          sum += mask[(y * width) + x];
          total += 1;
        }
      }
      out.push(total > 0 && sum / total >= 0.35 ? 1 : 0);
    }
  }
  return out;
}

function smooth(values: number[], radius: number): number[] {
  const out = new Array<number>(values.length).fill(0);
  for (let i = 0; i < values.length; i += 1) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - radius); j <= Math.min(values.length - 1, i + radius); j += 1) {
      sum += values[j];
      count += 1;
    }
    out[i] = count === 0 ? 0 : sum / count;
  }
  return out;
}

async function buildWhiteMask(imagePath: string): Promise<MaskData> {
  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const xStart = Math.floor(width * 0.18);
  const xEnd = Math.floor(width * 0.58);
  const regionWidth = xEnd - xStart;
  const mask = new Uint8Array(regionWidth * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < regionWidth; x += 1) {
      const fullX = xStart + x;
      const index = ((y * width) + fullX) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      mask[(y * regionWidth) + x] = (a > 160 && r > 170 && g > 170 && b > 170 && (max - min) < 85) ? 1 : 0;
    }
  }

  return { width, height, xStart, regionWidth, mask };
}

function legacyExtractCandidates(maskData: MaskData): Component[] {
  const { width, height, xStart, regionWidth, mask } = maskData;
  const visited = new Uint8Array(mask.length);
  const components: Component[] = [];
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let idx = 0; idx < mask.length; idx += 1) {
    if (!mask[idx] || visited[idx]) continue;
    const queue = [idx];
    visited[idx] = 1;
    let queuePos = 0;
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = -1;
    let maxY = -1;
    let area = 0;
    while (queuePos < queue.length) {
      const current = queue[queuePos];
      queuePos += 1;
      const y = Math.floor(current / regionWidth);
      const x = current % regionWidth;
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const [dx, dy] of directions) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (nextX < 0 || nextY < 0 || nextX >= regionWidth || nextY >= height) continue;
        const nextIdx = (nextY * regionWidth) + nextX;
        if (mask[nextIdx] && !visited[nextIdx]) {
          visited[nextIdx] = 1;
          queue.push(nextIdx);
        }
      }
    }
    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    if (area < 120 || area > 10000 || boxW < 10 || boxH < 10 || boxH > 260 || boxW > 220) continue;
    const fillRatio = area / (boxW * boxH);
    if (fillRatio < 0.1) continue;
    const local = new Uint8Array(boxW * boxH);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        local[((y - minY) * boxW) + (x - minX)] = mask[(y * regionWidth) + x];
      }
    }
    components.push({
      minX: xStart + minX,
      minY,
      maxX: xStart + maxX,
      maxY,
      area,
      width: boxW,
      height: boxH,
      centerX: xStart + Math.round((minX + maxX) / 2),
      centerY: Math.round((minY + maxY) / 2),
      fillRatio,
      vector: makeVectorFromMask(local, boxW, boxH),
    });
  }
  return components
    .filter((component) => component.centerY > Math.floor(height * 0.08) && component.centerY < Math.floor(height * 0.92))
    .sort((a, b) => a.centerY - b.centerY)
    .slice(0, 4);
}

function detectLaneX(maskData: MaskData): { laneStart: number; laneEnd: number } {
  const { height, regionWidth, mask } = maskData;
  const yMin = Math.floor(height * 0.1);
  const yMax = Math.floor(height * 0.82);
  const colScores = new Array<number>(regionWidth).fill(0);
  for (let x = 0; x < regionWidth; x += 1) {
    let sum = 0;
    for (let y = yMin; y < yMax; y += 1) {
      sum += mask[(y * regionWidth) + x];
    }
    colScores[x] = sum;
  }
  const smoothCols = smooth(colScores, 4);
  let bestX = 0;
  let best = -1;
  for (let x = 0; x < smoothCols.length; x += 1) {
    if (smoothCols[x] > best) {
      best = smoothCols[x];
      bestX = x;
    }
  }
  const halfWidth = Math.max(18, Math.floor(regionWidth * 0.08));
  return {
    laneStart: Math.max(0, bestX - halfWidth),
    laneEnd: Math.min(regionWidth - 1, bestX + halfWidth),
  };
}

function detectSlotRanges(maskData: MaskData, laneStart: number, laneEnd: number): Array<{ y0: number; y1: number; score: number }> {
  const { height, regionWidth, mask } = maskData;
  const yMin = Math.floor(height * 0.1);
  const yMax = Math.floor(height * 0.84);
  const rowScores = new Array<number>(height).fill(0);
  for (let y = yMin; y < yMax; y += 1) {
    let sum = 0;
    for (let x = laneStart; x <= laneEnd; x += 1) {
      sum += mask[(y * regionWidth) + x];
    }
    rowScores[y] = sum;
  }
  const smoothRows = smooth(rowScores, 2);
  let peak = 0;
  for (const value of smoothRows) {
    if (value > peak) peak = value;
  }
  const threshold = Math.max(3, peak * 0.18);

  const ranges: Array<{ y0: number; y1: number; score: number }> = [];
  let start = -1;
  let accum = 0;
  for (let y = yMin; y < yMax; y += 1) {
    if (smoothRows[y] >= threshold) {
      if (start < 0) {
        start = y;
        accum = 0;
      }
      accum += smoothRows[y];
    } else if (start >= 0) {
      if (y - start >= 10) {
        ranges.push({ y0: start, y1: y - 1, score: accum });
      }
      start = -1;
      accum = 0;
    }
  }
  if (start >= 0 && yMax - start >= 10) {
    ranges.push({ y0: start, y1: yMax - 1, score: accum });
  }

  if (ranges.length <= 1) return ranges;
  const merged: Array<{ y0: number; y1: number; score: number }> = [ranges[0]];
  for (let i = 1; i < ranges.length; i += 1) {
    const prev = merged[merged.length - 1];
    const cur = ranges[i];
    if (cur.y0 - prev.y1 <= 14) {
      prev.y1 = cur.y1;
      prev.score += cur.score;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function splitRangeEvenly(
  range: { y0: number; y1: number; score: number },
  parts: number
): Array<{ y0: number; y1: number; score: number }> {
  if (parts <= 1) return [range];
  const span = range.y1 - range.y0 + 1;
  if (span < parts * 10) return [range];
  const out: Array<{ y0: number; y1: number; score: number }> = [];
  const base = Math.floor(span / parts);
  const remainder = span % parts;
  let cursor = range.y0;
  for (let i = 0; i < parts; i += 1) {
    const size = base + (i < remainder ? 1 : 0);
    const y0 = cursor;
    const y1 = Math.max(y0, cursor + size - 1);
    out.push({ y0, y1, score: range.score / parts });
    cursor = y1 + 1;
  }
  return out;
}

function normalizeRanges(
  ranges: Array<{ y0: number; y1: number; score: number }>,
  expectedCount: number | null
): Array<{ y0: number; y1: number; score: number }> {
  let next = [...ranges];

  // When calibration expects more icons than raw ranges found, iteratively split the tallest range.
  if (expectedCount !== null && expectedCount > 0) {
    while (next.length < expectedCount) {
      let tallestIndex = -1;
      let tallestHeight = -1;
      for (let i = 0; i < next.length; i += 1) {
        const height = next[i].y1 - next[i].y0 + 1;
        if (height > tallestHeight) {
          tallestHeight = height;
          tallestIndex = i;
        }
      }
      if (tallestIndex < 0 || tallestHeight < 24) break;
      const [tallest] = next.splice(tallestIndex, 1);
      next.push(...splitRangeEvenly(tallest, 2));
    }
  } else {
    // Non-calibration scans: split very tall slot ranges that likely hide stacked icons.
    const expanded: Array<{ y0: number; y1: number; score: number }> = [];
    for (const range of next) {
      const height = range.y1 - range.y0 + 1;
      if (height >= 150) {
        expanded.push(...splitRangeEvenly(range, 3));
      } else if (height >= 80) {
        expanded.push(...splitRangeEvenly(range, 2));
      } else {
        expanded.push(range);
      }
    }
    next = expanded;
  }

  if (expectedCount !== null && next.length > expectedCount) {
    next = [...next]
      .sort((a, b) => b.score - a.score)
      .slice(0, expectedCount);
  } else if (next.length > 4) {
    next = [...next]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }

  return next.sort((a, b) => a.y0 - b.y0);
}

function buildComponentForRange(maskData: MaskData, laneStart: number, laneEnd: number, y0: number, y1: number): Component | null {
  const { xStart, regionWidth, mask } = maskData;
  const xPad = 12;
  const x0 = Math.max(0, laneStart - xPad);
  const x1 = Math.min(regionWidth - 1, laneEnd + xPad);
  const yy0 = Math.max(0, y0 - 6);
  const yy1 = Math.min(maskData.height - 1, y1 + 6);
  let minX = Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxX = -1;
  let maxY = -1;
  let area = 0;
  for (let y = yy0; y <= yy1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (!mask[(y * regionWidth) + x]) continue;
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (area < 55) return null;
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  if (width < 8 || height < 8 || width > 140 || height > 180) return null;
  const fillRatio = area / (width * height);
  if (fillRatio < 0.05) return null;

  const localMask = new Uint8Array(width * height);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      localMask[((y - minY) * width) + (x - minX)] = mask[(y * regionWidth) + x];
    }
  }

  return {
    minX: xStart + minX,
    minY,
    maxX: xStart + maxX,
    maxY,
    area,
    width,
    height,
    centerX: xStart + Math.round((minX + maxX) / 2),
    centerY: Math.round((minY + maxY) / 2),
    fillRatio,
    vector: makeVectorFromMask(localMask, width, height),
  };
}

async function extractIconCandidates(imagePath: string, _forCalibration: boolean = false, expectedCount: number | null = null): Promise<Component[]> {
  const maskData = await buildWhiteMask(imagePath);
  const { laneStart, laneEnd } = detectLaneX(maskData);
  let ranges = detectSlotRanges(maskData, laneStart, laneEnd);
  if (ranges.length === 0) return [];
  ranges = normalizeRanges(ranges, expectedCount);

  const components: Component[] = [];
  for (const range of ranges) {
    const component = buildComponentForRange(maskData, laneStart, laneEnd, range.y0, range.y1);
    if (component) {
      components.push(component);
    }
  }

  // Calibration pass: if strict extraction still misses slots, retry with looser local thresholds.
  if (_forCalibration && expectedCount !== null && components.length < expectedCount) {
    for (const range of ranges) {
      const loose = buildComponentForRange(maskData, laneStart, laneEnd, range.y0, range.y1 + 1);
      if (!loose) continue;
      const alreadyMatched = components.some(
        (existing) => Math.abs(existing.centerY - loose.centerY) <= 8
      );
      if (!alreadyMatched) {
        components.push(loose);
      }
      if (components.length >= expectedCount) break;
    }
  }

  const sorted = components.sort((a, b) => a.centerY - b.centerY);
  if (sorted.length > 0) {
    return sorted;
  }
  const fallback = legacyExtractCandidates(maskData);
  if (expectedCount !== null && fallback.length > expectedCount) {
    return fallback.slice(0, expectedCount);
  }
  return fallback;
}

function averageTemplate(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const length = vectors[0].length;
  const out = new Array<number>(length).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < length; i += 1) {
      out[i] += vector[i];
    }
  }
  for (let i = 0; i < length; i += 1) {
    out[i] = out[i] / vectors.length;
  }
  return out;
}

function computeTopBottomAsymmetry(vector: number[]): number {
  if (vector.length !== 1024) return 1;
  let top = 0;
  let bottom = 0;
  const grid = 32;
  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const value = vector[(y * grid) + x];
      if (y < grid / 2) {
        top += value;
      } else {
        bottom += value;
      }
    }
  }
  const total = top + bottom;
  if (total === 0) return 1;
  return Math.abs(top - bottom) / total;
}

function scoreIconForComponent(
  iconKey: IconKey,
  baseScore: number,
  component: Component,
  slotIndex: number,
  totalSlots: number
): number {
  let score = baseScore;
  const slot = totalSlots <= 1 ? 0.5 : slotIndex / (totalSlots - 1);

  // Positional priors by slot (top/mid/bottom icon lane behavior).
  if (slot <= 0.3) {
    if (HOURGLASS_KEYS.includes(iconKey)) score += 0.18;
    if (OFFDEF_KEYS.includes(iconKey)) score -= 0.04;
    if (BOTTOM_KEYS.includes(iconKey)) score -= 0.2;
  } else if (slot >= 0.72) {
    if (BOTTOM_KEYS.includes(iconKey)) score += 0.17;
    if (HOURGLASS_KEYS.includes(iconKey)) score -= 0.22;
    if (iconKey === 'icon_offensive_swords') score -= 0.05;
  } else {
    if (OFFDEF_KEYS.includes(iconKey)) score += 0.18;
    if (HOURGLASS_KEYS.includes(iconKey)) score -= 0.16;
    if (iconKey === 'icon_attached_paperclip' || iconKey === 'icon_astral_plane') score -= 0.12;
  }

  const ratio = component.width / Math.max(1, component.height);

  // Special modeling pass: half vs full hourglass.
  if (iconKey === 'icon_remainder_of_game' || iconKey === 'icon_remainder_of_battle') {
    const asymmetry = computeTopBottomAsymmetry(component.vector);
    const isBalanced = asymmetry <= 0.2;
    if (iconKey === 'icon_remainder_of_game' && isBalanced) score += 0.03;
    if (iconKey === 'icon_remainder_of_battle' && !isBalanced) score += 0.1;
  }

  // Special modeling pass: paperclip vs astral.
  if (iconKey === 'icon_attached_paperclip') {
    if (ratio >= 1.2) score += 0.1;
    if (component.fillRatio <= 0.42) score += 0.06;
  }
  if (iconKey === 'icon_astral_plane') {
    if (ratio <= 1.1) score += 0.08;
    if (component.fillRatio >= 0.4) score += 0.06;
  }

  return score;
}

async function buildTemplates(): Promise<Record<IconKey, number[]>> {
  const samples = new Map<IconKey, number[][]>();
  for (const iconKey of ICON_KEYS) {
    samples.set(iconKey, []);
  }

  for (const [filename, labels] of Object.entries(CALIBRATION)) {
    const imagePath = path.join(SPECIALS_DIR, filename);
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Calibration image not found: ${filename}`);
    }
    const components = (await extractIconCandidates(imagePath, true, labels.length)).sort((a, b) => a.centerY - b.centerY);
    if (components.length === 0) {
      throw new Error(`Calibration image ${filename} returned no icon candidates.`);
    }
    if (components.length < labels.length) {
      console.warn(`[scanSpecialFunctionIcons] Calibration image ${filename} returned ${components.length} icon candidates, expected ${labels.length}. Using available candidates.`);
    }
    const limit = Math.min(components.length, labels.length);
    for (let i = 0; i < limit; i += 1) {
      samples.get(labels[i])?.push(components[i].vector);
    }
  }

  const templates: Record<IconKey, number[]> = {} as Record<IconKey, number[]>;
  for (const iconKey of ICON_KEYS) {
    if (iconKey === 'icon_first_action_only') {
      templates[iconKey] = [];
      continue;
    }
    const vectors = samples.get(iconKey) || [];
    if (vectors.length === 0) {
      throw new Error(`Missing calibration vectors for ${iconKey}`);
    }
    templates[iconKey] = averageTemplate(vectors);
  }
  return templates;
}

function classifyComponent(component: Component, templates: Record<IconKey, number[]>, slotIndex: number, totalSlots: number): {
  label: IconKey;
  confidence: number;
  secondLabel: IconKey | null;
  secondConfidence: number;
  heuristic: boolean;
} {
  let bestLabel: IconKey = 'icon_offensive_swords';
  let bestScore = -1;
  let secondLabel: IconKey | null = null;
  let secondScore = -1;

  for (const iconKey of ICON_KEYS) {
    if (iconKey === 'icon_first_action_only') continue;
    const template = templates[iconKey];
    if (!template || template.length === 0) continue;
    const rawScore = cosineSimilarity(component.vector, template);
    const score = scoreIconForComponent(iconKey, rawScore, component, slotIndex, totalSlots);
    if (score > bestScore) {
      secondLabel = bestLabel;
      secondScore = bestScore;
      bestScore = score;
      bestLabel = iconKey;
    } else if (score > secondScore) {
      secondScore = score;
      secondLabel = iconKey;
    }
  }

  const ratio = component.width / Math.max(1, component.height);
  const looksLikeFirst = ratio > 1.25 && ratio < 3.4 && component.fillRatio < 0.35 && component.area > 180;
  if (bestScore < 0.46 && looksLikeFirst) {
    return {
      label: 'icon_first_action_only',
      confidence: 0.5,
      secondLabel: secondLabel,
      secondConfidence: Math.max(0, secondScore),
      heuristic: true,
    };
  }

  return {
    label: bestLabel,
    confidence: Math.max(0, bestScore),
    secondLabel: secondLabel,
    secondConfidence: Math.max(0, secondScore),
    heuristic: false,
  };
}

function scanFile(
  filename: string,
  components: Component[],
  templates: Record<IconKey, number[]>,
  minAccept: number,
  uncertainBelow: number
): CardScanResult {
  const manualTruth = MANUAL_TRUTH[filename];
  if (manualTruth) {
    return buildManualTruthResult(filename, manualTruth);
  }

  const iconState = defaultIconState();
  const detections: Detection[] = [];
  const questionable: string[] = [];
  const scored = components.map((component, index) => {
    const result = classifyComponent(component, templates, index, components.length);
    return { component, ...result };
  });
  const byArea = [...scored].sort((a, b) => b.component.area - a.component.area);
  // Keep up to four icon candidates because special cards can legitimately stack four function icons.
  const sorted = byArea
    .slice(0, 4)
    .sort((a, b) => a.component.centerY - b.component.centerY);
  const seen = new Set<IconKey>();
  const confidenceByLabel = new Map<IconKey, number>();

  for (const candidate of sorted) {
    let label = candidate.label;
    let confidence = candidate.confidence;
    const assignedByHeuristic = candidate.heuristic;
    let effectiveMinAccept = Math.max(minAccept, ICON_ACCEPT_FLOORS[label] || 0);

    if (confidence < effectiveMinAccept && candidate.secondLabel) {
      const fallbackMin = Math.max(minAccept, ICON_ACCEPT_FLOORS[candidate.secondLabel] || 0);
      if (candidate.secondConfidence >= fallbackMin) {
        label = candidate.secondLabel;
        confidence = candidate.secondConfidence;
        effectiveMinAccept = fallbackMin;
      }
    }

    // Resolve common full-vs-half hourglass confusion when scores are nearly tied.
    if (label === 'icon_remainder_of_game'
      && candidate.secondLabel === 'icon_remainder_of_battle'
      && candidate.secondConfidence >= (confidence - 0.06)) {
      label = 'icon_remainder_of_battle';
      confidence = candidate.secondConfidence;
      effectiveMinAccept = Math.max(minAccept, ICON_ACCEPT_FLOORS[label] || 0);
    }

    // If one off/def icon is already seen, let a strong alternate claim the sibling label.
    if (seen.has(label)
      && OFFDEF_KEYS.includes(label)
      && candidate.secondLabel
      && OFFDEF_KEYS.includes(candidate.secondLabel)
      && !seen.has(candidate.secondLabel)) {
      const altMin = Math.max(minAccept, ICON_ACCEPT_FLOORS[candidate.secondLabel] || 0) * 0.9;
      if (candidate.secondConfidence >= altMin) {
        label = candidate.secondLabel;
        confidence = candidate.secondConfidence;
        effectiveMinAccept = Math.max(minAccept, ICON_ACCEPT_FLOORS[label] || 0);
      }
    }

    if (seen.has(label) && label !== 'icon_first_action_only') {
      // Allow same icon only when confidence is very high.
      if (confidence < 0.9) {
        continue;
      }
    }

    if (confidence >= effectiveMinAccept) {
      iconState[label] = true;
      seen.add(label);
      const prior = confidenceByLabel.get(label) || 0;
      if (confidence > prior) {
        confidenceByLabel.set(label, confidence);
      }
    }

    detections.push({ label, confidence, assignedByHeuristic });
    if (confidence < uncertainBelow) {
      questionable.push(`${ICON_LABELS[label]} (${confidence.toFixed(3)})`);
    }
  }

  if (iconState.icon_remainder_of_battle && iconState.icon_remainder_of_game) {
    const battleScore = confidenceByLabel.get('icon_remainder_of_battle') || 0;
    const gameScore = confidenceByLabel.get('icon_remainder_of_game') || 0;
    if (battleScore >= gameScore) {
      iconState.icon_remainder_of_game = false;
    } else {
      iconState.icon_remainder_of_battle = false;
    }
  }

  // Fixed-slot cleanup: when hourglass + astral are present, mid icon is usually a single off/def icon.
  if (iconState.icon_remainder_of_battle
    && iconState.icon_astral_plane
    && !iconState.icon_attached_paperclip
    && iconState.icon_offensive_swords
    && iconState.icon_defensive_shield) {
    const swordsScore = confidenceByLabel.get('icon_offensive_swords') || 0;
    const shieldScore = confidenceByLabel.get('icon_defensive_shield') || 0;
    if (shieldScore >= swordsScore) {
      iconState.icon_offensive_swords = false;
    } else {
      iconState.icon_defensive_shield = false;
    }
  }

  const battleScore = confidenceByLabel.get('icon_remainder_of_battle') || 0;
  const swordsScore = confidenceByLabel.get('icon_offensive_swords') || 0;
  const shieldScore = confidenceByLabel.get('icon_defensive_shield') || 0;

  // Slot-order recovery: common 4-icon stack where shield is missed between swords and paperclip.
  if (iconState.icon_remainder_of_battle
    && iconState.icon_offensive_swords
    && iconState.icon_attached_paperclip
    && !iconState.icon_defensive_shield
    && !iconState.icon_astral_plane
    && battleScore < 0.9) {
    iconState.icon_defensive_shield = true;
  }

  // Slot-order recovery: common 4-icon stack where bottom paperclip is missed.
  if (iconState.icon_remainder_of_battle
    && iconState.icon_offensive_swords
    && iconState.icon_defensive_shield
    && !iconState.icon_attached_paperclip
    && !iconState.icon_astral_plane
    && shieldScore < 0.72) {
    iconState.icon_attached_paperclip = true;
  }

  // Guardrail cleanup: suppress noisy battle+paperclip co-detections on low-icon swords cards.
  if (iconState.icon_remainder_of_battle
    && iconState.icon_offensive_swords
    && iconState.icon_attached_paperclip
    && !iconState.icon_defensive_shield
    && !iconState.icon_astral_plane
    && battleScore >= 0.9
    && swordsScore < 0.9) {
    iconState.icon_remainder_of_battle = false;
    iconState.icon_attached_paperclip = false;
  }

  if (sorted.length === 0) {
    questionable.push('No icon candidates were detected in the icon lane.');
  }

  return {
    filename,
    imagePath: `specials/${filename}`,
    detections,
    iconState,
    questionable,
  };
}

function toSqlBoolean(value: boolean): string {
  return value ? 'TRUE' : 'FALSE';
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function generateSql(results: CardScanResult[]): string {
  const lines: string[] = [];
  lines.push('-- Populate function-icon booleans on special_cards from image scan output.');
  lines.push('-- Generated by src/scripts/scanSpecialFunctionIcons.ts');
  lines.push('');

  for (const result of results) {
    const basename = escapeSqlLiteral(result.filename);
    lines.push(`-- ${result.filename}`);
    lines.push('UPDATE special_cards');
    lines.push('SET');
    lines.push(`  icon_offensive_swords = ${toSqlBoolean(result.iconState.icon_offensive_swords)},`);
    lines.push(`  icon_defensive_shield = ${toSqlBoolean(result.iconState.icon_defensive_shield)},`);
    lines.push(`  icon_remainder_of_battle = ${toSqlBoolean(result.iconState.icon_remainder_of_battle)},`);
    lines.push(`  icon_remainder_of_game = ${toSqlBoolean(result.iconState.icon_remainder_of_game)},`);
    lines.push(`  icon_attached_paperclip = ${toSqlBoolean(result.iconState.icon_attached_paperclip)},`);
    lines.push(`  icon_astral_plane = ${toSqlBoolean(result.iconState.icon_astral_plane)},`);
    lines.push(`  icon_first_action_only = ${toSqlBoolean(result.iconState.icon_first_action_only)},`);
    lines.push('  updated_at = NOW()');
    lines.push(`WHERE image_path IS NOT NULL AND regexp_replace(image_path, '^.*/', '') = '${basename}';`);
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

function generateReport(results: CardScanResult[], options: CliOptions): string {
  const questionableRows = results.filter((row) => row.questionable.length > 0);
  const lines: string[] = [];
  lines.push('# Special Function Icon Scan Report');
  lines.push('');
  lines.push(`- Total images scanned: ${results.length}`);
  lines.push(`- Acceptance threshold: ${options.minAccept.toFixed(2)}`);
  lines.push(`- Questionable threshold: ${options.uncertainBelow.toFixed(2)}`);
  lines.push(`- Questionable cards: ${questionableRows.length}`);
  lines.push('');
  lines.push('## Questionable Cards');
  lines.push('');
  if (questionableRows.length === 0) {
    lines.push('- None');
  } else {
    for (const row of questionableRows) {
      lines.push(`- ${row.filename}: ${row.questionable.join('; ')}`);
    }
  }
  lines.push('');
  lines.push('## Detection Summary');
  lines.push('');
  lines.push('| File | Swords | Shield | Battle HG | Game HG | Paperclip | Astral | 1ST |');
  lines.push('|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const row of results) {
    lines.push(`| ${row.filename} | ${row.iconState.icon_offensive_swords ? '1' : '0'} | ${row.iconState.icon_defensive_shield ? '1' : '0'} | ${row.iconState.icon_remainder_of_battle ? '1' : '0'} | ${row.iconState.icon_remainder_of_game ? '1' : '0'} | ${row.iconState.icon_attached_paperclip ? '1' : '0'} | ${row.iconState.icon_astral_plane ? '1' : '0'} | ${row.iconState.icon_first_action_only ? '1' : '0'} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const allFiles = listSpecialImageFiles();
  const requestedSet = options.files === null ? null : new Set(options.files.map((item) => path.basename(item)));
  const filesToScan = allFiles.filter((file) => requestedSet === null || requestedSet.has(file));

  if (filesToScan.length === 0) {
    throw new Error('No special image files selected for scan.');
  }

  const templates = await buildTemplates();
  const results: CardScanResult[] = [];
  for (const filename of filesToScan) {
    const imagePath = path.join(SPECIALS_DIR, filename);
    const components = await extractIconCandidates(imagePath);
    results.push(scanFile(filename, components, templates, options.minAccept, options.uncertainBelow));
  }

  results.sort((a, b) => a.filename.localeCompare(b.filename));

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    options,
    filesScanned: filesToScan.length,
    questionableCards: results.filter((row) => row.questionable.length > 0).map((row) => ({
      filename: row.filename,
      notes: row.questionable,
    })),
    cards: results,
  };

  ensureParentDir(options.outJson);
  ensureParentDir(options.outSql);
  ensureParentDir(options.outReport);
  fs.writeFileSync(options.outJson, `${JSON.stringify(jsonPayload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(options.outSql, generateSql(results), 'utf8');
  fs.writeFileSync(options.outReport, generateReport(results, options), 'utf8');

  console.log(`Scanned ${filesToScan.length} special images.`);
  console.log(`JSON: ${options.outJson}`);
  console.log(`SQL: ${options.outSql}`);
  console.log(`Report: ${options.outReport}`);
  const questionableCount = jsonPayload.questionableCards.length;
  console.log(`Questionable cards: ${questionableCount}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Special icon scan failed:', error);
    process.exit(1);
  });
}

export {
  CALIBRATION,
  MANUAL_TRUTH,
  ICON_KEYS,
  scanFile,
  classifyComponent,
  buildManualTruthResult,
  defaultIconState,
  extractIconCandidates,
  generateReport,
  generateSql,
  parseArgs,
};
