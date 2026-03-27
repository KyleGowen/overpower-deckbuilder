# Card Database View (DBV) — architecture

Single reference for **where DBV logic lives**, **script order**, **`window` contracts**, and **desktop vs mobile** split. Agent context: [`public/js/dbv/.cursorrules`](../../public/js/dbv/.cursorrules).

## Script load order (main SPA)

Documented in [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../FRONTEND_SCRIPT_MANIFEST.md). DBV-related defer chain (after `alphabetization.js`):

| Order | File | Role |
|------|------|------|
| 1 | `card-image-utils.js` | `mapImagePathToActualFile`, `getCardImagePath` |
| 2 | **`dbv/dbv-layout-context.js`** | `window.isLayoutMobileForCardDisplay`, `window.isNarrowViewportDbvBand` |
| 3 | **`dbv/dbv-tab-data.js`** | `window.dbvTabData`; legacy `missionsData`, `eventsData`, … mirror into store |
| 4 | **`dbv/dbv-render-shared.js`** | Grouping, captions, `getCardImagePathForDisplay`, row height locks, `layout-mode-change` for char/loc/special |
| 5 | `card-display.js` | `displayCharacters`, `displaySpecialCards`, `displayLocations`, `navigateCardImage`, format/special icons |
| 6 | `all-cards-display.js` | All tab |
| 7 | `card-display-functions.js` | Missions, events, aspects, advanced universe, **power cards** |
| 8 | `search-filter-functions.js`, `filter-functions.js`, `card-filter-toggles.js` | Filters |
| 9 | `card-data-display.js` | Loaders + **teamwork, ally, training, basic universe** display (canonical implementations) |

**Sync (head):** `layout-mode.js`, `characters-stat-filter-tabs.js` — must run before paint; see [`public/js/.cursorrules`](../../public/js/.cursorrules).

## Desktop vs mobile

| Layer | Location |
|-------|----------|
| CSS (primary) | [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css) under `html.layout-mobile`; [`public/css/database-view.css`](../../public/css/database-view.css) desktop chrome |
| Layout flag | [`public/js/layout-mode.js`](../../public/js/layout-mode.js) → `window.isLayoutMobile()` |
| DBV viewport | [`public/js/dbv/dbv-layout-context.js`](../../public/js/dbv/dbv-layout-context.js) composes layout + narrow `(max-width: 900px)` band |
| JS branches | `card-display.js`, `card-display-functions.js`, `card-data-display.js`, `search-filter-functions.js` (e.g. mission set select) |

## `window.dbvTabData`

Canonical keys: `missions`, `events`, `teamwork`, `allyUniverse`, `training`, `basicUniverse`. Assignments to `window.missionsData` (and siblings) update the same backing store via setters installed in `dbv-tab-data.js`. Prefer reading `window.dbvTabData` in new code; keep legacy globals for HTML and older scripts.

## Global function ownership (avoid silent overrides)

| Symbol | Owner file | Notes |
|--------|------------|--------|
| `displayCharacters`, `displaySpecialCards`, `displayLocations` | `card-display.js` | |
| `displayMissions`, `displayEvents`, `displayAspects`, `displayAdvancedUniverse`, `displayPowerCards` | `card-display-functions.js` | |
| `displayTeamwork`, `displayAllyUniverse`, `displayTraining`, `displayBasicUniverse` | `card-data-display.js` | **Do not** re-stub in `card-display-functions.js` |
| `loadMissions`, `loadEvents`, … | `card-data-display.js` | |

`window.displayLocations` is assigned only from `card-display.js` (not reassigned at end of `card-display-functions.js`).

## Shared helpers (`dbv-render-shared.js`)

Exported on `window` for cross-file use: `escapeHtmlText`, `applyDbvHorizontalCardClass`, `groupCardsByVariant`, `getCardImagePathForDisplay`, `specialCardEffectPlainForMobileCaption`, `dbvSetCaptionLineFromCard`, `characterMobileCaptionLines`, `locationMobileCaptionLines`, `locationThreatCssClass`, `specialMobileCaption`, `buildSpecialMobileCaptionHtml`, `preloadAlternateImages`, `applyCharacterImageRowHeightLock`, `clearCharacterRowHeightLocks`, `refreshCharacterTableHeightLocks`.

## Unit tests that `eval` DBV scripts

Load **`dbv-layout-context.js`** then **`dbv-render-shared.js`** before **`card-display.js`** (see `database-view-image-src-regression.test.ts`, `card-database-sorting-frontend.test.ts`, etc.). Source-level assertions for `dbvSetCaptionLineFromCard` target **`dbv-render-shared.js`**.

## Historical / removed scripts

The following were listed as orphaned in older manifests and are **not** in the tree: `database-view.js`, `database-view-core.js`, `database-view-tabs.js`, `database-view-search.js`, `database-view-display.js`. Do not resurrect without wiring `index.html` and updating this doc.

## Related docs

- [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) — milestones, global nav, All tab
- [`docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md) — mobile row image sizing
- Per-tab mobile specs: `DBV_*_MOBILE.md` in this folder
- **Reusable DBV filter DOM (before `search-filter-functions.js` in the main SPA):** [`public/js/DBV_POWER_TYPE_FILTER_STRIP.md`](../../public/js/DBV_POWER_TYPE_FILTER_STRIP.md) — `[data-dbv-power-strip]` icon toggles + [`public/js/dbv-icon-filter-logic.js`](../../public/js/dbv-icon-filter-logic.js). [`public/js/DBV_CARD_NAME_FILTER.md`](../../public/js/DBV_CARD_NAME_FILTER.md) — `[data-dbv-name-filter]` name inputs ([`public/js/dbv-card-name-filter.js`](../../public/js/dbv-card-name-filter.js)). Full order: [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../FRONTEND_SCRIPT_MANIFEST.md).
