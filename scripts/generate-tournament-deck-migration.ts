#!/usr/bin/env ts-node
/**
 * Generates a Flyway migration that seeds all decks owned by the local
 * tournament_decks user. Card rows use name-based SQL lookups (not hardcoded
 * UUIDs) so the migration works on any environment after V1–V287.
 *
 * Usage: npm run generate:tournament-deck-migration
 * Output: migrations/V<NNN>__Seed_tournament_decks.sql
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSourceConfig } from '../src/config/DataSourceConfig';
import { TOURNAMENT_DECKS_USER_ID } from '../src/constants/tournamentDecksUser';
import {
  buildAvailableCardsMap,
  type DeckCatalogBundle,
} from '../src/services/deck-validation/build-available-cards-map';
import { loadDeckCatalogBundle } from '../src/services/deckExportImport/loadDeckCatalogBundle';
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

function catalogKey(cardType: string, cardId: string): string {
  const prefix = cardType.replace(/-/g, '_');
  return `${prefix}_${cardId}`;
}

function findCatalogCard(
  bundle: DeckCatalogBundle,
  cardType: string,
  cardId: string
): Record<string, unknown> {
  const map = buildAvailableCardsMap(bundle);
  const card = map.get(catalogKey(cardType, cardId));
  if (!card) {
    throw new Error(`Catalog miss: [${cardType}] id=${cardId}`);
  }
  return card;
}

function sqlEq(column: string, value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return `${column} IS NULL`;
  }
  return `${column} = ${sqlLiteral(value)}`;
}

function buildCardLookupSql(card: Record<string, unknown>, cardType: string): string {
  const name = String(card.name ?? card.card_name ?? '');
  if (!name) {
    throw new Error(`Missing card name for type ${cardType}`);
  }

  switch (cardType) {
    case 'character':
      return `SELECT id INTO card_id_var FROM characters WHERE name = ${sqlLiteral(name)} AND set = ${sqlLiteral(String(card.set ?? 'ERB'))} AND COALESCE(is_foil, false) = ${card.is_foil ? 'TRUE' : 'FALSE'} LIMIT 1;`;
    case 'special':
      return `SELECT id INTO card_id_var FROM special_cards WHERE name = ${sqlLiteral(name)} AND set = ${sqlLiteral(String(card.set ?? 'ERB'))} LIMIT 1;`;
    case 'power':
      return `SELECT id INTO card_id_var FROM power_cards WHERE value = ${Number(card.value)} AND power_type = ${sqlLiteral(String(card.power_type))} LIMIT 1;`;
    case 'location':
      return `SELECT id INTO card_id_var FROM locations WHERE name = ${sqlLiteral(name)} LIMIT 1;`;
    case 'mission':
      return `SELECT id INTO card_id_var FROM missions WHERE card_name = ${sqlLiteral(name)} AND mission_set = ${sqlLiteral(String(card.mission_set))} LIMIT 1;`;
    case 'event':
      return `SELECT id INTO card_id_var FROM events WHERE name = ${sqlLiteral(name)} AND mission_set = ${sqlLiteral(String(card.mission_set))} LIMIT 1;`;
    case 'aspect':
      return `SELECT id INTO card_id_var FROM aspects WHERE card_name = ${sqlLiteral(name)} LIMIT 1;`;
    case 'advanced-universe':
      return `SELECT id INTO card_id_var FROM advanced_universe_cards WHERE name = ${sqlLiteral(name)} LIMIT 1;`;
    case 'teamwork':
      return `SELECT id INTO card_id_var FROM teamwork_cards WHERE name = ${sqlLiteral(name)} AND ${sqlEq('followup_attack_types', String(card.followup_attack_types ?? ''))} LIMIT 1;`;
    case 'ally-universe':
      return `SELECT id INTO card_id_var FROM ally_universe_cards WHERE name = ${sqlLiteral(name)} AND stat_to_use = ${sqlLiteral(String(card.stat_to_use))} AND stat_type_to_use = ${sqlLiteral(String(card.stat_type_to_use))} LIMIT 1;`;
    case 'training':
      return `SELECT id INTO card_id_var FROM training_cards WHERE name = ${sqlLiteral(name)} AND type_1 = ${sqlLiteral(String(card.type_1))} AND type_2 = ${sqlLiteral(String(card.type_2))} AND value_to_use = ${sqlLiteral(String(card.value_to_use))} AND bonus = ${sqlLiteral(String(card.bonus))} LIMIT 1;`;
    case 'basic-universe':
      return `SELECT id INTO card_id_var FROM basic_universe_cards WHERE name = ${sqlLiteral(name)} AND type = ${sqlLiteral(String(card.type))} AND value_to_use = ${sqlLiteral(String(card.value_to_use))} AND bonus = ${sqlLiteral(String(card.bonus))} LIMIT 1;`;
    default:
      throw new Error(`Unsupported card type for SQL lookup: ${cardType}`);
  }
}

function buildCardInsertBlock(
  bundle: DeckCatalogBundle,
  deckId: string,
  deckCard: DeckCard
): string {
  const catalogCard = findCatalogCard(bundle, deckCard.type, deckCard.cardId);
  const lookup = buildCardLookupSql(catalogCard, deckCard.type);
  const label = String(catalogCard.name ?? catalogCard.card_name ?? deckCard.cardId);
  const insertCols =
    deckCard.exclude_from_draw === true
      ? '(deck_id, card_type, card_id, quantity, exclude_from_draw)'
      : '(deck_id, card_type, card_id, quantity)';
  const insertVals =
    deckCard.exclude_from_draw === true
      ? `(${sqlLiteral(deckId)}, ${sqlLiteral(deckCard.type)}, card_id_var::text, ${deckCard.quantity}, TRUE)`
      : `(${sqlLiteral(deckId)}, ${sqlLiteral(deckCard.type)}, card_id_var::text, ${deckCard.quantity})`;

  return `        -- ${deckCard.type}: ${label}
        ${lookup}
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards ${insertCols}
            VALUES ${insertVals};
        END IF;`;
}

function buildReserveCharacterSql(
  bundle: DeckCatalogBundle,
  reserveCharacterId: string | undefined
): string {
  if (!reserveCharacterId) {
    return 'NULL';
  }
  const card = findCatalogCard(bundle, 'character', reserveCharacterId);
  const lookupName = String(card.name ?? '');
  return `(SELECT id FROM characters WHERE name = ${sqlLiteral(lookupName)} AND set = ${sqlLiteral(String(card.set ?? 'ERB'))} AND COALESCE(is_foil, false) = ${card.is_foil ? 'TRUE' : 'FALSE'} LIMIT 1)`;
}

function buildDeckBlock(bundle: DeckCatalogBundle, snapshot: TournamentDeckSnapshot): string {
  const { deck, cards, stableIndex } = snapshot;
  const deckId = stableDeckId(stableIndex);
  const deckName = deck.name.trim();
  const description = deck.description?.trim() ?? '';
  const isLimited = deck.is_limited === true;
  const isValid = deck.is_valid === true;
  const reserveSql = buildReserveCharacterSql(bundle, deck.reserve_character);

  const cardInserts = cards
    .map((c) => buildCardInsertBlock(bundle, deckId, c))
    .join('\n\n');

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
            ${reserveSql}
        );

${cardInserts}

        RAISE NOTICE 'Seeded tournament deck: %', ${sqlLiteral(deckName)};
    ELSE
        RAISE NOTICE 'Tournament deck already exists; skipping: %', ${sqlLiteral(deckName)};
    END IF;`;
}

function findExistingSeedMigration(): string | null {
  const matches = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^V\d+__Seed_tournament_decks\.sql$/.test(file))
    .sort();
  return matches.length > 0 ? path.join(MIGRATIONS_DIR, matches[matches.length - 1]) : null;
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

async function main(): Promise<void> {
  const dataSource = DataSourceConfig.getInstance();
  const deckRepository = dataSource.getDeckRepository();
  const cardRepository = dataSource.getCardRepository();

  try {
    const bundle = await loadDeckCatalogBundle(cardRepository);
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

    const deckBlocks = snapshots.map((s) => buildDeckBlock(bundle, s));
    const deckManifest = snapshots
      .map((s) => `--   ${stableDeckId(s.stableIndex)}  ${s.deck.name}`)
      .join('\n');

    const sql = `-- Seed tournament winning decks for the Home "Tournament Winners" rail.
-- Generated from local tournament_decks user via scripts/generate-tournament-deck-migration.ts
-- Idempotent: skips decks that tournament_decks already owns by name.
-- Card rows resolve by name/stat columns (portable across environments); deck metadata
-- (card_count, threat, character slots) is populated by V133 triggers on deck_cards INSERT.
--
-- Deck manifest (${snapshots.length} decks):
${deckManifest}

DO $$
DECLARE
    tournament_user_id UUID := '${TOURNAMENT_DECKS_USER_ID}';
    card_id_var TEXT;
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
