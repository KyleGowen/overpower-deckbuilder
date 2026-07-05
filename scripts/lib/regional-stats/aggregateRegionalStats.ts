import { catalogTypeForCanonicalName, normalizeTournamentName } from './nameAliases';
import type {
  CountEntry,
  HomebaseCountEntry,
  RegionalDeckRow,
  SpotlightEntry,
  TournamentCatalogType,
  TournamentEventMeta,
  TournamentEventStats,
} from './types';

const CHARACTER_COLS = ['frontLine1', 'frontLine2', 'frontLine3', 'reserve'] as const;

function inc(map: Map<string, number>, rawName: string, slot: 'character' | 'reserve' | 'homebase' | 'cataclysm'): void {
  const name = normalizeTournamentName(rawName);
  if (!name) return;
  const key = `${slot}:${name}`;
  map.set(key, (map.get(key) ?? 0) + 1);
}

function characterSlots(row: RegionalDeckRow): string[] {
  return [row.frontLine1, row.frontLine2, row.frontLine3, row.reserve]
    .map((v) => normalizeTournamentName(v))
    .filter(Boolean);
}

function mapToCountEntries(
  map: Map<string, number>,
  defaultSlot: 'character' | 'reserve' | 'homebase' | 'cataclysm',
): CountEntry[] {
  const byName = new Map<string, { count: number; slot: typeof defaultSlot }>();
  for (const [key, count] of map) {
    const colon = key.indexOf(':');
    const slot = (colon >= 0 ? key.slice(0, colon) : defaultSlot) as typeof defaultSlot;
    const name = colon >= 0 ? key.slice(colon + 1) : key;
    const prev = byName.get(name);
    if (prev) {
      prev.count += count;
    } else {
      byName.set(name, { count, slot });
    }
  }
  return [...byName.entries()]
    .map(([name, { count, slot }]) => ({
      name,
      count,
      catalogType: catalogTypeForCanonicalName(name, slot),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function collectPriorFirstPlaceCharacters(priorRows: RegionalDeckRow[][]): Set<string> {
  const seen = new Set<string>();
  for (const sheet of priorRows) {
    const first = sheet.find((r) => r.rank === 1);
    if (!first) continue;
    characterSlots(first).forEach((c) => seen.add(c));
  }
  return seen;
}

function collectPriorTop8Characters(priorRows: RegionalDeckRow[][]): Set<string> {
  const seen = new Set<string>();
  for (const sheet of priorRows) {
    sheet.filter((r) => r.rank <= 8).forEach((row) => {
      characterSlots(row).forEach((c) => seen.add(c));
    });
  }
  return seen;
}

function computeSpotlight(
  allDecks: RegionalDeckRow[],
  top8Decks: RegionalDeckRow[],
): { mostPlaysWithoutTop8: SpotlightEntry | null; highestTop8Rate: SpotlightEntry | null } {
  const total = new Map<string, number>();
  const top8 = new Map<string, number>();

  for (const row of allDecks) {
    for (const c of characterSlots(row)) {
      total.set(c, (total.get(c) ?? 0) + 1);
    }
  }
  for (const row of top8Decks) {
    for (const c of characterSlots(row)) {
      top8.set(c, (top8.get(c) ?? 0) + 1);
    }
  }

  let mostPlaysWithoutTop8: SpotlightEntry | null = null;
  for (const [name, plays] of total) {
    const t8 = top8.get(name) ?? 0;
    if (t8 > 0) continue;
    if (!mostPlaysWithoutTop8 || plays > mostPlaysWithoutTop8.totalPlays) {
      mostPlaysWithoutTop8 = {
        name,
        catalogType: 'characters',
        totalPlays: plays,
        top8Plays: 0,
        label: 'Most plays w/o Top 8',
        detail: String(plays),
      };
    }
  }

  let highestTop8Rate: SpotlightEntry | null = null;
  let bestRate = -1;
  for (const [name, plays] of total) {
    if (plays < 3) continue;
    const t8 = top8.get(name) ?? 0;
    const rate = t8 / plays;
    if (rate > bestRate || (rate === bestRate && plays > (highestTop8Rate?.totalPlays ?? 0))) {
      bestRate = rate;
      highestTop8Rate = {
        name,
        catalogType: 'characters',
        totalPlays: plays,
        top8Plays: t8,
        label: 'Highest Top 8 %',
        detail: `${t8} of ${plays} (${(rate * 100).toFixed(1)}%)`,
      };
    }
  }

  return { mostPlaysWithoutTop8, highestTop8Rate };
}

export interface AggregateRegionalStatsInput {
  meta: TournamentEventMeta;
  decks: RegionalDeckRow[];
  priorEventDecks: RegionalDeckRow[][];
}

export function aggregateRegionalStats(input: AggregateRegionalStatsInput): TournamentEventStats {
  const { meta, decks, priorEventDecks } = input;
  const top8Decks = decks.filter((d) => d.rank <= 8);
  const winnerDeck = decks.find((d) => d.rank === 1);

  const charMap = new Map<string, number>();
  const top8CharMap = new Map<string, number>();
  const reserveMap = new Map<string, number>();
  const homeMap = new Map<string, number>();
  const homeTop8 = new Map<string, number>();
  const homeTop3 = new Map<string, number>();
  const homeWins = new Map<string, number>();
  const catMap = new Map<string, number>();
  let cataclysmReportedCount = 0;

  for (const row of decks) {
    const isTop8 = row.rank <= 8;
    const isTop3 = row.rank <= 3;
    const isWin = row.rank === 1;

    for (const col of CHARACTER_COLS) {
      inc(charMap, row[col], col === 'reserve' ? 'reserve' : 'character');
    }
    if (isTop8) {
      for (const col of CHARACTER_COLS) {
        inc(top8CharMap, row[col], col === 'reserve' ? 'reserve' : 'character');
      }
    }

    if (normalizeTournamentName(row.reserve)) {
      inc(reserveMap, row.reserve, 'reserve');
    }

    const homeName = normalizeTournamentName(row.homebase);
    if (homeName) {
      const hk = `homebase:${homeName}`;
      homeMap.set(hk, (homeMap.get(hk) ?? 0) + 1);
      if (isTop8) homeTop8.set(homeName, (homeTop8.get(homeName) ?? 0) + 1);
      if (isTop3) homeTop3.set(homeName, (homeTop3.get(homeName) ?? 0) + 1);
      if (isWin) homeWins.set(homeName, (homeWins.get(homeName) ?? 0) + 1);
    }

    const catName = normalizeTournamentName(row.cataclysm);
    if (catName) {
      cataclysmReportedCount += 1;
      inc(catMap, row.cataclysm, 'cataclysm');
    }
  }

  const priorWinners = collectPriorFirstPlaceCharacters(priorEventDecks);
  const priorTop8 = collectPriorTop8Characters(priorEventDecks);

  const newWinningCharacters: CountEntry[] = [];
  if (winnerDeck) {
    const seen = new Set<string>();
    for (const c of characterSlots(winnerDeck)) {
      if (seen.has(c) || priorWinners.has(c)) continue;
      seen.add(c);
      newWinningCharacters.push({ name: c, count: 1, catalogType: 'characters' });
    }
  }

  const newTop8Chars = new Set<string>();
  for (const row of top8Decks) {
    for (const c of characterSlots(row)) {
      if (!priorTop8.has(c)) newTop8Chars.add(c);
    }
  }
  const newTop8Characters: CountEntry[] = [...newTop8Chars]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, count: 1, catalogType: 'characters' as TournamentCatalogType }));

  const topHomebases: HomebaseCountEntry[] = [...homeMap.entries()]
    .map(([key, count]) => {
      const name = key.replace(/^homebase:/, '');
      return {
        name,
        count,
        catalogType: 'locations' as TournamentCatalogType,
        top8: homeTop8.get(name) ?? 0,
        top3: homeTop3.get(name) ?? 0,
        wins: homeWins.get(name) ?? 0,
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const spotlights = computeSpotlight(decks, top8Decks);

  return {
    meta,
    characterAppearances: mapToCountEntries(charMap, 'character'),
    top8CharacterAppearances: mapToCountEntries(top8CharMap, 'character'),
    mostPlaysWithoutTop8: spotlights.mostPlaysWithoutTop8,
    highestTop8Rate: spotlights.highestTop8Rate,
    newWinningCharacters,
    newTop8Characters,
    topReserves: mapToCountEntries(reserveMap, 'reserve'),
    topHomebases,
    topCataclysms: mapToCountEntries(catMap, 'cataclysm'),
    cataclysmReportedCount,
  };
}

export function parseS1SheetRows(rows: unknown[][]): RegionalDeckRow[] {
  const decks: RegionalDeckRow[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const r = rows[i];
    if (!r || r.length < 7) continue;
    const rank = Number(r[0]);
    if (!Number.isFinite(rank) || rank < 1) continue;
    decks.push({
      rank,
      player: String(r[1] ?? '').trim(),
      frontLine1: String(r[2] ?? '').trim(),
      frontLine2: String(r[3] ?? '').trim(),
      frontLine3: String(r[4] ?? '').trim(),
      reserve: String(r[5] ?? '').trim(),
      homebase: String(r[6] ?? '').trim(),
      cataclysm: String(r[8] ?? '').trim(),
    });
  }
  return decks;
}

export function parseS0SheetRows(rows: unknown[][]): RegionalDeckRow[] {
  const decks: RegionalDeckRow[] = [];
  for (let i = 1; i < rows.length; i += 1) {
    const r = rows[i];
    if (!r || r.length < 6) continue;
    const placement = String(r[0] ?? '').trim();
    const rankMatch = placement.match(/^(\d+)/);
    if (!rankMatch) continue;
    const rank = Number(rankMatch[1]);
    const playerMatch = placement.match(/-\s*(.+?)(?:\s*\(|$)/);
    const player = playerMatch?.[1]?.trim() ?? placement;
    decks.push({
      rank,
      player,
      frontLine1: String(r[1] ?? '').trim(),
      frontLine2: String(r[2] ?? '').trim(),
      frontLine3: String(r[3] ?? '').trim(),
      reserve: String(r[4] ?? '').trim(),
      homebase: String(r[5] ?? '').trim(),
      cataclysm: String(r[6] ?? '').trim(),
    });
  }
  return decks;
}
