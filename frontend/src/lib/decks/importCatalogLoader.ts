import type { QueryClient } from '@tanstack/react-query';
import { fetchCatalog } from '../api/catalog';
import type { CatalogCard, CatalogType } from '../api/types';
import { CATALOG_TYPES } from '../catalog/catalogTypeMap';
import { buildImportCatalogMap } from './resolveImportCardIds';

export async function fetchAllCatalogsForImport(
  queryClient: QueryClient,
): Promise<Partial<Record<CatalogType, CatalogCard[]>>> {
  const entries = await Promise.all(
    CATALOG_TYPES.map(async (meta) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['catalog', meta.type],
        queryFn: () => fetchCatalog(meta.type),
        staleTime: 30 * 60 * 1000,
      });
      return [meta.type, data] as const;
    }),
  );
  return Object.fromEntries(entries) as Partial<Record<CatalogType, CatalogCard[]>>;
}

export async function loadImportCatalogMap(queryClient: QueryClient) {
  return buildImportCatalogMap(await fetchAllCatalogsForImport(queryClient));
}
