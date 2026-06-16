import type { CatalogType } from '../api/types';

/** Catalog types where Hide Unusables applies (mirrors v1 per-category toggles + aspects validation). */
const USABILITY_CATALOG_TYPES: ReadonlySet<CatalogType> = new Set([
  'special-cards',
  'advanced-universe',
  'power-cards',
  'teamwork',
  'basic-universe',
  'training',
  'ally-universe',
  'events',
  'aspects',
]);

export function catalogTypeSupportsHideUnusables(type: CatalogType): boolean {
  return USABILITY_CATALOG_TYPES.has(type);
}

export function tabSupportsHideUnusables(
  tab: CatalogType | 'all' | 'stacks' | 'missions',
): boolean {
  if (tab === 'stacks' || tab === 'missions') return false;
  if (tab === 'all') return true;
  return catalogTypeSupportsHideUnusables(tab);
}

/** Hide Unusables is inactive on tabs that do not support it (e.g. Stacks). */
export function effectiveHideUnusablesForTab(
  tab: CatalogType | 'all' | 'stacks' | 'missions',
  hideUnusables: boolean,
): boolean {
  return tabSupportsHideUnusables(tab) && hideUnusables;
}
