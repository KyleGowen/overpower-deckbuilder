import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { dashboardPlacementClass } from '@/lib/tournaments/columbusDashboardLayout';

export interface DashboardGridItem {
  id: string;
  colSpan: number;
  rowSpan: number;
  colStart?: number;
  rowStart?: number;
  node: ReactNode;
}

interface DashboardGridProps {
  items: DashboardGridItem[];
  className?: string;
}

export function DashboardGrid({ items, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'dashboard-grid grid grid-cols-1 items-start gap-4 auto-rows-min lg:grid-cols-12',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'dashboard-grid__item min-h-0',
            dashboardPlacementClass(item.colSpan, item.rowSpan, {
              colStart: item.colStart,
              rowStart: item.rowStart,
            }),
          )}
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}
