import { fetchCatalog } from '../api/catalog';
import type { CatalogCard, CatalogType } from '../api/types';
import { CATALOG_TYPES } from '../catalog/catalogTypeMap';
import { buildImportCatalogMap } from './resolveImportCardIds';

export async function fetchAllCatalogsForImport(): Promise<
  Partial<Record<CatalogType, CatalogCard[]>>
> {
  const entries = await Promise.all(
    CATALOG_TYPES.map(async (meta) => [meta.type, await fetchCatalog(meta.type)] as const),
  );
  return Object.fromEntries(entries) as Partial<Record<CatalogType, CatalogCard[]>>;
}

export async function loadImportCatalogMap() {
  return buildImportCatalogMap(await fetchAllCatalogsForImport());
}
