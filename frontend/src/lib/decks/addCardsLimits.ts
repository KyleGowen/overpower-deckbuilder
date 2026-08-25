import type { CatalogCard } from '../api/types';
import { isOnePerDeckCatalogCard } from './deckCardControls';

/**
 * Add Cards quantity ceiling for one catalog tile. Structural count rules such
 * as Location and Battleground limits are legality concerns, so the editor lets
 * users exceed them and surfaces the resulting invalid deck state.
 */
export function maxCopiesForAddCards(card: CatalogCard): number {
  return isOnePerDeckCatalogCard(card) ? 1 : 99;
}
