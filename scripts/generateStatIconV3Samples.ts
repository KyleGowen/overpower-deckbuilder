/**
 * Generate v3 card-glow style samples for all StatIconBadge icon types.
 * Output: src/resources/images/icons/candidates/v3-style/*.png
 * Run: npm run generate:stat-icons-v3
 */
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const SIZE = 128;
const CX = 64;
const CY = 64;
const MAX_BYTES = 60 * 1024;
const OUTPUT_DIR = path.join(process.cwd(), 'src/resources/images/icons/candidates/v3-style');

const GLOW_MAIN = 3.2;
const GLOW_ACCENT = 2.4;

interface IconPalette {
  stroke: string;
  glow: string;
  fill: string;
  edge: string;
  highlight: string;
}

function wrapSvg(body: string, extraDefs = ''): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <defs>
    <filter id="mainGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${GLOW_MAIN}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="accentGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${GLOW_ACCENT}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    ${extraDefs}
  </defs>
  ${body}
</svg>`.trim();
}

function hubGrad(id: string, palette: IconPalette): string {
  return `
    <radialGradient id="${id}" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="${palette.highlight}"/>
      <stop offset="70%" stop-color="${palette.fill}"/>
      <stop offset="100%" stop-color="${palette.edge}"/>
    </radialGradient>`;
}

function solidHub(r: number, palette: IconPalette, gradId: string): string {
  return `
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="${palette.fill}"/>
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="url(#${gradId})"/>
    <circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${palette.edge}" stroke-width="1" opacity="0.5"/>`;
}

function accentDot(x: number, y: number, r: number, palette: IconPalette): string {
  return `
    <g filter="url(#accentGlow)">
      <circle cx="${x}" cy="${y}" r="${r + 3}" fill="${palette.glow}" opacity="0.65"/>
      <circle cx="${x}" cy="${y}" r="${r + 1}" fill="${palette.highlight}" opacity="0.9"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${palette.stroke}"/>
      <circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#FFFFFF"/>
    </g>`;
}

function gearPath(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i * Math.PI) / teeth - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function svgEnergyV3(): string {
  const palette: IconPalette = {
    stroke: '#FFE500',
    glow: '#FFF59D',
    fill: '#F5D000',
    edge: '#E8B800',
    highlight: '#FFEB3B',
  };
  const orbitAngles = [0, 60, 120];
  const orbitRx = 45;
  const orbitRy = 20;
  const hubR = 19;

  function orbitsAt(sw: number, stroke: string): string {
    return orbitAngles
      .map(
        (deg) =>
          `<ellipse cx="${CX}" cy="${CY}" rx="${orbitRx}" ry="${orbitRy}" fill="none" stroke="${stroke}" stroke-width="${sw}" transform="rotate(${deg} ${CX} ${CY})"/>`,
      )
      .join('\n    ');
  }

  const electrons = [
    { x: CX, y: CY - orbitRy - 1 },
    { x: 88, y: 84 },
    { x: 38, y: 72 },
  ]
    .map((p) => accentDot(p.x, p.y, 5.5, palette))
    .join('\n    ');

  const body = `
  <g opacity="0.85" filter="url(#mainGlow)">${orbitsAt(4.5, palette.glow)}</g>
  <g filter="url(#mainGlow)">${orbitsAt(2.4, palette.stroke)}</g>
  ${solidHub(hubR, palette, 'hubGrad')}
  ${electrons}`;

  return wrapSvg(body, hubGrad('hubGrad', palette));
}

function svgCombatV3(): string {
  const palette: IconPalette = {
    stroke: '#FF8533',
    glow: '#FFCC80',
    fill: '#FF6D2E',
    edge: '#E65100',
    highlight: '#FFAB40',
  };

  const shield = 'M 64 18 L 94 38 L 88 78 L 64 96 L 40 78 L 34 38 Z';
  const sword = (x1: number, y1: number, x2: number, y2: number): string => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const px = (-dy / len) * 6;
    const py = (dx / len) * 6;
    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette.edge}" stroke-width="7" stroke-linecap="round" opacity="0.55"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${palette.stroke}" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="${mx - px}" y1="${my - py}" x2="${mx + px}" y2="${my + py}" stroke="${palette.stroke}" stroke-width="5" stroke-linecap="round"/>`;
  };

  const body = `
  <g filter="url(#mainGlow)" opacity="0.85">
    ${sword(28, 98, 100, 26)}
    ${sword(100, 98, 28, 26)}
  </g>
  <g filter="url(#mainGlow)" opacity="0.8">
    <path d="${shield}" fill="${palette.glow}" stroke="none"/>
  </g>
  <path d="${shield}" fill="${palette.fill}" stroke="${palette.edge}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${shield}" fill="url(#hubGrad)" opacity="0.45"/>
  ${solidHub(17, palette, 'hubGrad')}
  ${accentDot(64, 30, 4, palette)}
  ${accentDot(48, 82, 3.5, palette)}
  ${accentDot(80, 82, 3.5, palette)}`;

  return wrapSvg(body, hubGrad('hubGrad', palette));
}

function svgBruteForceV3(): string {
  const palette: IconPalette = {
    stroke: '#66BB6A',
    glow: '#C8E6C9',
    fill: '#43A047',
    edge: '#2E7D32',
    highlight: '#A5D6A7',
  };

  const outer = '64,22 92,36 102,64 92,92 64,106 36,92 26,64 36,36';
  const mid = '64,34 82,44 88,64 82,84 64,94 46,84 40,64 46,44';
  const inner = '64,42 74,48 78,64 74,80 64,86 54,80 50,64 54,48';

  const body = `
  <g filter="url(#mainGlow)" opacity="0.85">
    <polygon points="${outer}" fill="${palette.glow}" opacity="0.55"/>
  </g>
  <polygon points="${outer}" fill="${palette.edge}" stroke="${palette.edge}" stroke-width="1.5" stroke-linejoin="round"/>
  <polygon points="${mid}" fill="${palette.fill}" stroke="${palette.edge}" stroke-width="1" stroke-linejoin="round"/>
  <polygon points="${inner}" fill="url(#hubGrad)" stroke="${palette.highlight}" stroke-width="1" stroke-linejoin="round"/>
  ${solidHub(16, palette, 'hubGrad')}
  ${accentDot(64, 24, 4, palette)}
  ${accentDot(96, 64, 3.8, palette)}
  ${accentDot(32, 64, 3.8, palette)}`;

  return wrapSvg(body, hubGrad('hubGrad', palette));
}

function svgIntelligenceV3(): string {
  const palette: IconPalette = {
    stroke: '#42A5F5',
    glow: '#BBDEFB',
    fill: '#1E88E5',
    edge: '#1565C0',
    highlight: '#64B5F6',
  };

  const body = `
  <g transform="rotate(-14 ${CX} ${CY})" filter="url(#mainGlow)">
    <rect x="40" y="34" width="50" height="66" rx="5" fill="${palette.edge}" opacity="0.7"/>
    <rect x="44" y="38" width="46" height="62" rx="3" fill="#ECEFF1"/>
    <rect x="34" y="30" width="52" height="66" rx="6" fill="${palette.glow}" opacity="0.55"/>
    <rect x="34" y="30" width="52" height="66" rx="6" fill="${palette.fill}" stroke="${palette.edge}" stroke-width="2"/>
    <rect x="34" y="30" width="52" height="66" rx="6" fill="url(#hubGrad)" opacity="0.4"/>
  </g>
  <g transform="rotate(-14 ${CX} ${CY})">
    ${solidHub(16, palette, 'hubGrad')}
  </g>
  ${accentDot(92, 44, 3.5, palette)}
  ${accentDot(36, 96, 3.5, palette)}`;

  return wrapSvg(body, hubGrad('hubGrad', palette));
}

function svgThreatV3(): string {
  const palette: IconPalette = {
    stroke: '#CFD8DC',
    glow: '#ECEFF1',
    fill: '#90A4AE',
    edge: '#607D8B',
    highlight: '#ECEFF1',
  };

  const gear = gearPath(CX, CY, 44, 33, 10);
  const body = `
  <g filter="url(#mainGlow)" opacity="0.85">
    <path d="${gear}" fill="${palette.glow}" opacity="0.6"/>
  </g>
  <path d="${gear}" fill="${palette.fill}" stroke="${palette.edge}" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="${gear}" fill="url(#hubGrad)" opacity="0.35"/>
  ${solidHub(20, palette, 'hubGrad')}
  ${accentDot(64, 18, 4, palette)}
  ${accentDot(98, 64, 3.5, palette)}
  ${accentDot(30, 64, 3.5, palette)}`;

  return wrapSvg(body, hubGrad('hubGrad', palette));
}

const ICONS: { id: string; label: string; svg: string }[] = [
  { id: 'energy', label: 'Energy', svg: svgEnergyV3() },
  { id: 'combat', label: 'Combat', svg: svgCombatV3() },
  { id: 'brute_force', label: 'Brute Force', svg: svgBruteForceV3() },
  { id: 'intelligence', label: 'Intelligence', svg: svgIntelligenceV3() },
  { id: 'threat', label: 'Threat', svg: svgThreatV3() },
];

async function writeIcon(id: string, svg: string): Promise<void> {
  const outPath = path.join(OUTPUT_DIR, `${id}-v3.png`);
  const png = await sharp(Buffer.from(svg)).resize(SIZE, SIZE).png().toBuffer();
  fs.writeFileSync(outPath, png);

  const meta = await sharp(png).metadata();
  const stat = fs.statSync(outPath);
  console.log(`  ${id}-v3.png — ${meta.width}x${meta.height}, ${stat.size} bytes`);
  if (stat.size > MAX_BYTES) {
    throw new Error(`${id}-v3.png exceeds ${MAX_BYTES} byte budget (${stat.size})`);
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Generating v3-style stat icon samples in:', OUTPUT_DIR);
  for (const icon of ICONS) {
    console.log(icon.label);
    await writeIcon(icon.id, icon.svg);
  }
  console.log('\nOpen scripts/preview-stat-icon-v3-sheet.html to compare all types.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
