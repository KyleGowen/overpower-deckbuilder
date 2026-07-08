import {
  COLUMBUS_DASHBOARD_LAYOUT,
  COLUMBUS_TILE_ORDER,
  dashboardPlacementClass,
  getColumbusDashboardGridPlacements,
  getPlacementForTile,
  getStackedPlacements,
} from '../../../../frontend/src/lib/tournaments/columbusDashboardLayout';

describe('columbusDashboardLayout', () => {
  it('defines 10 tiles in display order', () => {
    expect(COLUMBUS_TILE_ORDER).toHaveLength(10);
    expect(COLUMBUS_DASHBOARD_LAYOUT).toHaveLength(10);
  });

  it('event metadata spans 2 columns on desktop', () => {
    const placement = getPlacementForTile('meta');
    expect(placement.colSpan).toBe(2);
    expect(placement.rowSpan).toBe(1);
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan)).toContain('lg:col-span-2');
  });

  it('character appearances spans 6 columns and 6 rows on desktop', () => {
    const placement = getPlacementForTile('characterAppearances');
    expect(placement.colSpan).toBe(6);
    expect(placement.rowSpan).toBe(6);
    expect(placement.tileVariant).toBe('wide');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan)).toContain('lg:col-span-6');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan)).toContain('lg:row-span-6');
  });

  it('mobile placement is full width', () => {
    expect(dashboardPlacementClass(3, 1)).toContain('col-span-12');
  });

  it('most plays anchors a 4-column top-right stack on the top row', () => {
    const placement = getPlacementForTile('mostPlaysWithoutTop8');
    expect(placement.colSpan).toBe(4);
    expect(placement.rowSpan).toBe(1);
    expect(placement.colStart).toBe(9);
    expect(placement.rowStart).toBe(1);
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-span-4');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:col-start-9');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan, placement)).toContain('lg:row-start-1');
    expect(getStackedPlacements('mostPlaysWithoutTop8').map((child) => child.id)).toEqual([
      'newWinningCharacters',
      'top8Characters',
    ]);
  });

  it('highest top 8 rate stacks under tournament metadata on the dashboard', () => {
    const highestRate = getPlacementForTile('highestTop8Rate');
    expect(highestRate.colSpan).toBe(2);
    expect(highestRate.rowSpan).toBe(1);
    expect(highestRate.stackIn).toBe('meta');
    expect(highestRate.colStart).toBeUndefined();
    expect(highestRate.rowStart).toBeUndefined();
    expect(getStackedPlacements('meta')).toEqual([highestRate]);
    expect(getColumbusDashboardGridPlacements().map((placement) => placement.id)).not.toContain('highestTop8Rate');
  });

  it('new winning characters sits beside most plays in the top-right stack', () => {
    const mostPlays = getPlacementForTile('mostPlaysWithoutTop8');
    const newWinning = getPlacementForTile('newWinningCharacters');
    expect(newWinning.colSpan).toBe(2);
    expect(newWinning.rowSpan).toBe(1);
    expect(newWinning.tileVariant).toBe('sm');
    expect(newWinning.stackIn).toBe('mostPlaysWithoutTop8');
    expect(newWinning.stackRole).toBe('topRow');
    expect(newWinning.colStart).toBeUndefined();
    expect(getColumbusDashboardGridPlacements().map((placement) => placement.id)).not.toContain('newWinningCharacters');
  });

  it('top 8 characters fills the width below the top-right row', () => {
    const placement = getPlacementForTile('top8Characters');
    expect(placement.colSpan).toBe(4);
    expect(placement.rowSpan).toBe(1);
    expect(placement.tileVariant).toBe('sm');
    expect(placement.stackIn).toBe('mostPlaysWithoutTop8');
    expect(placement.stackRole).toBeUndefined();
    expect(placement.colStart).toBeUndefined();
    expect(placement.rowStart).toBeUndefined();
    expect(getColumbusDashboardGridPlacements().map((placement) => placement.id)).not.toContain('top8Characters');
  });

  it('spotlight tiles use sm variant', () => {
    expect(getPlacementForTile('mostPlaysWithoutTop8').tileVariant).toBe('sm');
    expect(getPlacementForTile('highestTop8Rate').tileVariant).toBe('sm');
  });
});
