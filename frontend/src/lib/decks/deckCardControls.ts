import type { CatalogCard, DeckCardType } from '../api/types';

const SINGLE_COPY_DECK_TYPES = new Set<DeckCardType>(['character', 'location', 'mission']);

/** Character, location, and mission rows are single-copy — trash only, no stepper. */
export function deckCardUsesTrashOnlyRemoval(deckType: DeckCardType): boolean {
  return SINGLE_COPY_DECK_TYPES.has(deckType);
}

export function isOnePerDeckCatalogCard(card?: CatalogCard | null): boolean {
  return Boolean(card?.one_per_deck || card?.is_one_per_deck);
}

/** Max quantity for the deck-editor stepper (OPD catalog cards cap at 1). */
export function deckCardQuantityMax(
  deckType: DeckCardType,
  catalogCard?: CatalogCard | null,
): number {
  if (deckCardUsesTrashOnlyRemoval(deckType)) return 1;
  return isOnePerDeckCatalogCard(catalogCard) ? 1 : 99;
}
