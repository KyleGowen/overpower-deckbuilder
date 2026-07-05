import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardRailProps {
  children: ReactNode;
  className?: string;
}

/** Horizontal scroll rail — fixed deck-tile column widths (Home). */
export function DashboardRail({ children, className }: DashboardRailProps) {
  return (
    <div
      className={cn(
        'dashboard-rail home__rail home__rail--stats grid grid-flow-col gap-4 overflow-x-auto pb-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface DashboardRailItemProps {
  children: ReactNode;
  className?: string;
}

export function DashboardRailItem({ children, className }: DashboardRailItemProps) {
  return (
    <div className={cn('dashboard-rail__item home__rail-item home__rail-item--stats', className)}>
      {children}
    </div>
  );
}
