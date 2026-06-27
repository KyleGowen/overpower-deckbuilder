#!/usr/bin/env ts-node
import 'dotenv/config';
import { DataSourceConfig } from '../config/DataSourceConfig';
import { DeckValidationService } from '../services/deckValidationService';

/**
 * One-time backfill: recompute decks.is_valid for every deck from its current
 * cards and persist the result. Needed because the column was historically only
 * written when a client explicitly PUT it, so it drifted out of sync with the
 * actual deck contents (causing "Not Legal" tiles and empty community feeds for
 * decks that are actually legal). After this script, the column is authoritative
 * and stays in sync via DeckCardsService / importDeckFromExport on future edits.
 *
 * Usage: npm run backfill:deck-validity
 */
async function main(): Promise<void> {
  const dataSource = DataSourceConfig.getInstance();
  const deckRepository = dataSource.getDeckRepository();
  const cardRepository = dataSource.getCardRepository();
  const validationService = new DeckValidationService(cardRepository);
  const pool = dataSource.getPool();

  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  let failed = 0;

  try {
    const { rows } = await pool.query<{ id: string; is_valid: boolean | null }>(
      'SELECT id, is_valid FROM decks'
    );
    console.log(`Found ${rows.length} deck(s) to evaluate...`);

    for (const row of rows) {
      try {
        const deck = await deckRepository.getDeckById(row.id);
        if (!deck) {
          missing++;
          continue;
        }
        const errors = await validationService.validateDeck(deck.cards ?? []);
        const isValid = errors.length === 0;
        if ((row.is_valid ?? false) !== isValid) {
          await deckRepository.updateDeck(row.id, { is_valid: isValid });
          updated++;
          console.log(`  ${row.id}: is_valid=${isValid}, errors=${errors.length}`);
        } else {
          unchanged++;
        }
      } catch (error) {
        failed++;
        console.error(`  ${row.id}: failed to recompute -`, error instanceof Error ? error.message : error);
      }
    }

    console.log(
      `\nDone. updated=${updated}, unchanged=${unchanged}, missing=${missing}, failed=${failed}`
    );
  } catch (error) {
    console.error('Backfill failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await dataSource.close();
  }
}

main();
