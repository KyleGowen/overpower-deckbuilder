import type { CatalogCard } from '../api/types';
import { cardDisplayName } from './catalogTypeMap';
import { isFoilCard } from './foilCatalog';

function setCodeForCard(card: Partial<CatalogCard>): string {
  return String(card.set ?? (card.universe as string) ?? 'ERB').trim();
}

function parseSetNumber(card: Partial<CatalogCard>): number | null {
  const raw = String(card.set_number ?? '').trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Checklist sort for All-tab lists: set code, non-foil before foil, set_number, then name.
 * Mirrors legacy `sortAllCardsData` in public/js/all-cards-display.js.
 */
export function compareAllCatalogCards(a: CatalogCard, b: CatalogCard): number {
  const setCmp = setCodeForCard(a).localeCompare(setCodeForCard(b), undefined, { sensitivity: 'base' });
  if (setCmp !== 0) return setCmp;

  const aFoil = isFoilCard(a);
  const bFoil = isFoilCard(b);
  if (aFoil !== bFoil) return aFoil ? 1 : -1;

  const numA = parseSetNumber(a);
  const numB = parseSetNumber(b);
  if (numA !== null && numB !== null && numA !== numB) return numA - numB;
  if (numA !== null && numB === null) return -1;
  if (numA === null && numB !== null) return 1;

  return cardDisplayName(a).localeCompare(cardDisplayName(b), undefined, { sensitivity: 'base' });
}

export function sortAllCatalogCards(cards: CatalogCard[]): CatalogCard[] {
  return [...cards].sort(compareAllCatalogCards);
}
