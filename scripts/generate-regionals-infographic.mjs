/**
 * Generates a self-contained OverPower Regionals meta infographic HTML file
 * from the regional character lists Excel workbook on the Desktop.
 *
 * Usage: node scripts/generate-regionals-infographic.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XLSX_PATH = 'C:\\Users\\Kyle\\Desktop\\OverPower Regionals Character Lists.xlsx';
const OUTPUT_PATH = 'C:\\Users\\Kyle\\Desktop\\overpower-regionals-meta.html';

/** @type {Record<string, string>} */
const NORMALIZE = {
  'morgan le fay': 'Morgan le Fay',
  'morgan la fey': 'Morgan le Fay',
  'billy the kid': 'Billy the Kid',
  'zeus': 'Zeus',
  'zues': 'Zeus',
  'asclepieion': 'Asclepieion',
  'asclepion': 'Asclepieion',
  'asclepieon': 'Asclepieion',
  '221-b baker st.': '221-B Baker St',
  '221-b baker st': '221-B Baker St',
  'round table': 'The Round Table',
  'the round table': 'The Round Table',
  'sherlock': 'Sherlock Holmes',
  'sherlock holmes': 'Sherlock Holmes',
  'the land time forgot': 'The Land that Time Forgot',
  'land that time forgot': 'The Land that Time Forgot',
  'the land that time forgot': 'The Land that Time Forgot',
  'dejah thorus': 'Dejah Thoris',
  'dejah thoris': 'Dejah Thoris',
  'three muskateers': 'The Three Musketeers',
  'the three musketeers': 'The Three Musketeers',
  'count of monte cristo': 'The Count of Monte Cristo',
  'the count of monte cristo': 'The Count of Monte Cristo',
  'spartan training ground': 'Spartan Training Ground',
  'warlord of mars': 'Warlord of Mars',
  'fairy protection': 'Fairy Protection',
  'the call of cthulhu': 'The Call of Cthulhu',
  'wicked witch': 'Wicked Witch',
  'dr. watson': 'Dr. Watson',
  'jane porter': 'Jane Porter',
  'joan of arc': 'Joan of Arc',
  'leonidas': 'Leonidas',
  'sun wukong': 'Sun Wukong',
  'zorro': 'Zorro',
  'mina harker': 'Mina Harker',
  'robin hood': 'Robin Hood',
  'the mummy': 'The Mummy',
  'king arthur': 'King Arthur',
  'captain nemo': 'Captain Nemo',
  'professor moriarty': 'Professor Moriarty',
  'headless horseman': 'Headless Horseman',
  'sheriff of nottingham': 'Sheriff of Nottingham',
  "dracula's armory": "Dracula's Armory",
};

/**
 * @param {string} raw
 * @returns {string}
 */
function normalizeName(raw) {
  const trimmed = (raw ?? '').toString().trim();
  if (!trimmed || trimmed === 'N/A') return '';
  const key = trimmed.toLowerCase();
  return NORMALIZE[key] ?? trimmed;
}

/**
 * @param {string[]} items
 * @returns {[string, number][]}
 */
function countFreq(items) {
  /** @type {Record<string, number>} */
  const m = {};
  for (const x of items) {
    const k = normalizeName(x);
    if (!k) continue;
    m[k] = (m[k] ?? 0) + 1;
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

/**
 * @param {string} placement
 * @returns {string}
 */
function extractPlayerName(placement) {
  return (placement ?? '')
    .toString()
    .replace(/^\d+(?:st|nd|rd|th)\s*-\s*/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim();
}

/**
 * @param {string} placement
 * @returns {number | null}
 */
function extractPlace(placement) {
  const m = (placement ?? '').toString().match(/^(\d+)/);
  return m ? Number(m[1]) : null;
}

/**
 * @returns {object}
 */
function parseWorkbook() {
  const wb = XLSX.readFile(XLSX_PATH);
  const chars = [];
  const homebases = [];
  const cataclysms = [];
  const cardCounts = [];
  const slotChars = [[], [], [], []];
  /** @type {Record<string, number>} */
  const podiumByPlayer = {};
  /** @type {Record<string, { name: string, count: number }>} */
  const eventTopChar = {};
  let deckListCount = 0;

  for (const sheetName of wb.SheetNames) {
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
    /** @type {Record<string, number>} */
    const eventFreq = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      deckListCount += 1;

      let fl;
      let hb;
      let cat;
      let place;
      let player;

      if (sheetName.startsWith('S1')) {
        place = row[0];
        player = row[1];
        fl = [row[2], row[3], row[4], row[5]];
        hb = row[6];
        cat = row[9];
        const cc = row[10];
        if (cc !== '' && cc != null && !Number.isNaN(Number(cc))) {
          cardCounts.push(Number(cc));
        }
        if (place <= 3 && player) {
          podiumByPlayer[player] = (podiumByPlayer[player] ?? 0) + 1;
        }
      } else {
        const placement = row[0];
        fl = [row[1], row[2], row[3], row[4]];
        hb = row[5];
        cat = row[6];
        const p = extractPlace(placement);
        const pname = extractPlayerName(placement);
        if (p != null && p <= 3 && pname) {
          podiumByPlayer[pname] = (podiumByPlayer[pname] ?? 0) + 1;
        }
      }

      fl.forEach((c, idx) => {
        const n = normalizeName(c);
        if (n) {
          chars.push(n);
          slotChars[idx].push(n);
          eventFreq[n] = (eventFreq[n] ?? 0) + 1;
        }
      });

      const hbN = normalizeName(hb);
      if (hbN) homebases.push(hbN);

      const catN = normalizeName(cat);
      if (catN) cataclysms.push(catN);
    }

    const top = Object.entries(eventFreq).sort((a, b) => b[1] - a[1])[0];
    const eventLabel = sheetName.replace(/^S[01]\s+/, '');
    if (top) {
      eventTopChar[eventLabel] = { name: top[0], count: top[1] };
    }
  }

  const sortedCardCounts = cardCounts.filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  const cardBuckets = [
    { label: '<52', count: 0 },
    { label: '52–54', count: 0 },
    { label: '55–57', count: 0 },
    { label: '58+', count: 0 },
  ];
  for (const n of sortedCardCounts) {
    if (n < 52) cardBuckets[0].count += 1;
    else if (n <= 54) cardBuckets[1].count += 1;
    else if (n <= 57) cardBuckets[2].count += 1;
    else cardBuckets[3].count += 1;
  }

  const avgCards =
    sortedCardCounts.length > 0
      ? Math.round((sortedCardCounts.reduce((a, b) => a + b, 0) / sortedCardCounts.length) * 10) / 10
      : 0;

  const podiumLeaders = Object.entries(podiumByPlayer)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    hero: {
      events: wb.SheetNames.length,
      deckLists: deckListCount,
      uniqueCharacters: new Set(chars).size,
      avgCards,
      cardCountSample: sortedCardCounts.length,
    },
    topCharacters: countFreq(chars).slice(0, 10).map(([name, count]) => ({ name, count })),
    homebases: countFreq(homebases).slice(0, 8).map(([name, count]) => ({ name, count })),
    cataclysms: countFreq(cataclysms).slice(0, 8).map(([name, count]) => ({ name, count })),
    podiumLeaders,
    cardBuckets,
    avgCards,
    slotDiversity: ['Front Line 1', 'Front Line 2', 'Front Line 3', 'Reserve'].map((label, idx) => ({
      label,
      unique: new Set(slotChars[idx]).size,
      total: slotChars[idx].length,
    })),
    eventSnapshots: Object.entries(eventTopChar).map(([event, { name, count }]) => ({
      event,
      character: name,
      count,
    })),
  };
}

/**
 * @param {object} data
 * @returns {string}
 */
function buildHtml(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#070b16" />
  <title>OverPower Regionals Meta</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --color-bg-base: #070b16;
      --color-bg-panel: #0f1928;
      --color-bg-elevated: #141f35;
      --color-accent: #00c8e8;
      --color-accent-bright: #00e5ff;
      --color-accent-soft: rgba(0, 200, 232, 0.14);
      --color-accent-glow: rgba(0, 229, 255, 0.35);
      --color-text: #e8edf7;
      --color-text-muted: #8aa0c2;
      --color-text-dim: #56678a;
      --color-border: #1d2c47;
      --color-border-accent: rgba(0, 200, 232, 0.45);
      --color-stat-energy: #f6a623;
      --color-stat-combat: #ef4d5a;
      --color-stat-brute-force: #4bd07b;
      --color-stat-intelligence: #3aa0ff;
      --color-stat-total: #b06bff;
      --color-success: #36d399;
      --radius-lg: 14px;
      --radius-md: 10px;
      --shadow-panel: 0 8px 30px rgba(0, 0, 0, 0.45);
      --font-sans: 'Inter', 'Segoe UI', system-ui, sans-serif;
      --font-stat: 'Poppins', Impact, 'Arial Black', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: var(--font-sans);
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--color-text);
      background: var(--color-bg-base);
      background-image: radial-gradient(1200px 900px at 60% 8%, rgba(0, 200, 232, 0.04), transparent 60%);
      min-height: 100vh;
    }

    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }

    .page-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-border);
    }

    .page-header h1 {
      margin: 0 0 8px;
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .page-header h1 span {
      color: var(--color-accent-bright);
    }

    .page-header .subtitle {
      margin: 0;
      color: var(--color-text-muted);
      font-size: 1rem;
      max-width: 52rem;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }

    @media (max-width: 800px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 420px) {
      .kpi-row { grid-template-columns: 1fr; }
      .page-header h1 { font-size: 1.75rem; }
    }

    .kpi {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px 18px;
      box-shadow: var(--shadow-panel);
      position: relative;
      overflow: hidden;
    }

    .kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--color-accent), var(--color-accent-dim, #1c7d92));
    }

    .kpi-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-dim);
      font-weight: 600;
      margin-bottom: 6px;
    }

    .kpi-value {
      font-family: var(--font-stat);
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1;
      color: var(--color-accent-bright);
    }

    .kpi-note {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 6px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }

    .panel {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-panel);
      padding: 22px 22px 18px;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .panel--wide { grid-column: 1 / -1; }

    .panel-head {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .panel-accent {
      width: 4px;
      min-height: 36px;
      border-radius: 2px;
      background: linear-gradient(180deg, var(--color-accent-bright), var(--color-accent));
      flex-shrink: 0;
    }

    .panel-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1.3;
    }

    .panel-desc {
      margin: 4px 0 0;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .chart-wrap {
      flex: 1;
      min-height: 0;
    }

    .chart-wrap svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }

    .event-row {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
    }

    @media (max-width: 1000px) {
      .event-row { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 520px) {
      .event-row { grid-template-columns: repeat(2, 1fr); }
    }

    .event-card {
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 14px 12px;
      text-align: center;
      transition: border-color 0.2s, transform 0.2s;
    }

    .event-card:hover {
      border-color: var(--color-border-accent);
      transform: translateY(-2px);
    }

    .event-card .ev-name {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-dim);
      font-weight: 600;
      margin-bottom: 8px;
    }

    .event-card .ev-char {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .event-card .ev-count {
      font-family: var(--font-stat);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-accent-bright);
    }

    .page-footer {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border);
      font-size: 0.8125rem;
      color: var(--color-text-dim);
      text-align: center;
    }

    @media (prefers-reduced-motion: reduce) {
      .bar-anim { animation: none !important; }
      .event-card { transition: none; }
    }

    @keyframes barGrow {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
    }

    .bar-anim {
      transform-origin: left center;
      animation: barGrow 0.7s ease-out forwards;
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="page-header">
      <h1>OverPower <span>Regionals Meta</span></h1>
      <p class="subtitle">Character, homebase, and cataclysm trends across Season 0 regional events and the Season 1 Columbus field — derived from tournament deck lists.</p>
    </header>

    <div class="kpi-row" id="kpi-row"></div>

    <div class="grid">
      <section class="panel" id="chart-characters">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Top 10 Characters</h2>
            <p class="panel-desc">Most-played characters across all lineup slots and events</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-characters"></div>
      </section>

      <section class="panel" id="chart-homebases">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Homebase Meta</h2>
            <p class="panel-desc">Share of homebase selections</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-homebases"></div>
      </section>

      <section class="panel" id="chart-cataclysms">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Cataclysm Breakdown</h2>
            <p class="panel-desc">Most common cataclysm card choices</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-cataclysms"></div>
      </section>

      <section class="panel" id="chart-podium">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Podium Leaders</h2>
            <p class="panel-desc">Players with multiple top-3 finishes</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-podium"></div>
      </section>

      <section class="panel" id="chart-decksize">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Deck Size Distribution</h2>
            <p class="panel-desc">Card counts from the S1 Columbus field</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-decksize"></div>
      </section>

      <section class="panel" id="chart-slots">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Lineup Slot Diversity</h2>
            <p class="panel-desc">Unique characters per lineup position — Reserve is the most concentrated</p>
          </div>
        </div>
        <div class="chart-wrap" id="svg-slots"></div>
      </section>

      <section class="panel panel--wide" id="chart-events">
        <div class="panel-head">
          <div class="panel-accent"></div>
          <div>
            <h2 class="panel-title">Regional Meta Snapshot</h2>
            <p class="panel-desc">Most-played character at each event</p>
          </div>
        </div>
        <div class="event-row" id="event-row"></div>
      </section>
    </div>

    <footer class="page-footer" id="footer"></footer>
  </div>

  <script>
    const DATA = ${json};
    const PALETTE = [
      '#00e5ff', '#f6a623', '#ef4d5a', '#4bd07b', '#3aa0ff',
      '#b06bff', '#36d399', '#00c8e8', '#e85d6a', '#9fb0cc',
    ];

    function esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function truncate(s, max) {
      return s.length > max ? s.slice(0, max - 1) + '…' : s;
    }

    function renderKpis() {
      const { hero } = DATA;
      const items = [
        { label: 'Events', value: hero.events, note: 'S0 regionals + S1 Columbus' },
        { label: 'Deck Lists', value: hero.deckLists, note: 'Tournament submissions' },
        { label: 'Unique Characters', value: hero.uniqueCharacters, note: 'Across all slots' },
        { label: 'Avg Cards', value: hero.avgCards, note: 'S1 field (n=' + hero.cardCountSample + ')' },
      ];
      document.getElementById('kpi-row').innerHTML = items.map((k) =>
        '<div class="kpi">' +
          '<div class="kpi-label">' + esc(k.label) + '</div>' +
          '<div class="kpi-value">' + esc(k.value) + '</div>' +
          '<div class="kpi-note">' + esc(k.note) + '</div>' +
        '</div>'
      ).join('');
    }

    function renderBarChart(containerId, items, opts = {}) {
      const el = document.getElementById(containerId);
      const max = Math.max(...items.map((d) => d.count), 1);
      const rowH = opts.rowH ?? 28;
      const labelW = opts.labelW ?? 130;
      const padL = labelW + 12;
      const padR = 44;
      const padT = 8;
      const padB = 8;
      const chartW = opts.chartW ?? 380;
      const barW = chartW - padL - padR;
      const h = padT + items.length * rowH + padB;

      let svg = '<svg viewBox="0 0 ' + chartW + ' ' + h + '" role="img" aria-label="' + esc(opts.title ?? 'Bar chart') + '">';

      items.forEach((d, i) => {
        const y = padT + i * rowH;
        const barLen = (d.count / max) * barW;
        const color = PALETTE[i % PALETTE.length];
        const cy = y + rowH / 2;

        svg += '<text x="' + (labelW - 4) + '" y="' + (cy + 4) + '" text-anchor="end" fill="#8aa0c2" font-size="11" font-family="Inter, sans-serif">' + esc(truncate(d.name, 18)) + '</text>';
        svg += '<line x1="' + padL + '" y1="' + (y + rowH - 2) + '" x2="' + (padL + barW) + '" y2="' + (y + rowH - 2) + '" stroke="#1d2c47" stroke-width="1"/>';
        svg += '<rect class="bar-anim" x="' + padL + '" y="' + (y + 4) + '" width="' + barLen + '" height="' + (rowH - 10) + '" rx="4" fill="' + color + '" opacity="0.88" style="animation-delay:' + (i * 0.06) + 's"><title>' + esc(d.name) + ': ' + d.count + '</title></rect>';
        svg += '<text x="' + (padL + barLen + 6) + '" y="' + (cy + 4) + '" fill="#e8edf7" font-size="12" font-family="Poppins, sans-serif" font-weight="800">' + d.count + '</text>';
      });

      svg += '</svg>';
      el.innerHTML = svg;
    }

    function renderDonut(containerId, items) {
      const el = document.getElementById(containerId);
      const total = items.reduce((s, d) => s + d.count, 0) || 1;
      const cx = 100, cy = 100, r = 72, ir = 46;
      let angle = -Math.PI / 2;
      let paths = '';
      let legend = '';

      items.forEach((d, i) => {
        const slice = (d.count / total) * Math.PI * 2;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + slice);
        const y2 = cy + r * Math.sin(angle + slice);
        const ix1 = cx + ir * Math.cos(angle + slice);
        const iy1 = cy + ir * Math.sin(angle + slice);
        const ix2 = cx + ir * Math.cos(angle);
        const iy2 = cy + ir * Math.sin(angle);
        const large = slice > Math.PI ? 1 : 0;
        const color = PALETTE[i % PALETTE.length];
        const pct = Math.round((d.count / total) * 100);

        paths += '<path d="M' + x1 + ',' + y1 + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x2 + ',' + y2 +
          ' L' + ix1 + ',' + iy1 + ' A' + ir + ',' + ir + ' 0 ' + large + ' 0 ' + ix2 + ',' + iy2 + ' Z" fill="' + color + '" opacity="0.9"><title>' + esc(d.name) + ': ' + d.count + ' (' + pct + '%)</title></path>';

        legend += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;color:#8aa0c2">' +
          '<span style="width:10px;height:10px;border-radius:2px;background:' + color + ';flex-shrink:0"></span>' +
          '<span style="flex:1;color:#e8edf7">' + esc(truncate(d.name, 22)) + '</span>' +
          '<span style="font-family:Poppins,sans-serif;font-weight:800;color:#00e5ff">' + pct + '%</span></div>';

        angle += slice;
      });

      const dominant = items[0];
      const domPct = Math.round((dominant.count / total) * 100);

      el.innerHTML =
        '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">' +
          '<svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label="Homebase distribution">' +
            paths +
            '<text x="100" y="94" text-anchor="middle" fill="#8aa0c2" font-size="9" font-family="Inter,sans-serif">TOP PICK</text>' +
            '<text x="100" y="112" text-anchor="middle" fill="#00e5ff" font-size="11" font-weight="700" font-family="Inter,sans-serif">' + esc(truncate(dominant.name, 14)) + '</text>' +
            '<text x="100" y="130" text-anchor="middle" fill="#e8edf7" font-family="Poppins,sans-serif" font-size="22" font-weight="800">' + domPct + '%</text>' +
          '</svg>' +
          '<div style="flex:1;min-width:140px">' + legend + '</div>' +
        '</div>';
    }

    function renderPodium(containerId, items) {
      const el = document.getElementById(containerId);
      if (!items.length) {
        el.innerHTML = '<p style="color:#8aa0c2;font-size:14px">No players with multiple podium finishes.</p>';
        return;
      }
      const max = Math.max(...items.map((d) => d.count));
      const medals = ['#f6a623', '#c0c0c0', '#cd7f32'];
      const rowH = 36;
      const labelW = 140;
      const padL = labelW + 16;
      const barW = 280;
      const h = items.length * rowH + 16;

      let svg = '<svg viewBox="0 0 440 ' + h + '" role="img" aria-label="Podium leaders">';

      items.forEach((d, i) => {
        const y = 8 + i * rowH;
        const len = (d.count / max) * barW;
        const medal = medals[Math.min(i, 2)];
        const cy = y + rowH / 2;

        svg += '<circle cx="14" cy="' + cy + '" r="10" fill="' + medal + '" opacity="0.9"/>';
        svg += '<text x="' + (labelW - 8) + '" y="' + (cy + 4) + '" text-anchor="end" fill="#e8edf7" font-size="12" font-weight="600" font-family="Inter,sans-serif">' + esc(truncate(d.name, 20)) + '</text>';
        svg += '<rect class="bar-anim" x="' + padL + '" y="' + (y + 8) + '" width="' + len + '" height="20" rx="4" fill="url(#podiumGrad)" style="animation-delay:' + (i * 0.08) + 's"><title>' + esc(d.name) + ': ' + d.count + ' podiums</title></rect>';
        svg += '<text x="' + (padL + len + 8) + '" y="' + (cy + 4) + '" fill="#00e5ff" font-size="13" font-family="Poppins,sans-serif" font-weight="800">' + d.count + '</text>';
      });

      svg += '<defs><linearGradient id="podiumGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#00c8e8"/><stop offset="100%" stop-color="#00e5ff"/></linearGradient></defs>';
      svg += '</svg>';
      el.innerHTML = svg;
    }

    function renderHistogram(containerId, buckets, avg) {
      const el = document.getElementById(containerId);
      const max = Math.max(...buckets.map((b) => b.count), 1);
      const barW = 64;
      const gap = 24;
      const chartW = buckets.length * (barW + gap) + 40;
      const chartH = 200;
      const baseY = 160;

      let svg = '<svg viewBox="0 0 ' + chartW + ' ' + chartH + '" role="img" aria-label="Deck size distribution">';

      buckets.forEach((b, i) => {
        const x = 30 + i * (barW + gap);
        const h = (b.count / max) * 120;
        const y = baseY - h;
        const color = PALETTE[i % PALETTE.length];

        svg += '<rect class="bar-anim" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="6" fill="' + color + '" opacity="0.88" style="animation-delay:' + (i * 0.08) + 's"><title>' + esc(b.label) + ' cards: ' + b.count + ' decks</title></rect>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 8) + '" text-anchor="middle" fill="#e8edf7" font-family="Poppins,sans-serif" font-size="14" font-weight="800">' + b.count + '</text>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (baseY + 18) + '" text-anchor="middle" fill="#8aa0c2" font-size="11" font-family="Inter,sans-serif">' + esc(b.label) + '</text>';
      });

      const avgX = 30 + (buckets.length * (barW + gap)) / 2 - gap / 2;
      svg += '<line x1="' + avgX + '" y1="28" x2="' + avgX + '" y2="' + baseY + '" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.7"/>';
      svg += '<text x="' + avgX + '" y="20" text-anchor="middle" fill="#00e5ff" font-size="10" font-family="Inter,sans-serif">avg ' + avg + '</text>';

      svg += '</svg>';
      el.innerHTML = svg;
    }

    function renderSlotDiversity(containerId, slots) {
      const el = document.getElementById(containerId);
      const max = Math.max(...slots.map((s) => s.unique), 1);
      const barW = 48;
      const gap = 36;
      const chartW = slots.length * (barW + gap) + 50;
      const chartH = 200;
      const baseY = 155;

      let svg = '<svg viewBox="0 0 ' + chartW + ' ' + chartH + '" role="img" aria-label="Slot diversity">';

      slots.forEach((s, i) => {
        const x = 36 + i * (barW + gap);
        const h = (s.unique / max) * 110;
        const y = baseY - h;
        const color = PALETTE[i % PALETTE.length];
        const short = s.label.replace('Front Line ', 'FL');

        svg += '<rect class="bar-anim" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" rx="6" fill="' + color + '" opacity="0.88" style="animation-delay:' + (i * 0.08) + 's"><title>' + esc(s.label) + ': ' + s.unique + ' unique / ' + s.total + ' slots</title></rect>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (y - 8) + '" text-anchor="middle" fill="#e8edf7" font-family="Poppins,sans-serif" font-size="16" font-weight="800">' + s.unique + '</text>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (baseY + 16) + '" text-anchor="middle" fill="#8aa0c2" font-size="10" font-family="Inter,sans-serif">' + esc(short) + '</text>';
        svg += '<text x="' + (x + barW / 2) + '" y="' + (baseY + 30) + '" text-anchor="middle" fill="#56678a" font-size="9" font-family="Inter,sans-serif">of ' + s.total + '</text>';
      });

      svg += '</svg>';
      el.innerHTML = svg;
    }

    function renderEventSnapshots() {
      const row = document.getElementById('event-row');
      row.innerHTML = DATA.eventSnapshots.map((ev) =>
        '<div class="event-card">' +
          '<div class="ev-name">' + esc(ev.event) + '</div>' +
          '<div class="ev-char">' + esc(ev.character) + '</div>' +
          '<div class="ev-count">×' + ev.count + '</div>' +
        '</div>'
      ).join('');
    }

    function renderFooter() {
      document.getElementById('footer').textContent =
        'Generated from OverPower Regionals Character Lists · ' + DATA.generatedAt + ' · Excelsior v2 style';
    }

    function init() {
      renderKpis();
      renderBarChart('svg-characters', DATA.topCharacters, { title: 'Top characters', rowH: 30, labelW: 118, chartW: 420 });
      renderDonut('svg-homebases', DATA.homebases);
      renderBarChart('svg-cataclysms', DATA.cataclysms, { title: 'Cataclysms', rowH: 26, labelW: 130, chartW: 400 });
      renderPodium('svg-podium', DATA.podiumLeaders);
      renderHistogram('svg-decksize', DATA.cardBuckets, DATA.avgCards);
      renderSlotDiversity('svg-slots', DATA.slotDiversity);
      renderEventSnapshots();
      renderFooter();
    }

    init();
  </script>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error('Excel file not found:', XLSX_PATH);
    process.exit(1);
  }

  const data = parseWorkbook();
  const html = buildHtml(data);
  fs.writeFileSync(OUTPUT_PATH, html, 'utf8');
  console.log('Wrote', OUTPUT_PATH);
  console.log('Events:', data.hero.events, '| Deck lists:', data.hero.deckLists, '| Top char:', data.topCharacters[0]?.name);
}

main();
