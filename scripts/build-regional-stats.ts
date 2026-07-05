#!/usr/bin/env ts-node
/**
 * Build static tournament stats JSON from the regional Excel workbook.
 *
 * Usage:
 *   npx ts-node scripts/build-regional-stats.ts [path-to-xlsx]
 *   npx ts-node scripts/build-regional-stats.ts --skip-validation
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import XLSX from 'xlsx';
import 'dotenv/config';
import { DataSourceConfig } from '../src/config/DataSourceConfig';
import {
  aggregateRegionalStats,
  parseS0SheetRows,
  parseS1SheetRows,
} from './lib/regional-stats/aggregateRegionalStats';
import { normalizeTournamentName } from './lib/regional-stats/nameAliases';
import type { TournamentEventStats } from './lib/regional-stats/types';

const DEFAULT_XLSX = path.join(
  os.homedir(),
  'Desktop',
  'OverPower Regionals Character Lists.xlsx',
);

const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'frontend',
  'src',
  'data',
  'tournaments',
  's1-columbus.json',
);

const PRIOR_SHEETS = ['S0 Seattle', 'S0 Columbus', 'S0 Toronto', 'S0 Philly', 'S0 Nats'];

function sheetToRows(wb: XLSX.WorkBook, name: string): unknown[][] {
  const sheet = wb.Sheets[name];
  if (!sheet) {
    throw new Error(`Missing sheet: ${name}`);
  }
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
}

function collectReferencedNames(stats: TournamentEventStats): Map<string, string> {
  const names = new Map<string, string>();
  const add = (name: string, catalogType: string) => {
    const canonical = normalizeTournamentName(name);
    if (canonical) names.set(`${catalogType}:${canonical}`, catalogType);
  };

  const allEntries = [
    ...stats.characterAppearances,
    ...stats.top8CharacterAppearances,
    ...stats.newWinningCharacters,
    ...stats.newTop8Characters,
    ...stats.topReserves,
    ...stats.topHomebases,
    ...stats.topCataclysms,
  ];
  for (const e of allEntries) add(e.name, e.catalogType);
  if (stats.mostPlaysWithoutTop8) {
    add(stats.mostPlaysWithoutTop8.name, stats.mostPlaysWithoutTop8.catalogType);
  }
  if (stats.highestTop8Rate) {
    add(stats.highestTop8Rate.name, stats.highestTop8Rate.catalogType);
  }
  return names;
}

async function validateAgainstCatalog(stats: TournamentEventStats): Promise<void> {
  const referenced = collectReferencedNames(stats);
  const dataSource = DataSourceConfig.getInstance();
  const cardRepo = dataSource.getCardRepository();

  try {
    const [characters, locations, specials] = await Promise.all([
      cardRepo.getAllCharacters(),
      cardRepo.getAllLocations(),
      cardRepo.getAllSpecialCards(),
    ]);

    const charNames = new Set(characters.map((c) => c.name.trim()));
    const locNames = new Set(locations.map((l) => l.name.trim()));
    const cataclysmNames = new Set(
      specials.filter((s) => s.is_cataclysm).map((s) => s.name.trim()),
    );

    const missing: string[] = [];
    for (const [key, catalogType] of referenced) {
      const name = key.slice(key.indexOf(':') + 1);
      if (catalogType === 'characters' && !charNames.has(name)) missing.push(`character: ${name}`);
      if (catalogType === 'locations' && !locNames.has(name)) missing.push(`location: ${name}`);
      if (catalogType === 'special-cards' && !cataclysmNames.has(name)) {
        missing.push(`cataclysm: ${name}`);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Unresolved catalog names:\n  ${missing.join('\n  ')}`);
    }
    console.log(`Validated ${referenced.size} unique card references against catalog.`);
  } finally {
    await dataSource.close();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((a) => a !== '--skip-validation');
  const skipValidation = process.argv.includes('--skip-validation');
  const xlsxPath = path.resolve(args[0] ?? DEFAULT_XLSX);

  if (!fs.existsSync(xlsxPath)) {
    console.error(`Excel file not found: ${xlsxPath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath);
  const s1Rows = sheetToRows(wb, 'S1 Columbus');
  const decks = parseS1SheetRows(s1Rows);

  const priorEventDecks = PRIOR_SHEETS.map((sheetName) => {
    if (!wb.SheetNames.includes(sheetName)) return [];
    return parseS0SheetRows(sheetToRows(wb, sheetName));
  }).filter((rows) => rows.length > 0);

  const winner = decks.find((d) => d.rank === 1);

  const stats = aggregateRegionalStats({
    meta: {
      id: 's1-columbus',
      title: 'Columbus Regional',
      subtitle: 'Season One Regional',
      date: '2026-06-27',
      playerCount: decks.length,
      winnerName: winner?.player ?? 'Unknown',
      seasonLabel: '1st Season One Regional',
      location: {
        venueName: 'Heroes and Games',
        city: 'Columbus',
        region: 'OH',
      },
    },
    decks,
    priorEventDecks,
  });

  if (!skipValidation) {
    try {
      await validateAgainstCatalog(stats);
    } catch (err) {
      console.warn('Catalog validation failed (writing JSON anyway):', err instanceof Error ? err.message : err);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${OUTPUT_PATH} (${decks.length} decks)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
