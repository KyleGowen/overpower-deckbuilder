# DashboardGrid — tournament data dashboards

Reusable **12-column dashboard layout** for full tournament stat pages (Datadog-style variable tile sizes). Home rails use **`DashboardRail`** instead (uniform deck-tile columns).

## Components

| Export | Role |
|--------|------|
| `DashboardGrid` | Places tiles on `lg:grid-cols-12`; mobile stacks `col-span-12` |
| `DashboardRail` | Horizontal scroll; `grid-auto-columns: clamp(230px, 25%, 280px)` |
| `DashboardRailItem` | Single rail slot wrapper |
| `DashboardTile` | shadcn `Card` shell + art/body zones |
| `dashboardTileVariants` | CVA size tokens (`rail`, `sm`, `md`, `lg`, `wide`, `tall`) |

## Layout config pattern

Each tournament page defines a layout file, e.g. [`columbusDashboardLayout.ts`](../../lib/tournaments/columbusDashboardLayout.ts):

```ts
export const COLUMBUS_DASHBOARD_LAYOUT = [
  { id: 'meta', colSpan: 4, rowSpan: 2, tileVariant: 'sm' },
  { id: 'characterAppearances', colSpan: 8, rowSpan: 2, tileVariant: 'wide' },
  // ...
];
```

Tile **content** is built in [`buildColumbusStatsTiles.tsx`](../../lib/tournaments/buildColumbusStatsTiles.tsx) via `buildColumbusTileById(id, options)`.

## Wiring a new tournament page

1. Add static stats JSON under `frontend/src/data/tournaments/`.
2. Copy `columbusDashboardLayout.ts` → `yourEventDashboardLayout.ts` (adjust spans/variants).
3. Copy `buildColumbusStatsTiles.tsx` or generalize tile builder with your stats shape.
4. Add route + page component; render `<DashboardGrid items={...} />`.
5. Home rail: reuse the same tile builder with `variant: 'rail'` and wrap in `DashboardRail`.

## Tile size variants

| Variant | Home rail | Dashboard use |
|---------|-----------|---------------|
| `rail` | Yes — fixed 380×280 art + 4.875rem body | — |
| `sm` | — | Spotlights, pies, placard |
| `md` | — | Standard charts |
| `lg` / `wide` / `tall` | — | Tall bar lists, wide meta charts |

Charts read `tileVariant` for `maxRows`, pie radius, and compact ticks.

## Docs

- shadcn setup: [`docs/current/SHADCN_UI.md`](../../../../docs/current/SHADCN_UI.md)
- Visual spec: [`STYLE_GUIDE_V2.md`](../../../../STYLE_GUIDE_V2.md) § Columbus Regional
- Chart tiles: [`TournamentCharts.md`](../TournamentCharts/TournamentCharts.md)
