/**
 * Generate three card-faithful energy icon candidates for StatIconBadge readability.
 * Crossing orbital ellipses + glowing electrons + solid center hub (masks nucleus).
 * Output: src/resources/images/icons/candidates/energy-v1.png … v3.png
 * Run: npm run generate:energy-icons
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SIZE = 128;
const CX = 64;
const CY = 64;
const ORBIT_RX = 45;
const ORBIT_RY = 20;
const HUB_R = 18;

const ORBIT_STROKE = '#FFE500';
const ORBIT_GLOW = '#FFF59D';
const HUB_FILL = '#F5D000';
const HUB_EDGE = '#E8B800';

const OUTPUT_DIR = path.join(process.cwd(), 'src/resources/images/icons/candidates');

const ORBIT_ANGLES = [0, 60, 120];

function orbitEllipses(strokeWidth: number, stroke: string): string {
  return ORBIT_ANGLES.map(
    (deg) =>
      `<ellipse cx="${CX}" cy="${CY}" rx="${ORBIT_RX}" ry="${ORBIT_RY}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" transform="rotate(${deg} ${CX} ${CY})"/>`,
  ).join('\n    ');
}

/** Parametric point on a rotated ellipse (t = 0 is rightmost). */
function ellipsePoint(deg: number, t: number): { x: number; y: number } {
  const rot = (deg * Math.PI) / 180;
  const cosT = Math.cos(t);
  const sinT = Math.sin(t);
  const x = ORBIT_RX * cosT;
  const y = ORBIT_RY * sinT;
  return {
    x: CX + x * Math.cos(rot) - y * Math.sin(rot),
    y: CY + x * Math.sin(rot) + y * Math.cos(rot),
  };
}

/** Card-like electron nodes — tuned to match printed card layout. */
function cardElectronPoints(): { x: number; y: number }[] {
  return [
    { x: CX, y: CY - ORBIT_RY - 1 },
    { x: 88, y: 84 },
    { x: 38, y: 72 },
  ];
}

function cardElectronPointsFour(): { x: number; y: number }[] {
  return [...cardElectronPoints(), { x: 76, y: 96 }];
}

function electronDot(x: number, y: number, r: number, filterId: string): string {
  return `
    <g filter="url(#${filterId})">
      <circle cx="${x}" cy="${y}" r="${r + 3}" fill="${ORBIT_GLOW}" opacity="0.65"/>
      <circle cx="${x}" cy="${y}" r="${r + 1}" fill="#FFFDE7" opacity="0.9"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#electronGrad)"/>
      <circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#FFFFFF"/>
    </g>`;
}

function electrons(points: { x: number; y: number }[], dotR: number, filterId: string): string {
  return points.map((p) => electronDot(p.x, p.y, dotR, filterId)).join('\n    ');
}

function hexHub(r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 90) * Math.PI) / 180;
    return `${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`;
  }).join(' ');
  return `
    <polygon points="${pts}" fill="${HUB_FILL}" stroke="${HUB_EDGE}" stroke-width="1" stroke-linejoin="round"/>
    <polygon points="${pts}" fill="url(#hubGrad)" opacity="0.35"/>
  `;
}

function circleHub(r: number): string {
  return `
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="${HUB_FILL}"/>
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="url(#hubGrad)"/>
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${HUB_EDGE}" stroke-width="1" opacity="0.5"/>
  `;
}

function defs(glowBlur: number, electronBlur: number): string {
  return `
  <defs>
    <filter id="orbitGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${glowBlur}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="electronGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${electronBlur}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="electronGrad" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#FFF9C4"/>
      <stop offset="100%" stop-color="#FFE500"/>
    </radialGradient>
    <radialGradient id="hubGrad" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#FFEB3B"/>
      <stop offset="70%" stop-color="${HUB_FILL}"/>
      <stop offset="100%" stop-color="${HUB_EDGE}"/>
    </radialGradient>
  </defs>`;
}

function wrap(body: string, glowBlur: number, electronBlur: number): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  ${defs(glowBlur, electronBlur)}
  ${body}
</svg>`.trim();
}

/** v1 — card match: crossing orbits, round hub, 3 glowing electrons on outer arcs */
function svgV1(): string {
  const body = `
  <g opacity="0.7" filter="url(#orbitGlow)">
    ${orbitEllipses(3.6, ORBIT_GLOW)}
  </g>
  <g filter="url(#orbitGlow)">
    ${orbitEllipses(2.2, ORBIT_STROKE)}
  </g>
  ${circleHub(HUB_R)}
  ${electrons(cardElectronPoints(), 5, 'electronGlow')}
  `;
  return wrap(body, 2.2, 1.8);
}

/** v2 — card match: hex hub + 4 electrons (closest to printed card art) */
function svgV2(): string {
  const body = `
  <g opacity="0.75" filter="url(#orbitGlow)">
    ${orbitEllipses(4, ORBIT_GLOW)}
  </g>
  <g filter="url(#orbitGlow)">
    ${orbitEllipses(2.6, ORBIT_STROKE)}
  </g>
  ${hexHub(HUB_R)}
  ${electrons(cardElectronPointsFour(), 5.2, 'electronGlow')}
  `;
  return wrap(body, 2.5, 2);
}

/** v3 — card match: stronger bloom, round hub, 3 electrons */
function svgV3(): string {
  const body = `
  <g opacity="0.85" filter="url(#orbitGlow)">
    ${orbitEllipses(4.5, ORBIT_GLOW)}
  </g>
  <g filter="url(#orbitGlow)">
    ${orbitEllipses(2.4, ORBIT_STROKE)}
  </g>
  ${circleHub(HUB_R + 1)}
  ${electrons(cardElectronPoints(), 5.5, 'electronGlow')}
  `;
  return wrap(body, 3.2, 2.4);
}

const VARIANTS: { id: string; svg: string; label: string }[] = [
  { id: 'energy-v1', svg: svgV1(), label: 'v1 — Card atom (round hub, 3 electrons)' },
  { id: 'energy-v2', svg: svgV2(), label: 'v2 — Card atom (hex hub, 4 electrons)' },
  { id: 'energy-v3', svg: svgV3(), label: 'v3 — Card atom (strong glow, 3 electrons)' },
];

const MAX_BYTES = 60 * 1024;

async function writeVariant(id: string, svg: string): Promise<void> {
  const outPath = path.join(OUTPUT_DIR, `${id}.png`);
  const png = await sharp(Buffer.from(svg)).resize(SIZE, SIZE).png().toBuffer();
  fs.writeFileSync(outPath, png);

  const meta = await sharp(png).metadata();
  const stat = fs.statSync(outPath);
  console.log(`  ${id}.png — ${meta.width}x${meta.height}, ${stat.size} bytes`);
  if (stat.size > MAX_BYTES) {
    throw new Error(`${id}.png exceeds ${MAX_BYTES} byte budget (${stat.size})`);
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Generating energy icon candidates in:', OUTPUT_DIR);
  for (const v of VARIANTS) {
    console.log(v.label);
    await writeVariant(v.id, v.svg);
  }
  console.log('\nOpen scripts/preview-energy-icon-variants.html to compare.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
