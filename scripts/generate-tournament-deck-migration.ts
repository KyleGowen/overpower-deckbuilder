#!/usr/bin/env ts-node
/**
 * Generates a Flyway migration that seeds all decks owned by the local
 * tournament_decks user, using live deck_cards rows from PostgreSQL.
 *
 * Usage: npm run generate:tournament-deck-migration
 * Output: migrations/V<NNN>__Seed_tournament_decks.sql
 *
 * Regenerate after adding/editing tournament decks locally (import or deck editor),
 * then commit the updated migration for production deploy.
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSourceConfig } from '../src/config/DataSourceConfig';
import { TOURNAMENT_DECKS_USER_ID } from '../src/constants/tournamentDecksUser';
import type { Deck, DeckCard } from '../src/types';

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const STABLE_ID_PREFIX = 'a2880001-0000-4000-8000-0000000000';

interface TournamentDeckSnapshot {
  stableIndex: number;
  deck: Deck;
  cards: DeckCard[];
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlOptionalLiteral(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }
  return sqlLiteral(value);
}

function stableDeckId(index: number): string {
  const suffix = String(index).padStart(2, '0');
  return `${STABLE_ID_PREFIX}${suffix}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function nextMigrationVersion(): number {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  let max = 0;
  for (const file of files) {
    const match = /^V(\d+)__/.exec(file);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return max + 1;
}

function findExistingSeedMigration(): string | null {
  const matches = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^V\d+__Seed_tournament_decks\.sql$/.test(file))
    .sort();
  return matches.length > 0 ? path.join(MIGRATIONS_DIR, matches[matches.length - 1]) : null;
}

function buildDeckBlock(snapshot: TournamentDeckSnapshot): string {
  const { deck, cards, stableIndex } = snapshot;
  const deckId = stableDeckId(stableIndex);
  const deckName = deck.name.trim();
  const description = deck.description?.trim() ?? '';
  const isLimited = deck.is_limited === true;
  const isValid = deck.is_valid === true;

  const cardInserts = cards
    .map((c) => {
      if (c.exclude_from_draw === true) {
        return `        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity, exclude_from_draw)
        VALUES (${sqlLiteral(deckId)}, ${sqlLiteral(c.type)}, ${sqlLiteral(c.cardId)}, ${c.quantity}, TRUE);`;
      }
      return `        INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
        VALUES (${sqlLiteral(deckId)}, ${sqlLiteral(c.type)}, ${sqlLiteral(c.cardId)}, ${c.quantity});`;
    })
    .join('\n');

  return `    -- ${slugify(deckName)} (local id: ${deck.id})
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE user_id = tournament_user_id AND name = ${sqlLiteral(deckName)}
    ) THEN
        INSERT INTO decks (
            id,
            user_id,
            name,
            description,
            created_at,
            updated_at,
            is_private,
            is_limited,
            is_valid,
            card_count,
            threat,
            reserve_character
        ) VALUES (
            ${sqlLiteral(deckId)}::uuid,
            tournament_user_id,
            ${sqlLiteral(deckName)},
            ${sqlLiteral(description)},
            NOW(),
            NOW(),
            FALSE,
            ${isLimited ? 'TRUE' : 'FALSE'},
            ${isValid ? 'TRUE' : 'FALSE'},
            0,
            0,
            ${sqlOptionalLiteral(deck.reserve_character)}
        );

${cardInserts}

        RAISE NOTICE 'Seeded tournament deck: %', ${sqlLiteral(deckName)};
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', ${sqlLiteral(deckName)};
    END IF;`;
}

async function main(): Promise<void> {
  const dataSource = DataSourceConfig.getInstance();
  const deckRepository = dataSource.getDeckRepository();

  try {
    const decks = await deckRepository.getDecksByUserId(TOURNAMENT_DECKS_USER_ID, 'created_at');
    if (decks.length === 0) {
      throw new Error('No decks found for tournament_decks user — import decks locally first');
    }

    const snapshots: TournamentDeckSnapshot[] = [];
    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i];
      const cards = await deckRepository.getDeckCards(deck.id);
      if (cards.length === 0) {
        throw new Error(`Deck "${deck.name}" (${deck.id}) has no cards`);
      }
      snapshots.push({ stableIndex: i + 1, deck, cards });
    }

    const deckBlocks = snapshots.map(buildDeckBlock);
    const deckManifest = snapshots
      .map((s) => `--   ${stableDeckId(s.stableIndex)}  ${s.deck.name}`)
      .join('\n');

    const sql = `-- Seed tournament winning decks for the Home "Tournament Winners" rail.
-- Generated from local tournament_decks user via scripts/generate-tournament-deck-migration.ts
-- Idempotent: skips decks that tournament_decks already owns by name.
-- Deck metadata (card_count, threat, character slots) is populated by V133 triggers on deck_cards INSERT.
--
-- Deck manifest (${snapshots.length} decks):
${deckManifest}

DO $$
DECLARE
    tournament_user_id UUID := '${TOURNAMENT_DECKS_USER_ID}';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = tournament_user_id) THEN
        RAISE EXCEPTION 'tournament_decks user missing; apply V280 first';
    END IF;

${deckBlocks.join('\n\n')}
END $$;
`;

    const existingPath = findExistingSeedMigration();
    const outputPath =
      existingPath ?? path.join(MIGRATIONS_DIR, `V${nextMigrationVersion()}__Seed_tournament_decks.sql`);

    fs.writeFileSync(outputPath, sql, 'utf8');
    console.log(`✅ Wrote ${outputPath}`);
    console.log(`   Decks: ${snapshots.length}`);
    for (const s of snapshots) {
      console.log(`   - ${s.deck.name} (${s.cards.length} card rows)`);
    }
  } finally {
    await dataSource.close();
  }
}

main().catch((error) => {
  console.error('❌ Generation failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
