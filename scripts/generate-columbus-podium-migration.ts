#!/usr/bin/env ts-node
/**
 * Fetches Columbus S1 podium decks from production API and writes:
 * - data/seeds/tournament-decks/*.json (v2 export snapshots)
 * - migrations/V309__Seed_columbus_podium_decks.sql (prod-stable deck UUIDs)
 *
 * Usage: npx ts-node scripts/generate-columbus-podium-migration.ts
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { TOURNAMENT_DECKS_USER_ID } from '../src/constants/tournamentDecksUser';
import type { DeckCard } from '../src/types';

const PROD_BASE = 'https://excelsior.cards/api/v1';

const PODIUM_DECKS = [
  {
    id: '81d73769-e987-4c85-a9f8-6629980a1807',
    slug: 's1-columbus-1st-justin-sadaie',
  },
  {
    id: 'a6df76ba-c073-4e65-bc68-2046ee3919b1',
    slug: 's1-columbus-2nd-noor-el-barrad',
  },
  {
    id: 'bb9a2144-9c15-4cb3-9c38-851e66972c74',
    slug: 's1-columbus-3rd-charlie-hanford',
  },
] as const;

interface ProdDeckCard {
  type: string;
  cardId: string;
  quantity: number;
}

interface ProdDeckResponse {
  data: {
    metadata: {
      id: string;
      name: string;
      description: string | null;
      reserve_character: string | null;
      is_valid: boolean;
      is_limited: boolean;
    };
    cards: ProdDeckCard[];
  };
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

function sqlEq(column: string, value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return `${column} IS NULL`;
  }
  if (value === '') {
    return `COALESCE(${column}, '') = ''`;
  }
  return `${column} = ${sqlLiteral(value)}`;
}

async function fetchProdCatalog(type: string): Promise<Record<string, unknown>[]> {
  const routeMap: Record<string, string> = {
    character: 'characters',
    special: 'special-cards',
    power: 'power-cards',
    location: 'locations',
    mission: 'missions',
    event: 'events',
    aspect: 'aspects',
    'advanced-universe': 'advanced-universe',
    teamwork: 'teamwork',
    'ally-universe': 'ally-universe',
    training: 'training',
    'basic-universe': 'basic-universe',
  };
  const route = routeMap[type];
  if (!route) {
    throw new Error(`Unknown catalog type: ${type}`);
  }
  const res = await fetch(`${PROD_BASE}/catalog/${route}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch prod catalog ${route}: ${res.status}`);
  }
  const body = (await res.json()) as { data: Record<string, unknown>[] };
  return body.data;
}

async function buildProdCatalogMaps(): Promise<Map<string, Record<string, unknown>>> {
  const types = [
    'character',
    'special',
    'power',
    'location',
    'mission',
    'event',
    'aspect',
    'advanced-universe',
    'teamwork',
    'ally-universe',
    'training',
    'basic-universe',
  ];
  const map = new Map<string, Record<string, unknown>>();
  for (const type of types) {
    const cards = await fetchProdCatalog(type);
    for (const card of cards) {
      const id = String(card.id ?? '');
      if (id) {
        map.set(`${type}:${id}`, card);
      }
    }
  }
  return map;
}

function findProdCatalogCard(
  prodCatalog: Map<string, Record<string, unknown>>,
  cardType: string,
  cardId: string
): Record<string, unknown> {
  const card = prodCatalog.get(`${cardType}:${cardId}`);
  if (!card) {
    throw new Error(`Prod catalog miss: [${cardType}] id=${cardId}`);
  }
  return card;
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
      return `SELECT id INTO card_id_var FROM missions WHERE name = ${sqlLiteral(name)} AND mission_set = ${sqlLiteral(String(card.mission_set))} LIMIT 1;`;
    case 'event':
      return `SELECT id INTO card_id_var FROM events WHERE name = ${sqlLiteral(name)} AND mission_set = ${sqlLiteral(String(card.mission_set))} LIMIT 1;`;
    case 'aspect':
      return `SELECT id INTO card_id_var FROM aspects WHERE name = ${sqlLiteral(name)} LIMIT 1;`;
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
  prodCatalog: Map<string, Record<string, unknown>>,
  deckId: string,
  deckCard: DeckCard
): string {
  const catalogCard = findProdCatalogCard(prodCatalog, deckCard.type, deckCard.cardId);
  const lookup = buildCardLookupSql(catalogCard, deckCard.type);
  const label = String(catalogCard.name ?? catalogCard.card_name ?? deckCard.cardId);
  return `        -- ${deckCard.type}: ${label}
        ${lookup}
        IF card_id_var IS NOT NULL THEN
            INSERT INTO deck_cards (deck_id, card_type, card_id, quantity)
            VALUES (${sqlLiteral(deckId)}, ${sqlLiteral(deckCard.type)}, card_id_var::text, ${deckCard.quantity});
        END IF;`;
}

function buildReserveCharacterSql(
  prodCatalog: Map<string, Record<string, unknown>>,
  reserveCharacterId: string | null | undefined
): string {
  if (!reserveCharacterId) {
    return 'NULL';
  }
  const card = findProdCatalogCard(prodCatalog, 'character', reserveCharacterId);
  const lookupName = String(card.name ?? '');
  return `(SELECT id FROM characters WHERE name = ${sqlLiteral(lookupName)} AND set = ${sqlLiteral(String(card.set ?? 'ERB'))} AND COALESCE(is_foil, false) = ${card.is_foil ? 'TRUE' : 'FALSE'} LIMIT 1)`;
}

async function fetchProdDeck(deckId: string): Promise<ProdDeckResponse> {
  const res = await fetch(`${PROD_BASE}/decks/${deckId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch deck ${deckId}: ${res.status}`);
  }
  return res.json() as Promise<ProdDeckResponse>;
}

async function main(): Promise<void> {
  try {
    const prodCatalog = await buildProdCatalogMaps();
    const seedsDir = path.join(__dirname, '..', 'data', 'seeds', 'tournament-decks');
    fs.mkdirSync(seedsDir, { recursive: true });

    const deckBlocks: string[] = [];
    const manifest: string[] = [];

    for (const podium of PODIUM_DECKS) {
      const response = await fetchProdDeck(podium.id);
      const { metadata, cards } = response.data;
      const deckName = metadata.name.trim();
      manifest.push(`--   ${podium.id}  ${deckName}`);

      const deckCards: DeckCard[] = cards.map((card, index) => ({
        id: `import-${index}`,
        deckId: podium.id,
        type: card.type as DeckCard['type'],
        cardId: card.cardId,
        quantity: card.quantity,
      }));

      const seedPath = path.join(seedsDir, `${podium.slug}.json`);
      fs.writeFileSync(
        seedPath,
        JSON.stringify(
          {
            prod_deck_id: podium.id,
            name: deckName,
            description: metadata.description ?? '',
            reserve_character: metadata.reserve_character,
            is_valid: metadata.is_valid,
            is_limited: metadata.is_limited,
            cards,
          },
          null,
          2,
        ),
        'utf8',
      );

      const cardInserts = deckCards
        .map((c) => buildCardInsertBlock(prodCatalog, podium.id, c))
        .join('\n\n');

      const reserveSql = buildReserveCharacterSql(prodCatalog, metadata.reserve_character ?? undefined);

      deckBlocks.push(`    -- ${podium.slug}
    IF NOT EXISTS (
        SELECT 1 FROM decks
        WHERE id = ${sqlLiteral(podium.id)}::uuid
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
            ${sqlLiteral(podium.id)}::uuid,
            tournament_user_id,
            ${sqlLiteral(deckName)},
            ${sqlOptionalLiteral(metadata.description?.trim() ?? '')},
            NOW(),
            NOW(),
            FALSE,
            ${metadata.is_limited ? 'TRUE' : 'FALSE'},
            ${metadata.is_valid ? 'TRUE' : 'FALSE'},
            0,
            0,
            ${reserveSql}
        );

${cardInserts}

        RAISE NOTICE 'Seeded Columbus podium deck: %', ${sqlLiteral(deckName)};
    ELSE
        RAISE NOTICE 'Columbus podium deck already exists; skipping: %', ${sqlLiteral(deckName)};
    END IF;`);
    }

    const sql = `-- Seed Columbus S1 podium decks for tournament_decks (prod-stable UUIDs).
-- Generated via scripts/generate-columbus-podium-migration.ts
-- Idempotent: skips when deck id already exists.
--
-- Deck manifest:
${manifest.join('\n')}

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

    const outputPath = path.join(__dirname, '..', 'migrations', 'V309__Seed_columbus_podium_decks.sql');
    fs.writeFileSync(outputPath, sql, 'utf8');
    console.log(`✅ Wrote ${outputPath}`);
    console.log(`✅ Wrote ${PODIUM_DECKS.length} seed JSON files to ${seedsDir}`);
  } catch (error) {
    console.error('❌ Generation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
