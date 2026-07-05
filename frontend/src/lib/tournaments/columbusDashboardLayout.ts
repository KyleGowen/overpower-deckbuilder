import { cn } from '../../lib/utils';
import type { DashboardTileVariant } from '../../components/dashboard/dashboardTileVariants';

export type ColumbusDashboardTileId =
  | 'meta'
  | 'characterAppearances'
  | 'top8Characters'
  | 'mostPlaysWithoutTop8'
  | 'highestTop8Rate'
  | 'newWinningCharacters'
  | 'newTop8Characters'
  | 'topReservists'
  | 'topHomebases'
  | 'topCataclysms';

export interface DashboardLayoutPlacement {
  id: ColumbusDashboardTileId;
  colSpan: number;
  rowSpan: number;
  tileVariant: DashboardTileVariant;
}

export const COLUMBUS_DASHBOARD_LAYOUT: DashboardLayoutPlacement[] = [
  { id: 'meta', colSpan: 4, rowSpan: 2, tileVariant: 'sm' },
  { id: 'characterAppearances', colSpan: 8, rowSpan: 2, tileVariant: 'wide' },
  { id: 'top8Characters', colSpan: 4, rowSpan: 2, tileVariant: 'md' },
  { id: 'mostPlaysWithoutTop8', colSpan: 3, rowSpan: 1, tileVariant: 'sm' },
  { id: 'highestTop8Rate', colSpan: 3, rowSpan: 1, tileVariant: 'sm' },
  { id: 'newWinningCharacters', colSpan: 3, rowSpan: 1, tileVariant: 'sm' },
  { id: 'newTop8Characters', colSpan: 3, rowSpan: 1, tileVariant: 'sm' },
  { id: 'topReservists', colSpan: 6, rowSpan: 2, tileVariant: 'md' },
  { id: 'topHomebases', colSpan: 6, rowSpan: 2, tileVariant: 'md' },
  { id: 'topCataclysms', colSpan: 4, rowSpan: 2, tileVariant: 'md' },
];

const COL_SPAN_CLASS: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

const ROW_SPAN_CLASS: Record<number, string> = {
  1: '',
  2: 'lg:row-span-2',
  3: 'lg:row-span-3',
  4: 'lg:row-span-4',
};

export function dashboardPlacementClass(colSpan: number, rowSpan: number): string {
  return cn(
    'col-span-12',
    COL_SPAN_CLASS[colSpan] ?? 'lg:col-span-12',
    ROW_SPAN_CLASS[rowSpan] ?? '',
  );
}

export function getPlacementForTile(id: ColumbusDashboardTileId): DashboardLayoutPlacement {
  const placement = COLUMBUS_DASHBOARD_LAYOUT.find((p) => p.id === id);
  if (!placement) {
    throw new Error(`Unknown dashboard tile id: ${id}`);
  }
  return placement;
}

export const COLUMBUS_TILE_ORDER: ColumbusDashboardTileId[] = COLUMBUS_DASHBOARD_LAYOUT.map(
  (p) => p.id,
);
