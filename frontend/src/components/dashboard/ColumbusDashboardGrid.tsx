import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import {
  getColumbusDashboardBands,
  columbusColumnSpanClass,
  type ColumbusDashboardTileId,
} from '@/lib/tournaments/columbusDashboardLayout';

interface ColumbusDashboardGridProps {
  renderTile: (id: ColumbusDashboardTileId) => ReactNode;
  className?: string;
}

export function ColumbusDashboardGrid({ renderTile, className }: ColumbusDashboardGridProps) {
  const { isMobile } = useLayoutMode();
  const bands = getColumbusDashboardBands(isMobile);

  return (
    <div className={cn('columbus-dashboard flex flex-col', className)}>
      {bands.map((band, bandIndex) => (
        <div
          key={`band-${bandIndex}`}
          className="columbus-dashboard__band grid grid-cols-1 gap-x-4 lg:grid-cols-12 lg:items-start"
        >
          {band.columns.map((column) => {
            const columnKey = column.tileIds.join('-');
            const columnStackClass = 'flex flex-col gap-y-3';
            const usePairFirstRow = !isMobile && column.pairFirstRow;

            if (usePairFirstRow && column.tileIds.length >= 2) {
              const [first, second, ...rest] = column.tileIds;
              return (
                <div
                  key={columnKey}
                  className={cn('columbus-dashboard__column', columnStackClass, columbusColumnSpanClass(column.colSpan))}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                    <div className="min-h-0">{renderTile(first)}</div>
                    <div className="min-h-0">{renderTile(second)}</div>
                  </div>
                  {rest.map((id) => (
                    <div key={id} className="min-h-0">
                      {renderTile(id)}
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div
                key={columnKey}
                className={cn(
                  'columbus-dashboard__column min-h-0',
                  columbusColumnSpanClass(column.colSpan),
                  column.tileIds.length > 1 ? columnStackClass : undefined,
                )}
              >
                {column.tileIds.map((id) => (
                  <div key={id} className="min-h-0">
                    {renderTile(id)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
