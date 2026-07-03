# DBV Universe: Training — mobile layout

> ⚠️ **LEGACY (v1) DOCUMENT.** This describes the deprecated **v1 vanilla-JS UI in `public/`**. The production frontend is the **v2 React SPA in `frontend/`** — see [`FRONTEND_V2.md`](FRONTEND_V2.md). The v1 UI is served only as a rollback (`EXCELSIOR_DISABLE_SPA=1`); do not build new features from this document. Use the v2 feature/component docs under `frontend/src/` instead.

## Summary

The Training tab uses the same mobile DBV pattern as Ally: stat-type icon toggles in a teal header shell, vertical card rows (image + actions + caption), and client-side filtering on `window.trainingData`. **DTV card-name field** (`#training-card-name-filter`) is built by [`DBV_CARD_NAME_FILTER.md`](../../public/js/DBV_CARD_NAME_FILTER.md) (`data-dbv-name-filter="training-desktop-name"`); icon strips use [`DBV_POWER_TYPE_FILTER_STRIP.md`](../../public/js/DBV_POWER_TYPE_FILTER_STRIP.md).

## Behavior

- **Layout:** `html.layout-mobile` or narrow viewport (`max-width: 900px`) under `#database-view` shows block-level rows, hides detail columns (`td:nth-child(n+3)`), and uses `card-image-container` with portrait `max-height: none !important` (see [MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)).
- **Desktop (DTV):** `tr.training-desktop-filter-row` is the only visible filter row. **`#training-card-name-filter`** filters `card_name` (substring). **`.training-type-1-filter-toggles`** / **`.training-type-2-filter-toggles`** each hold six `power-type-filter-toggle` buttons; active types OR-match within that column only (`type_1` vs `type_2`). **`tr.training-filter-row`** (mobile shell) is hidden on DTV. Global `#search-input` still AND-combines with column filters when present (`applyTrainingFilters()`).
- **Mobile (MV):** **`tr.training-desktop-filter-row`** is hidden. Six `power-type-filter-toggle` buttons in `.training-stat-type-toggles`; active toggles OR-match against **`type_1` and `type_2`** (Energy in either column shows the card). Multi-Power accepts `Multi Power` / `Multi-Power`.
- **Search:** Global `#search-input` AND-combines with active type toggles via `applyTrainingFilters()`.
- **Caption:** Under the image — name (largest), two type lines (`icon` + value/bonus + `icon`), then set line from `dbvSetCaptionLineFromCard`.

## Files

| Area | Path |
|------|------|
| Markup | `public/index.html`, `public/deck-builder.html`, `public/templates/database-view-complete.html` |
| Filters + search | `public/js/search-filter-functions.js` (`applyTrainingFilters`, `setupTrainingTableFilters`, `setupTrainingSearch`) |
| Clear | `public/js/filter-functions.js` (`clearTrainingFilters`) |
| Load + render | `public/js/card-data-display.js` (`loadTraining`, `displayTraining`, `buildTrainingMobileCaptionHtml`, `trainingUseMobileListArt`) |
| Desktop chrome | `public/css/database-view.css` |
| Mobile + 900px mirror | `public/css/mobile-layout.css` |
| Contract tests | `tests/unit/dbv-training-mobile.test.ts` |

## Typography

Type toggles, card-name input, `td[data-label]::before` labels, and caption lines use the shared mobile token scale on `html.layout-mobile` in [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css). Do not use literal `rem` font sizes — always reference a token. Full scale: [`MOBILE_DESIGN.md §10.8`](../../MOBILE_DESIGN.md#108-mobile-fluid-typography-tokens-htmllayout-mobile--done).
