import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '../icons';
import './Pagination.css';

interface PaginationProps {
  page: number; // 1-based
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function buildPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

export function Pagination({ page, pageSize, totalItems, onPageChange, className = '' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const firstItem = totalItems === 0 ? 0 : (current - 1) * pageSize + 1;
  const lastItem = Math.min(current * pageSize, totalItems);
  const pages = buildPages(current, totalPages);

  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== current) onPageChange(next);
  };

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination__controls" role="navigation" aria-label="Pagination">
        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(1)}
          disabled={current === 1}
          aria-label="First page"
        >
          <IconChevronsLeft />
        </button>
        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          <IconChevronLeft />
        </button>

        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="pagination__ellipsis" aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination__btn pagination__btn--page ${p === current ? 'is-active' : ''}`}
              onClick={() => go(p)}
              aria-current={p === current ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          <IconChevronRight />
        </button>
        <button
          type="button"
          className="pagination__btn"
          onClick={() => go(totalPages)}
          disabled={current === totalPages}
          aria-label="Last page"
        >
          <IconChevronsRight />
        </button>
      </div>
      <div className="pagination__summary">
        Showing {firstItem}-{lastItem} of {totalItems.toLocaleString()}
      </div>
    </div>
  );
}
