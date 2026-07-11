import {
  barMaxRowsForVariant,
  pieSizingForVariant,
} from '../../../../frontend/src/components/dashboard/dashboardTileSizing';

describe('dashboardTileVariants', () => {
  it('rail bar charts cap at 5 rows on home', () => {
    expect(barMaxRowsForVariant('rail', false)).toBe(5);
    expect(barMaxRowsForVariant('rail', true)).toBe(8);
  });

  it('wide dashboard tiles allow more bar rows', () => {
    expect(barMaxRowsForVariant('wide', false)).toBe(12);
  });

  it('pie sizing grows on dashboard tiles', () => {
    expect(pieSizingForVariant('rail', true, true).outer).toBe('42%');
    expect(pieSizingForVariant('md', true, true).outer).toBe('58%');
  });
});
