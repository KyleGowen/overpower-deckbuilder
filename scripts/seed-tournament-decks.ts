#!/usr/bin/env ts-node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSourceConfig } from '../src/config/DataSourceConfig';
import { TOURNAMENT_DECKS_USER_ID } from '../src/constants/tournamentDecksUser';
import { importDeckFromExport } from '../src/services/deckExportImport/importDeckFromExport';
import type { ExportDeckJson } from '../src/services/deckExportImport/types';

const SEED_DIR = path.join(__dirname, '..', 'data', 'seeds', 'tournament-decks');
const SEED_FILES = [
  '2025-nationals-4th-felipe-cagno.json',
  '2026-nationals-andrew-taylor.json',
];

async function main(): Promise<void> {
  const dataSource = DataSourceConfig.getInstance();
  const deckRepository = dataSource.getDeckRepository();
  const cardRepository = dataSource.getCardRepository();

  try {
    const existing = await deckRepository.getDecksByUserId(TOURNAMENT_DECKS_USER_ID);
    if (existing.length > 0) {
      console.log(
        `✅ tournament_decks already owns ${existing.length} deck(s); skipping seed`
      );
      return;
    }

    for (const file of SEED_FILES) {
      const filePath = path.join(SEED_DIR, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Seed file not found: ${filePath}`);
      }
      const exportData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ExportDeckJson;
      const result = await importDeckFromExport(
        deckRepository,
        cardRepository,
        exportData,
        TOURNAMENT_DECKS_USER_ID
      );
      console.log(`✅ Seeded "${result.deckName}" (${result.deckId}) — ${result.cardsAdded} cards`);
      if (result.unresolved.length > 0) {
        console.warn(`⚠️  Unresolved cards in ${file}:`);
        for (const card of result.unresolved) {
          console.warn(`   - [${card.type}] ${card.name}`);
        }
        process.exit(2);
      }
    }
  } catch (error) {
    console.error('❌ Seed failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await dataSource.close();
  }
}

main();
