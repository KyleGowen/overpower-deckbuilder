import { cva, type VariantProps } from 'class-variance-authority';

export const dashboardTileVariants = cva('@container flex h-full w-full flex-col overflow-hidden', {
  variants: {
    variant: {
      rail: '',
      sm: '',
      md: '',
      lg: '',
      wide: '',
      tall: '',
    },
  },
  defaultVariants: {
    variant: 'rail',
  },
});

export const dashboardArtVariants = cva(
  'relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden',
  {
    variants: {
      variant: {
        rail: 'aspect-[380/280] flex-none',
        sm: 'min-h-[280px]',
        md: 'min-h-[360px]',
        lg: 'min-h-[420px]',
        wide: 'min-h-[400px]',
        tall: 'min-h-[480px]',
      },
    },
    defaultVariants: {
      variant: 'rail',
    },
  },
);

export const dashboardBodyVariants = cva('flex w-full flex-col gap-1 px-4 pb-4 pt-3', {
  variants: {
    variant: {
      rail: 'min-h-[4.875rem]',
      sm: 'min-h-[4.875rem]',
      md: 'min-h-[5rem]',
      lg: 'min-h-[5rem]',
      wide: 'min-h-[5rem]',
      tall: 'min-h-[5rem]',
    },
    align: {
      center: 'items-center text-center',
      start: 'items-start text-left',
    },
  },
  defaultVariants: {
    variant: 'rail',
    align: 'center',
  },
});

export type DashboardTileVariant = NonNullable<VariantProps<typeof dashboardTileVariants>['variant']>;

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
