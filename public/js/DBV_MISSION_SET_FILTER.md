# DBV mission set filter (reusable component)

Vanilla JS component for the Card Database View **Missions** and **Events** tabs: the **Mission set** `<select>` (**All** + sorted distinct `mission_set` values). **Filter math** stays in [`search-filter-functions.js`](search-filter-functions.js); this module standardizes **DOM shape**, **options population**, and **`change` → `applyMissionFilters` / `applyEventsFilters`**.

## Source files

| File | Role |
|------|------|
| [`dbv-mission-set-filter.js`](dbv-mission-set-filter.js) | Presets, `initDbvMissionSetFilters()`, `populateMissionsMissionSetSelect`, `populateEventsMissionSetSelect` on `window` |

## HTML contract

Hosts keep outer **classes** (e.g. `.missions-mobile-set-row`, `.events-mobile-set-row`). Only **`data-dbv-mission-set-filter`** and **children** are owned by the initializer.

```html
<div class="missions-mobile-set-row" data-dbv-mission-set-filter="missions"></div>
<div class="events-mobile-set-row" data-dbv-mission-set-filter="events"></div>
```

### Preset keys (`data-dbv-mission-set-filter`)

| Preset | Generated ids / notes |
|--------|----------------------|
| `missions` | `#missions-mission-set-filter`, label `for` + `.missions-mobile-set-label` |
| `events` | `#events-mission-set-filter`, `.events-mobile-set-select-clear-row`, `#clear-events-filters-mobile` (click → `window.clearEventsFilters`, no inline `onclick`) |

Stable **ids** are required for `applyMissionFilters` / `applyEventsFilters`, [`filter-functions.js`](filter-functions.js) clears, and [`search-filter.js`](search-filter.js) global reset.

## Load order

In [`public/index.html`](../index.html) (and any page that includes the DBV tables):

1. `dbv-icon-filter-logic.js`
2. `dbv-power-type-filter-strip.js`
3. `dbv-card-name-filter.js`
4. `search-filter-functions.js` (defines `applyMissionFilters` / `applyEventsFilters`)
5. **`dbv-mission-set-filter.js`** — must load **after** `search-filter-functions.js` so `change` handlers can call `window.apply*`

Also listed in [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../../docs/FRONTEND_SCRIPT_MANIFEST.md).

## Integration points

- **[`search-filter-functions.js`](search-filter-functions.js)** — `missionsFilterUsesMobileSelect`, `applyMissionFilters`, `applyEventsFilters`, `setupMissionSearch` / `setupEventSearch` (card name + search wiring only for Missions; Events game-effect + search).
- **[`template-loader.js`](template-loader.js)** — After DBV HTML swap: `initDbvMissionSetFilters({ force: true })` with the other DBV inits.
- **[`card-data-display.js`](card-data-display.js)** — After `window.missionsData` / `window.eventsData`, calls `populateMissionsMissionSetSelect` / `populateEventsMissionSetSelect` then `apply*`.

## CSS

Unchanged: `.missions-mission-set-filter`, `.events-mission-set-filter`, `.events-mobile-set-select-clear-row`, `layout-mobile` rules in [`mobile-layout.css`](../css/mobile-layout.css) / [`database-view.css`](../css/database-view.css).

## Tests

Template / index tests assert **`data-dbv-mission-set-filter`** mount points; unit tests reference `dbv-mission-set-filter.js` for populate exports. Run **`npm run test:unit`**.

## See also

- **Power-type icon strip:** [`DBV_POWER_TYPE_FILTER_STRIP.md`](DBV_POWER_TYPE_FILTER_STRIP.md)
- **Card / name filters:** [`DBV_CARD_NAME_FILTER.md`](DBV_CARD_NAME_FILTER.md)
