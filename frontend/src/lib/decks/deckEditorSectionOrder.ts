import type { DeckCardType } from '../api/types';
import { CATALOG_TYPES, type CatalogTypeMeta } from '../catalog/catalogTypeMap';

/**
 * Deck editor Card/List section order (deck editor only — DBV and Add Cards use CATALOG_TYPES).
 * Characters → Location/Battleground → Special → Power → Mission → Event → (universe types).
 */
export const DECK_EDITOR_SECTION_ORDER: readonly DeckCardType[] = [
  'character',
  'location',
  'battleground',
  'special',
  'power',
  'mission',
  'event',
  'aspect',
  'advanced-universe',
  'teamwork',
  'ally-universe',
  'training',
  'basic-universe',
] as const;

const deckTypeToMeta = new Map(CATALOG_TYPES.map((meta) => [meta.deckType, meta]));

/** CatalogTypeMeta rows in deck-editor section order. */
export function deckEditorCatalogTypes(): CatalogTypeMeta[] {
  return DECK_EDITOR_SECTION_ORDER.map((deckType) => {
    const meta = deckTypeToMeta.get(deckType);
    if (!meta) {
      throw new Error(`Unknown deck type in DECK_EDITOR_SECTION_ORDER: ${deckType}`);
    }
    return meta;
  });
}

/** Sort key for deck section order; unknown types sort last. */
export function deckEditorSectionIndex(deckType: string): number {
  const idx = DECK_EDITOR_SECTION_ORDER.indexOf(deckType as DeckCardType);
  return idx === -1 ? DECK_EDITOR_SECTION_ORDER.length : idx;
}
