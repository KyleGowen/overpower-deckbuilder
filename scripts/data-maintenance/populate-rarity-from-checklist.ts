/**
 * Populate `rarity` on card tables from docs/checklist-source/checklist.md (pipe table).
 *
 * Usage (from repo root, after `npm run migrate`):
 *   npx ts-node scripts/data-maintenance/populate-rarity-from-checklist.ts
 *   npx ts-node scripts/data-maintenance/populate-rarity-from-checklist.ts --dry-run
 *
 * Requires DB_* or DATABASE_URL in .env (same as other data-maintenance scripts).
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

/** Matches DB CHECK on card tables (see migrations/V252). */
export type CanonicalCardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra Rare';

/**
 * Map checklist / legacy DB strings to canonical rarity (matches V252 SQL).
 * Returns null if empty after trim or if the value is not a known tier (caller should warn, not write).
 */
export function normalizeRarityForDb(raw: string): CanonicalCardRarity | null {
  const collapsed = raw
    .trim()
    .replace(/^\*+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!collapsed) return null;
  const key = collapsed.toLowerCase();
  if (key === 'common' || key === 'common slot, rare drop') return 'Common';
  if (key === 'uncommon' || key === 'uncommon slot, rare drop') return 'Uncommon';
  if (key === 'rare') return 'Rare';
  if (key === 'ultra rare' || key === 'ultrarare' || key === 'ultra-rare') return 'Ultra Rare';
  return null;
}

/** checklist.md is main-line ERB; never copy its rarity onto ERBP promo rows (duplicate #s / shared power keys). */
const NOT_ERBP = ' AND (set IS DISTINCT FROM \'ERBP\')';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1337', 10),
  database: process.env.DB_NAME || 'overpower',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  connectionString: process.env.DATABASE_URL,
});

export interface ChecklistRow {
  setNum: string;
  cardName: string;
  cardSpecial: string;
  rarity: string;
}

/** Exported for unit tests */
export function parseChecklistMarkdown(content: string): ChecklistRow[] {
  const out: ChecklistRow[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trimStart().startsWith('|')) continue;
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length < 8) continue;
    const num1 = parts[2];
    const cardName = parts[3];
    const cardSpecial = parts[4];
    const rarity = parts[5];
    if (num1 === '#' || num1 === 'Card Name') continue;
    if (/^foil$/i.test(num1) && /^foil$/i.test(rarity)) continue;
    if (!num1 || !/^\d+[Ff]?$/i.test(num1)) continue;
    out.push({ setNum: num1, cardName, cardSpecial, rarity });
  }
  return out;
}

function stripCharacterCardSuffix(name: string): string {
  return name
    .replace(/\s*Character Card\s*-.*$/i, '')
    .replace(/\s*Character Card\s*$/i, '')
    .trim();
}

/** Checklist "8 Energy" / "5 MultiPower" → DB name + power_type + value */
/** Exported for unit tests */
export function parsePowerFromChecklist(cardName: string, cardSpecial: string): {
  name: string;
  power_type: string;
  value: number;
} | null {
  const s = cardSpecial.trim();
  if (s !== 'Power Card' && s !== 'Any-Power Power Card' && s !== 'MultiPower Power Card') {
    return null;
  }
  const n = cardName.trim();
  if (s === 'Any-Power Power Card') {
    const m = n.match(/^(\d+)\s+Any-Power/i);
    if (!m) return null;
    return { name: `${m[1]} - Any-Power`, power_type: 'Any-Power', value: parseInt(m[1], 10) };
  }
  if (s === 'MultiPower Power Card') {
    const m = n.match(/^(\d+)\s+MultiPower/i);
    if (!m) return null;
    return { name: `${m[1]} - Multi Power`, power_type: 'Multi Power', value: parseInt(m[1], 10) };
  }
  const m = n.match(/^(\d+)\s+(Energy|Combat|Brute Force|Intelligence)\s*$/i);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  const raw = m[2].toLowerCase();
  const powerType =
    raw === 'energy'
      ? 'Energy'
      : raw === 'combat'
        ? 'Combat'
        : raw === 'brute force'
          ? 'Brute Force'
          : 'Intelligence';
  return { name: `${value} - ${powerType}`, power_type: powerType, value };
}

async function run(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const checklistPath = join(__dirname, '../../docs/checklist-source/checklist.md');
  const md = readFileSync(checklistPath, 'utf8');
  const rows = parseChecklistMarkdown(md);

  const unmatched: string[] = [];
  const rarityWarnings: string[] = [];
  const updates: { label: string; count: number }[] = [];

  const client = await pool.connect();
  try {
    for (const row of rows) {
      const { setNum, cardName, cardSpecial, rarity } = row;
      const rRaw = rarity.trim();
      if (!rRaw) continue;
      const norm = normalizeRarityForDb(rRaw);
      if (norm === null) {
        rarityWarnings.push(`Unmapped rarity "${rRaw}" | #${setNum} | ${cardName.trim()}`);
        continue;
      }

      const cs = cardSpecial.trim();
      const cn = cardName.trim();

      let done = false;

      const record = (label: string, count: number) => {
        if (count > 0) {
          updates.push({ label, count });
          done = true;
        }
      };

      // Power cards (standard / Any-Power / MultiPower)
      const power = parsePowerFromChecklist(cn, cs);
      if (power) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM power_cards WHERE name = $1 AND power_type = $2 AND value = $3${NOT_ERBP}`,
              [power.name, power.power_type, power.value]
            )
          : await client.query(
              `UPDATE power_cards SET rarity = $1 WHERE name = $2 AND power_type = $3 AND value = $4${NOT_ERBP}`,
              [norm, power.name, power.power_type, power.value]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`power ${power.name}`, count);
        if (!done) unmatched.push(`power no row: ${setNum} ${cn}`);
        continue;
      }

      if (cs === 'Location Card') {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM locations WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(`UPDATE locations SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`, [norm, setNum]);
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`location ${setNum}`, count);
        if (!done) unmatched.push(`location ${setNum} ${cn}`);
        continue;
      }

      if (cs === 'Aspect Card') {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM aspects WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(`UPDATE aspects SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`, [norm, setNum]);
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`aspect ${setNum}`, count);
        if (!done) unmatched.push(`aspect ${setNum} ${cn}`);
        continue;
      }

      if (cs.startsWith('Universe: Ally')) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM ally_universe_cards WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE ally_universe_cards SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`ally ${setNum}`, count);
        if (!done) unmatched.push(`ally ${setNum}`);
        continue;
      }

      if (cs.startsWith('Universe: Basic')) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM basic_universe_cards WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE basic_universe_cards SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`basic ${setNum}`, count);
        if (!done) unmatched.push(`basic ${setNum}`);
        continue;
      }

      if (cs.startsWith('Universe: Training')) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM training_cards WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE training_cards SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`training ${setNum}`, count);
        if (!done) unmatched.push(`training ${setNum}`);
        continue;
      }

      if (cs.startsWith('Universe: Teamwork') || cs === 'Any-Power Teamwork Card') {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM teamwork_cards WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE teamwork_cards SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`teamwork ${setNum}`, count);
        if (!done) unmatched.push(`teamwork ${setNum}`);
        continue;
      }

      if (cs.startsWith('Mission Set:')) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM missions WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(`UPDATE missions SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`, [norm, setNum]);
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`mission ${setNum}`, count);
        if (!done) unmatched.push(`mission ${setNum}`);
        continue;
      }

      if (cs.startsWith('Event Set:')) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM events WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(`UPDATE events SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`, [norm, setNum]);
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`event ${setNum}`, count);
        if (!done) unmatched.push(`event ${setNum}`);
        continue;
      }

      // Alternative-art hero rows without "Character Card" in the name (e.g. "Sherlock Holmes")
      if (cs === 'Alternative Art Hero Cards') {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM characters WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE characters SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        if (count > 0) {
          updates.push({ label: `character alt-art ${setNum}`, count });
          continue;
        }
        unmatched.push(`character alt-art ${setNum} ${cn}`);
        continue;
      }

      // Character cards (standard checklist "… Character Card" rows)
      const isCharacterRow = !cs || (/\bCharacter Card\b/i.test(cn) && !cs);
      if (isCharacterRow && /\bCharacter Card\b/i.test(cn)) {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM characters WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE characters SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`character ${setNum}`, count);
        if (!done) {
          const base = stripCharacterCardSuffix(cn);
          const res2 = dryRun
            ? await client.query(
                `SELECT COUNT(*)::int AS c FROM characters WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))${NOT_ERBP}`,
                [base]
              )
            : await client.query(
                `UPDATE characters SET rarity = $1 WHERE LOWER(TRIM(name)) = LOWER(TRIM($2))${NOT_ERBP}`,
                [norm, base]
              );
          const c2 = dryRun ? res2.rows[0].c : res2.rowCount ?? 0;
          record(`character by name ${base}`, c2);
        }
        if (!done) unmatched.push(`character ${setNum} ${cn}`);
        continue;
      }

      // Specials: use set_number (matches checklist # to DB column)
      if (cs && !cs.startsWith('Universe:') && cs !== 'Alternative Art Hero Cards') {
        const res = dryRun
          ? await client.query(
              `SELECT COUNT(*)::int AS c FROM special_cards WHERE set_number = $1${NOT_ERBP}`,
              [setNum]
            )
          : await client.query(
              `UPDATE special_cards SET rarity = $1 WHERE set_number = $2${NOT_ERBP}`,
              [norm, setNum]
            );
        const count = dryRun ? res.rows[0].c : res.rowCount ?? 0;
        record(`special ${setNum}`, count);
        if (!done) unmatched.push(`special ${setNum} ${cn} / ${cs}`);
        continue;
      }

      unmatched.push(`unclassified ${setNum} | ${cn} | ${cs}`);
    }

    const merged = new Map<string, number>();
    for (const u of updates) {
      merged.set(u.label, (merged.get(u.label) ?? 0) + u.count);
    }

    console.log(dryRun ? 'Dry run (counts of rows that would be updated):\n' : 'Applied row updates:\n');
    for (const [label, count] of [...merged.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (count > 0) console.log(`  ${label}: ${count}`);
    }

    if (rarityWarnings.length > 0) {
      console.log(`\nUnmapped checklist rarity (${rarityWarnings.length}) — rows skipped (fix checklist or extend normalizeRarityForDb):`);
      for (const w of rarityWarnings.slice(0, 80)) console.log(`  - ${w}`);
      if (rarityWarnings.length > 80) console.log(`  ... and ${rarityWarnings.length - 80} more`);
    }

    if (unmatched.length > 0) {
      console.log(`\nUnmatched / zero-row (${unmatched.length}):`);
      for (const u of unmatched.slice(0, 80)) console.log(`  - ${u}`);
      if (unmatched.length > 80) console.log(`  ... and ${unmatched.length - 80} more`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
