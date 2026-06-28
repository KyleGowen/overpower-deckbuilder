# DBV card-name filter (reusable component)

> ⚠️ **LEGACY (v1) DOCUMENT.** This describes the deprecated **v1 vanilla-JS UI in `public/`**. The production frontend is the **v2 React SPA in `frontend/`** — see [`FRONTEND_V2.md`](../../docs/current/FRONTEND_V2.md). The v1 UI is served only as a rollback (`EXCELSIOR_DISABLE_SPA=1`); do not build new features from this document. Use the v2 feature/component docs under `frontend/src/` instead.

Vanilla JS component for the Card Database View (DBV): **card / name** text inputs in table headers and Missions mobile row. **Filter logic and event listeners** stay in `search-filter-functions.js`, `filter-functions.js`, and `card-filter-toggles.js`; this module only standardizes **DOM shape** and keeps stable **`id`**, **`class`**, and **`data-column`** values.

## See also

- **Power-type icon toggles (sibling component):** [`DBV_POWER_TYPE_FILTER_STRIP.md`](DBV_POWER_TYPE_FILTER_STRIP.md) — `[data-dbv-power-strip]` presets, [`dbv-power-type-filter-strip.js`](dbv-power-type-filter-strip.js), [`dbv-icon-filter-logic.js`](dbv-icon-filter-logic.js).
- **Architecture map:** [`docs/current/DBV_ARCHITECTURE.md`](../../docs/current/DBV_ARCHITECTURE.md) — script ownership and load order.
- **Mobile DBV:** [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) **§10.4** — tests/docs map including these specs.

## Source files

| File | Role |
|------|------|
| [`dbv-card-name-filter.js`](dbv-card-name-filter.js) | Presets, `initDbvCardNameFilters()`, `window.initDbvCardNameFilters` |

## HTML contract

Empty host elements keep **parent** table/layout classes. Only nodes inside **`[data-dbv-name-filter]`** are owned by the initializer.

```html
<div data-dbv-name-filter="preset-key"></div>
```

For **Missions mobile**, the host is the row shell (classes preserved):

```html
<div
  class="missions-mobile-card-name-row"
  data-dbv-name-filter="missions-mobile-name"
></div>
```

For **Basic Universe desktop**, the host is the existing name column wrapper:

```html
<div
  class="column-filters basic-universe-desktop-card-name-filters"
  data-dbv-name-filter="basic-desktop-name"
></div>
```

### Preset keys (`data-dbv-name-filter`)

| Preset | Notes |
|--------|--------|
| `characters-name` | `header-filter`, no `data-column` |
| `specials-name` | `data-column="name"` |
| `locations-name` | `data-column="name"` |
| `aspects-name` | `data-column="card_name"` |
| `missions-header-name` | `#missions-header-card-name-filter`, `type="search"` |
| `missions-mobile-name` | Label + `#missions-mobile-card-name-filter` |
| `ally-desktop-name` | `#ally-card-name-filter` |
| `ally-mobile-name` | `.ally-universe-mobile-card-name-filter` (no id) |
| `training-desktop-name` | `#training-card-name-filter` |
| `basic-desktop-name` | `#basic-universe-card-name-filter`, `filter-input` classes |

Add or change a preset in **`dbv-card-name-filter.js`** only; keep [`public/index.html`](../index.html), [`templates/database-view-complete.html`](../templates/database-view-complete.html), and [`deck-builder.html`](../deck-builder.html) in sync where those pages include the same tables. The injected fragment (**`database-view-complete.html`**) must mirror **`index.html`** for card-name hosts (e.g. `specials-name`, `locations-name`) and Advanced Universe filter-row structure (six-column thead with character + card-effect `header-filter` inputs — no `#advanced-universe-name-filter`).

**deck-builder.html** loads a subset of presets (characters, ally, training, basic) and includes [`dbv-card-name-filter.js`](../deck-builder.html) in `<head>` so hosts fill after parse. It does not duplicate the full index DBV markup (e.g. simplified Missions table without mobile name row).

## Generated DOM (stable selectors)

- Same **`id`** and **`class`** values as before extraction (for `getElementById`, `querySelector`, and CSS).
- **`data-column`** unchanged where the previous input had it.

## Load order

In [`public/index.html`](../index.html) (main SPA):

1. `dbv-power-type-filter-strip.js`
2. **`dbv-card-name-filter.js`**
3. `search-filter-functions.js`

Also listed in [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../../docs/FRONTEND_SCRIPT_MANIFEST.md).

## Integration points

- **[`template-loader.js`](template-loader.js)** — After inserting or replacing DBV HTML, calls `initDbvCardNameFilters({ force: true })` so new `[data-dbv-name-filter]` nodes get inputs.
- **Filter/clear code** — Unchanged when generated markup matches prior contracts.

## Out of scope (by design)

- **`#search-input`** — global chrome; not mounted by this component.
- **Events** tab — no name `th` filter cell; name via `#search-input`.
- **Advanced Universe** — no name column in thead filter row; name via `#search-input`.
- **Teamwork** / **Power** tabs — no dedicated name header filter.

## CSS

Unchanged: selectors target **`#missions-mobile-card-name-filter`**, **`.ally-mobile-name-row .header-filter`**, **`.aspect-filter-name-th .header-filter`**, etc., on the generated **input** descendants.

## Tests

- [`tests/unit/dbv-card-name-filter.test.ts`](../../tests/unit/dbv-card-name-filter.test.ts) — preset output / ids after `initDbvCardNameFilters`.
- [`tests/unit/database-view-template.test.ts`](../../tests/unit/database-view-template.test.ts) — template contains `data-dbv-name-filter` hosts for mirrored tables.

## Checklist when changing behavior

1. Preserve **ids** and **data-column** values expected by `search-filter-functions.js` / `filter-functions.js` / `card-filter-toggles.js`.
2. Keep **index.html**, **database-view-complete.html**, and **deck-builder** (where applicable) aligned.
3. Run **`npm run test:unit`**; smoke DTV and `layout-mobile` for affected tabs.
4. Update this doc if you add presets or new `window` APIs.
