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
  /** 1-based desktop grid column start (lg breakpoint). */
  colStart?: number;
  /** 1-based desktop grid row start (lg breakpoint). */
  rowStart?: number;
  /** Render inside another tile's grid cell (desktop dashboard only). */
  stackIn?: ColumbusDashboardTileId;
  /** When stacked, place beside the anchor on the top row instead of below it. */
  stackRole?: 'topRow' | 'below';
}

export const COLUMBUS_DASHBOARD_LAYOUT: DashboardLayoutPlacement[] = [
  { id: 'meta', colSpan: 2, rowSpan: 1, tileVariant: 'sm' },
  { id: 'highestTop8Rate', colSpan: 2, rowSpan: 1, tileVariant: 'sm', stackIn: 'meta' },
  { id: 'characterAppearances', colSpan: 6, rowSpan: 6, tileVariant: 'wide' },
  { id: 'mostPlaysWithoutTop8', colSpan: 4, rowSpan: 1, tileVariant: 'sm', colStart: 9, rowStart: 1 },
  { id: 'newWinningCharacters', colSpan: 2, rowSpan: 1, tileVariant: 'sm', stackIn: 'mostPlaysWithoutTop8', stackRole: 'topRow' },
  { id: 'top8Characters', colSpan: 4, rowSpan: 1, tileVariant: 'sm', stackIn: 'mostPlaysWithoutTop8' },
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
  5: 'lg:row-span-5',
  6: 'lg:row-span-6',
  7: 'lg:row-span-7',
  8: 'lg:row-span-8',
  9: 'lg:row-span-9',
  10: 'lg:row-span-10',
  11: 'lg:row-span-11',
  12: 'lg:row-span-12',
};

const ROW_START_CLASS: Record<number, string> = {
  1: 'lg:row-start-1',
  2: 'lg:row-start-2',
  3: 'lg:row-start-3',
  4: 'lg:row-start-4',
  5: 'lg:row-start-5',
  6: 'lg:row-start-6',
  7: 'lg:row-start-7',
  8: 'lg:row-start-8',
  9: 'lg:row-start-9',
  10: 'lg:row-start-10',
  11: 'lg:row-start-11',
  12: 'lg:row-start-12',
};

const COL_START_CLASS: Record<number, string> = {
  1: 'lg:col-start-1',
  2: 'lg:col-start-2',
  3: 'lg:col-start-3',
  4: 'lg:col-start-4',
  5: 'lg:col-start-5',
  6: 'lg:col-start-6',
  7: 'lg:col-start-7',
  8: 'lg:col-start-8',
  9: 'lg:col-start-9',
  10: 'lg:col-start-10',
  11: 'lg:col-start-11',
  12: 'lg:col-start-12',
};

export function dashboardPlacementClass(
  colSpan: number,
  rowSpan: number,
  placement?: Pick<DashboardLayoutPlacement, 'colStart' | 'rowStart'>,
): string {
  return cn(
    'col-span-12',
    COL_SPAN_CLASS[colSpan] ?? 'lg:col-span-12',
    ROW_SPAN_CLASS[rowSpan] ?? '',
    placement?.colStart !== undefined ? COL_START_CLASS[placement.colStart] : undefined,
    placement?.rowStart !== undefined ? ROW_START_CLASS[placement.rowStart] : undefined,
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

export function getColumbusDashboardGridPlacements(): DashboardLayoutPlacement[] {
  return COLUMBUS_DASHBOARD_LAYOUT.filter((placement) => !placement.stackIn);
}

export function getStackedPlacements(
  parentId: ColumbusDashboardTileId,
): DashboardLayoutPlacement[] {
  return COLUMBUS_DASHBOARD_LAYOUT.filter((placement) => placement.stackIn === parentId);
}
