import type { FoilMapEntry } from '../api/catalog';
import type { CatalogCard } from '../api/types';

export interface FoilCardMapLookup {
  baseToFoil: Map<string, string>;
  foilToBase: Map<string, string>;
}

export function isFoilCard(card: Partial<CatalogCard> | null | undefined): boolean {
  if (!card) return false;
  const v = card.is_foil as unknown;
  return v === true || v === 'true' || v === 1;
}

export function buildFoilCardMapLookup(entries: FoilMapEntry[]): FoilCardMapLookup {
  const baseToFoil = new Map<string, string>();
  const foilToBase = new Map<string, string>();
  for (const { foilCardId, baseCardId } of entries) {
    foilToBase.set(foilCardId, baseCardId);
    baseToFoil.set(baseCardId, foilCardId);
  }
  return { baseToFoil, foilToBase };
}

/**
 * One row per logical card: hide foil duplicates when the base row is in the same catalog list.
 * Foil-only promos (no base row) remain visible.
 */
export function dedupeFoilCatalogCards(cards: CatalogCard[], foilToBase: Map<string, string>): CatalogCard[] {
  const baseIds = new Set(cards.filter((c) => !isFoilCard(c)).map((c) => c.id));
  return cards.filter((card) => {
    if (!isFoilCard(card)) return true;
    const baseId = foilToBase.get(card.id);
    if (!baseId) return true;
    return !baseIds.has(baseId);
  });
}

/** True when the displayed row has a foil variant (base with foil counterpart, or foil-only row). */
export function cardHasFoilVersion(card: CatalogCard, baseToFoil: Map<string, string>): boolean {
  if (isFoilCard(card)) return true;
  return baseToFoil.has(card.id);
}
