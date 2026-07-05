import {
  COLUMBUS_DASHBOARD_LAYOUT,
  COLUMBUS_TILE_ORDER,
  dashboardPlacementClass,
  getPlacementForTile,
} from '../../../../frontend/src/lib/tournaments/columbusDashboardLayout';

describe('columbusDashboardLayout', () => {
  it('defines 10 tiles in display order', () => {
    expect(COLUMBUS_TILE_ORDER).toHaveLength(10);
    expect(COLUMBUS_DASHBOARD_LAYOUT).toHaveLength(10);
  });

  it('character appearances spans 8 columns on desktop', () => {
    const placement = getPlacementForTile('characterAppearances');
    expect(placement.colSpan).toBe(8);
    expect(placement.rowSpan).toBe(2);
    expect(placement.tileVariant).toBe('wide');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan)).toContain('lg:col-span-8');
    expect(dashboardPlacementClass(placement.colSpan, placement.rowSpan)).toContain('lg:row-span-2');
  });

  it('mobile placement is full width', () => {
    expect(dashboardPlacementClass(3, 1)).toContain('col-span-12');
  });

  it('spotlight tiles use sm variant', () => {
    expect(getPlacementForTile('mostPlaysWithoutTop8').tileVariant).toBe('sm');
    expect(getPlacementForTile('highestTop8Rate').tileVariant).toBe('sm');
  });
});
