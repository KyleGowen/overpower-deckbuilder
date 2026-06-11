#!/usr/bin/env ts-node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { DataSourceConfig } from '../src/config/DataSourceConfig';
import { TOURNAMENT_DECKS_USER_ID } from '../src/constants/tournamentDecksUser';
import { importDeckFromExport } from '../src/services/deckExportImport/importDeckFromExport';
import type { ExportDeckJson } from '../src/services/deckExportImport/types';

async function main(): Promise<void> {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: npx ts-node scripts/import-tournament-deck.ts <path-to-export.json>');
    process.exit(1);
  }

  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let exportData: ExportDeckJson;
  try {
    exportData = JSON.parse(fs.readFileSync(filePath, 'utf8')) as ExportDeckJson;
  } catch (error) {
    console.error('Failed to parse export JSON:', error);
    process.exit(1);
  }

  const dataSource = DataSourceConfig.getInstance();
  const deckRepository = dataSource.getDeckRepository();
  const cardRepository = dataSource.getCardRepository();

  try {
    const result = await importDeckFromExport(
      deckRepository,
      cardRepository,
      exportData,
      TOURNAMENT_DECKS_USER_ID
    );

    console.log(`✅ Tournament deck imported: "${result.deckName}" (${result.deckId})`);
    console.log(`   Cards added: ${result.cardsAdded}`);
    if (result.unresolved.length > 0) {
      console.warn(`⚠️  ${result.unresolved.length} card(s) could not be resolved:`);
      for (const card of result.unresolved) {
        console.warn(`   - [${card.type}] ${card.name}`);
      }
      process.exit(2);
    }
  } catch (error) {
    console.error('❌ Import failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await dataSource.close();
  }
}

main();
