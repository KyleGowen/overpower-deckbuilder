# DBV power-type icon filter strip (reusable component)

Vanilla JS “component” for the Card Database View (DBV): the row of six power-type icon buttons plus the **MP** (Multi-Power / Multi Power) control. **Special** and **Aspects** can include the optional **No icon** checkbox in the same strip. Tab-specific **filter math** stays in existing modules (`search-filter-functions.js`, `card-filter-toggles.js`, etc.); this layer only standardizes **DOM shape** and **shared icon-matching rules** for Special/Aspects.

## Source files

| File | Role |
|------|------|
| [`dbv-power-type-filter-strip.js`](dbv-power-type-filter-strip.js) | Presets, `DocumentFragment` builders, optional no-icon label, `initDbvPowerTypeFilterStrips()`, `window.initDbvPowerTypeFilterStrips` |
| [`dbv-icon-filter-logic.js`](dbv-icon-filter-logic.js) | `window.matchesIconsPowerTypeFilters`, `window.setDbvPowerTypeToggleButtonsDisabled` (Special + Aspects parity) |

## HTML contract

Empty host elements keep their existing **classes**, **`role`**, **`aria-label`**, and tab-specific **`data-*`** (e.g. `data-training-filter-role`, `data-ally-filter-role`). Only **`data-dbv-power-strip`** and children are owned by the initializer.

```html
<div
  class="special-power-filter-toggles …"
  role="group"
  aria-label="…"
  data-dbv-power-strip="preset-key"
></div>
```

### Preset keys (`data-dbv-power-strip`)

| Preset | Notes |
|--------|--------|
| `special-with-no-icon` | Full strip + `#special-no-icon-toggle` |
| `aspect-with-no-icon` | Full strip + `#aspect-no-icon-toggle` |
| `teamwork-mobile-to-use` | Full strip |
| `teamwork-desktop-to-use-1` | Energy, Intelligence only |
| `teamwork-desktop-to-use-2` | Combat, Any-Power only |
| `teamwork-desktop-to-use-3` | Brute Force + MP |
| `teamwork-desktop-acts-as` | Full strip; Acts As `aria-label` suffix |
| `teamwork-desktop-followup` | Full strip; followup `aria-label` suffix |
| `ally-desktop-stat` / `ally-desktop-attack` | `data-power-type` uses **Multi Power** (space) |
| `ally-mobile-stat` / `ally-mobile-attack` | Same values; mobile lazy/img rules per preset |
| `training-desktop-type1` / `training-desktop-type2` | Type 1 / Type 2 `aria-label` pattern |
| `training-mobile` | Full strip |
| `basic-desktop` / `basic-mobile` | Full strip |
| `power-desktop` / `power-mobile` | **Multi Power** (space) for MP button |

Add or change a preset in **`dbv-power-type-filter-strip.js`** only; keep [`public/index.html`](../index.html) and [`templates/database-view-complete.html`](../templates/database-view-complete.html) in sync.

## Generated DOM (stable selectors)

Each icon control is:

- `button.power-type-filter-toggle`
- `data-power-type` — must match filter code (`Multi-Power` vs `Multi Power` where tabs already differed)
- `aria-pressed` toggled by existing setup code
- Active state: `.is-active`; disabled (no-icon): `.is-disabled` + `disabled`

**No icon** (Special/Aspects only): `label.special-no-icon-toggle-label`, `#special-no-icon-toggle` / `#aspect-no-icon-toggle`, same face/SVG classes as before (see [`public/css/.cursorrules`](../css/.cursorrules) / `database-view.css`).

## Load order

In [`public/index.html`](../index.html) (and any page that includes the DBV tables):

1. `dbv-icon-filter-logic.js`
2. `dbv-power-type-filter-strip.js` (auto-runs `initDbvPowerTypeFilterStrips` when the script executes)
3. `dbv-card-name-filter.js` (auto-runs `initDbvCardNameFilters` when the script executes; see [`DBV_CARD_NAME_FILTER.md`](DBV_CARD_NAME_FILTER.md))
4. `search-filter-functions.js`

Also listed in [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../../docs/FRONTEND_SCRIPT_MANIFEST.md).

## Integration points

- **[`search-filter-functions.js`](search-filter-functions.js)** — `setupAspectSearch` / `setupSpecialCardSearch` use `matchesIconsPowerTypeFilters` and `setDbvPowerTypeToggleButtonsDisabled`. Top-of-file `ensureDbvFilterHelpers` mirrors those globals when the file is evaluated alone in unit tests.
- **[`template-loader.js`](template-loader.js)** — After inserting or replacing DBV HTML, calls `initDbvPowerTypeFilterStrips({ force: true })` and `initDbvCardNameFilters({ force: true })` so new mount points get controls.
- **[`filter-functions.js`](filter-functions.js)** — `clearSpecialCardFilters` / aspect clears still target the same ids and `.power-type-filter-toggle` classes after init.

## Out of scope (by design)

- **Characters** tab — different filter UI; do not mount these strips there.
- **Special Cards function column** — `.function-filter-toggle` row remains separate markup and logic in `search-filter-functions.js`.

## See also

- **Card / name text filters (sibling component):** [`DBV_CARD_NAME_FILTER.md`](DBV_CARD_NAME_FILTER.md) — `[data-dbv-name-filter]` presets, [`dbv-card-name-filter.js`](dbv-card-name-filter.js), loaded immediately after this script in [`public/index.html`](../index.html).

## CSS

Visuals are unchanged: `.power-type-filter-toggle`, `.special-power-filter-toggles`, `.special-no-icon-*`, `.icon-filter-container`, and per-table `layout-mobile` rules in [`mobile-layout.css`](../css/mobile-layout.css) / [`database-view.css`](../css/database-view.css).

## Tests

- [`tests/unit/dbv-icon-filter-logic.test.ts`](../../tests/unit/dbv-icon-filter-logic.test.ts) — `matchesIconsPowerTypeFilters` behavior.
- Special / Aspects / Basic Universe / template tests updated for `data-dbv-power-strip` or script load order where relevant.

## Checklist when changing behavior

1. Preserve **filter semantics** per tab (OR across selected types, Multi-Power rules, no-icon empties `icons`).
2. Keep **ids** for no-icon and clear functions stable.
3. Run **`npm run test:unit`**; smoke DTV and `layout-mobile` for affected tabs.
4. Update this doc if you add presets or new `window` APIs.
