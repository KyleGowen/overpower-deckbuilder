/** Tile size tokens shared by dashboard layout helpers and CVA variants. */
export type DashboardTileVariant = 'rail' | 'sm' | 'md' | 'lg' | 'wide' | 'tall';

export function isDashboardRailVariant(variant: DashboardTileVariant): boolean {
  return variant === 'rail';
}

/** Bar chart row cap by tile size on dashboard pages. */
export function barMaxRowsForVariant(variant: DashboardTileVariant, railExpanded = false): number {
  if (variant === 'rail') return railExpanded ? 8 : 5;
  if (variant === 'sm') return 6;
  if (variant === 'md') return 8;
  return 12;
}

/** Pie outer radius (% or px) by tile variant. */
export function pieSizingForVariant(
  variant: DashboardTileVariant,
  portionLabels: boolean,
  fillContainer: boolean,
): { outer: string | number; inner: string | number } {
  if (!fillContainer) {
    return {
      outer: variant === 'rail' ? 58 : 88,
      inner: variant === 'rail' ? 28 : 44,
    };
  }
  if (portionLabels) {
    if (variant === 'rail') return { outer: '42%', inner: '28%' };
    if (variant === 'sm') return { outer: '48%', inner: '30%' };
    return { outer: '58%', inner: '34%' };
  }
  return {
    outer: variant === 'rail' ? '72%' : '62%',
    inner: variant === 'rail' ? '28%' : '36%',
  };
}
