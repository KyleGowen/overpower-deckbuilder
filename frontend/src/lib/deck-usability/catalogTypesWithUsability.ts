import type { CatalogType } from '../api/types';
import {
  ADD_CARDS_ANY_CHARACTER_SPECIALS_TAB,
  type CatalogTabSelection,
} from '../catalog/catalogTypeMap';

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

export function tabSupportsHideUnusables(tab: CatalogTabSelection): boolean {
  if (tab === 'stacks' || tab === 'missions') return false;
  if (tab === 'all') return true;
  if (tab === ADD_CARDS_ANY_CHARACTER_SPECIALS_TAB) {
    return catalogTypeSupportsHideUnusables('special-cards');
  }
  return catalogTypeSupportsHideUnusables(tab);
}

/** Hide Unusables is inactive on tabs that do not support it (e.g. Stacks). */
export function effectiveHideUnusablesForTab(
  tab: CatalogTabSelection,
  hideUnusables: boolean,
): boolean {
  return tabSupportsHideUnusables(tab) && hideUnusables;
}
