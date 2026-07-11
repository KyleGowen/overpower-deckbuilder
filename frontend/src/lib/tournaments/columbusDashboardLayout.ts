import type { DashboardTileVariant } from '../../components/dashboard/dashboardTileSizing';

function joinLayoutClasses(...parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join(' ');
}

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

export interface ColumbusDashboardBandColumn {
  colSpan: number;
  tileIds: ColumbusDashboardTileId[];
  /** Render the first two tile IDs side-by-side on desktop. */
  pairFirstRow?: boolean;
}

export interface ColumbusDashboardBand {
  columns: ColumbusDashboardBandColumn[];
}

/**
 * Desktop dashboard bands — column stacks that pack tiles vertically without
 * shared CSS grid row tracks (avoids dead space from row-span sizing).
 */
export const COLUMBUS_DASHBOARD_BANDS: ColumbusDashboardBand[] = [
  {
    columns: [
      { colSpan: 3, tileIds: ['meta', 'highestTop8Rate', 'topHomebases', 'newTop8Characters'] },
      { colSpan: 5, tileIds: ['characterAppearances', 'topReservists'] },
      {
        colSpan: 4,
        tileIds: [
          'mostPlaysWithoutTop8',
          'newWinningCharacters',
          'top8Characters',
          'topCataclysms',
        ],
        pairFirstRow: true,
      },
    ],
  },
];

/** Wireframe reference placements (col/row spans for docs and tile variants). */
export const COLUMBUS_DASHBOARD_LAYOUT: DashboardLayoutPlacement[] = [
  { id: 'meta', colSpan: 2, rowSpan: 3, tileVariant: 'sm', colStart: 1, rowStart: 1 },
  { id: 'highestTop8Rate', colSpan: 2, rowSpan: 3, tileVariant: 'sm', colStart: 1, rowStart: 4 },
  { id: 'characterAppearances', colSpan: 6, rowSpan: 6, tileVariant: 'wide', colStart: 3, rowStart: 1 },
  { id: 'mostPlaysWithoutTop8', colSpan: 2, rowSpan: 3, tileVariant: 'sm', colStart: 9, rowStart: 1 },
  { id: 'newWinningCharacters', colSpan: 2, rowSpan: 3, tileVariant: 'sm', colStart: 11, rowStart: 1 },
  { id: 'top8Characters', colSpan: 4, rowSpan: 5, tileVariant: 'tall', colStart: 9, rowStart: 4 },
  { id: 'topHomebases', colSpan: 3, rowSpan: 4, tileVariant: 'md', colStart: 1, rowStart: 7 },
  { id: 'topReservists', colSpan: 5, rowSpan: 4, tileVariant: 'md', colStart: 4, rowStart: 7 },
  { id: 'topCataclysms', colSpan: 4, rowSpan: 4, tileVariant: 'md', colStart: 9, rowStart: 9 },
  { id: 'newTop8Characters', colSpan: 3, rowSpan: 2, tileVariant: 'sm', colStart: 1, rowStart: 11 },
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

export function columbusColumnSpanClass(colSpan: number): string {
  return joinLayoutClasses('col-span-12', COL_SPAN_CLASS[colSpan] ?? 'lg:col-span-12');
}

export function getColumbusDashboardBandTileIds(): ColumbusDashboardTileId[] {
  return COLUMBUS_DASHBOARD_BANDS.flatMap((band) => band.columns.flatMap((column) => column.tileIds));
}

export function dashboardPlacementClass(
  colSpan: number,
  rowSpan: number,
  placement?: Pick<DashboardLayoutPlacement, 'colStart' | 'rowStart'>,
): string {
  return joinLayoutClasses(
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
