import { cva } from 'class-variance-authority';

export type { DashboardTileVariant } from './dashboardTileSizing';
export { barMaxRowsForVariant, isDashboardRailVariant, pieSizingForVariant } from './dashboardTileSizing';

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
