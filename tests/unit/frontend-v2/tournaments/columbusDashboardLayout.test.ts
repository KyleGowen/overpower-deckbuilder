import {
  COLUMBUS_DASHBOARD_BANDS,
  COLUMBUS_DASHBOARD_LAYOUT,
  COLUMBUS_TILE_ORDER,
  dashboardPlacementClass,
  getColumbusDashboardBandTileIds,
  getColumbusDashboardGridPlacements,
  getPlacementForTile,
  getStackedPlacements,
} from '../../../../frontend/src/lib/tournaments/columbusDashboardLayout';

describe('columbusDashboardLayout', () => {
  it('defines 10 tiles in display order', () => {
    expect(COLUMBUS_TILE_ORDER).toHaveLength(10);
    expect(COLUMBUS_DASHBOARD_LAYOUT).toHaveLength(10);
  });

  it('uses explicit grid coordinates with no stacking', () => {
    for (const placement of COLUMBUS_DASHBOARD_LAYOUT) {
      expect(placement.stackIn).toBeUndefined();
      expect(placement.stackRole).toBeUndefined();
      expect(placement.colStart).toBeDefined();
      expect(placement.rowStart).toBeDefined();
    }
    expect(getColumbusDashboardGridPlacements()).toHaveLength(10);
    expect(getStackedPlacements('meta')).toHaveLength(0);
    expect(getStackedPlacements('mostPlaysWithoutTop8')).toHaveLength(0);
  });

  it('bands stack all 10 tiles in column groups without shared row tracks', () => {
    const bandTileIds = getColumbusDashboardBandTileIds();
    expect(bandTileIds).toHaveLength(10);
    expect(new Set(bandTileIds).size).toBe(10);
    expect(COLUMBUS_DASHBOARD_BANDS).toHaveLength(1);
    expect(COLUMBUS_DASHBOARD_BANDS[0]?.columns).toHaveLength(3);
    expect(COLUMBUS_DASHBOARD_BANDS[0]?.columns[0]?.colSpan).toBe(3);
    expect(COLUMBUS_DASHBOARD_BANDS[0]?.columns[1]?.colSpan).toBe(5);
    expect(COLUMBUS_DASHBOARD_BANDS[0]?.columns[0]?.tileIds).toEqual([
      'meta',
      'highestTop8Rate',
      'topHomebases',
      'newTop8Characters',
    ]);
    expect(COLUMBUS_DASHBOARD_BANDS[0]?.columns[2]?.pairFirstRow).toBe(true);
  });

  it('event metadata spans cols 1-2, rows 1-3 on desktop', () => {
    const placement = getPlacementForTile('meta');
    expect(placement).toMatchObject({ colSpan: 2, rowSpan: 3, colStart: 1, rowStart: 1 });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-span-2');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-span-3');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-start-1');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-start-1');
  });

  it('highest top 8 rate spans cols 1-2, rows 4-6 on desktop', () => {
    const placement = getPlacementForTile('highestTop8Rate');
    expect(placement).toMatchObject({ colSpan: 2, rowSpan: 3, colStart: 1, rowStart: 4 });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-start-4');
  });

  it('character appearances spans cols 3-8, rows 1-6 on desktop', () => {
    const placement = getPlacementForTile('characterAppearances');
    expect(placement).toMatchObject({ colSpan: 6, rowSpan: 6, colStart: 3, rowStart: 1, tileVariant: 'wide' });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-span-6');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-span-6');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-start-3');
  });

  it('most plays without top 8 spans cols 9-10, rows 1-3 on desktop', () => {
    const placement = getPlacementForTile('mostPlaysWithoutTop8');
    expect(placement).toMatchObject({ colSpan: 2, rowSpan: 3, colStart: 9, rowStart: 1, tileVariant: 'sm' });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-span-2');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-start-9');
  });

  it('new winning characters spans cols 11-12, rows 1-3 on desktop', () => {
    const placement = getPlacementForTile('newWinningCharacters');
    expect(placement).toMatchObject({ colSpan: 2, rowSpan: 3, colStart: 11, rowStart: 1, tileVariant: 'sm' });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-start-11');
  });

  it('top 8 characters spans cols 9-12, rows 4-8 on desktop', () => {
    const placement = getPlacementForTile('top8Characters');
    expect(placement).toMatchObject({ colSpan: 4, rowSpan: 5, colStart: 9, rowStart: 4, tileVariant: 'tall' });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-span-5');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-start-4');
  });

  it('top homebases spans cols 1-3, rows 7-10 on desktop', () => {
    const placement = getPlacementForTile('topHomebases');
    expect(placement).toMatchObject({ colSpan: 3, rowSpan: 4, colStart: 1, rowStart: 7, tileVariant: 'md' });
  });

  it('top reservists spans cols 4-8, rows 7-10 on desktop', () => {
    const placement = getPlacementForTile('topReservists');
    expect(placement).toMatchObject({ colSpan: 5, rowSpan: 4, colStart: 4, rowStart: 7, tileVariant: 'md' });
  });

  it('top cataclysms spans cols 9-12, rows 9-12 on desktop', () => {
    const placement = getPlacementForTile('topCataclysms');
    expect(placement).toMatchObject({ colSpan: 4, rowSpan: 4, colStart: 9, rowStart: 9, tileVariant: 'md' });
  });

  it('new top 8 characters spans cols 1-3, rows 11-12 on desktop', () => {
    const placement = getPlacementForTile('newTop8Characters');
    expect(placement).toMatchObject({ colSpan: 3, rowSpan: 2, colStart: 1, rowStart: 11, tileVariant: 'sm' });
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-start-11');
  });

  it('mobile placement is full width', () => {
    expect(dashboardPlacementClass(3, 1)).toContain('col-span-12');
  });
});
