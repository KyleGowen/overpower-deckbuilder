import type { CatalogCard } from '../api/types';

export function setCodeForCard(card: Partial<CatalogCard>): string {
  return String(card.set ?? (card.universe as string) ?? 'ERB').trim();
}

export function parseSetNumber(card: Partial<CatalogCard>): number | null {
  const raw = String(card.set_number ?? '').trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/** Primary checklist order: set code, then numeric set_number (unnumbered last). */
export function compareSetThenSetNumber(a: Partial<CatalogCard>, b: Partial<CatalogCard>): number {
  const setCmp = setCodeForCard(a).localeCompare(setCodeForCard(b), undefined, { sensitivity: 'base' });
  if (setCmp !== 0) return setCmp;

  const numA = parseSetNumber(a);
  const numB = parseSetNumber(b);
  if (numA !== null && numB !== null && numA !== numB) return numA - numB;
  if (numA !== null && numB === null) return -1;
  if (numA === null && numB !== null) return 1;

  return 0;
}
