# Pagination

Client-side pagination control. Catalog and collection data is fetched in full and
paginated in the browser, so this drives a local `page` state.

## Props
| Prop | Type | Notes |
|---|---|---|
| `page` | `number` | Current page (1-based). |
| `pageSize` | `number` | Items per page. |
| `totalItems` | `number` | Total filtered item count. |
| `onPageChange` | `(page) => void` | Page change callback (clamped to range). |

## Behavior
- First / Prev / numbered / Next / Last buttons; numbered pages collapse with ellipses when
  there are more than 7 pages.
- When collapsed (`totalPages > 7`), the page-number strip uses a **fixed 7-slot width**
  (`.pagination__pages--collapsed`) with symmetric invisible placeholders so **next/prev
  chevrons do not shift** while clicking through pages.
- Shows a "Showing X–Y of N" summary.
- `role="navigation"` + `aria-label="Pagination"`, `aria-current="page"` on the active page.

## Exported helpers
- `buildPages(current, total)` — ellipsis collapse algorithm.
- `normalizePageSlots(current, totalPages)` — pads to 7 slots when collapsed.
- `MAX_COLLAPSED_PAGE_SLOTS` — `7`.
