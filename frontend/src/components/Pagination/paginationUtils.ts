export const MAX_COLLAPSED_PAGE_SLOTS = 7;

export type PageSlot =
  | { type: 'page'; value: number }
  | { type: 'ellipsis' }
  | { type: 'empty' };

export function buildPages(current: number, total: number): (number | 'ellipsis')[] {
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

export function normalizePageSlots(current: number, totalPages: number): PageSlot[] {
  const pages = buildPages(current, totalPages);
  const slots: PageSlot[] = pages.map((p) =>
    p === 'ellipsis' ? { type: 'ellipsis' } : { type: 'page', value: p },
  );

  if (totalPages <= MAX_COLLAPSED_PAGE_SLOTS) return slots;

  const deficit = MAX_COLLAPSED_PAGE_SLOTS - slots.length;
  const padStart = Math.floor(deficit / 2);
  const padEnd = deficit - padStart;
  const empty: PageSlot = { type: 'empty' };

  return [...Array.from({ length: padStart }, () => empty), ...slots, ...Array.from({ length: padEnd }, () => empty)];
}
