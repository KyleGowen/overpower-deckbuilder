# DBV — Universe: Basic (mobile)

## Overview

On `.layout-mobile` and in the narrow `#database-view` band (`max-width: 900px`), the Basic Universe tab uses the same patterns as **Training** (stat-type icon strip + inline Clear) and **Teamwork** (two numeric rows: equals / min / max / clear) for **Value to Use** and **Bonus**.

Desktop keeps a separate filter row (`basic-universe-desktop-filter-row`) with column filters; the mobile shell row is hidden on desktop via `database-view.css`. **DTV name field** (`#basic-universe-card-name-filter`) comes from [`DBV_CARD_NAME_FILTER.md`](../../public/js/DBV_CARD_NAME_FILTER.md); stat-type toggles from [`DBV_POWER_TYPE_FILTER_STRIP.md`](../../public/js/DBV_POWER_TYPE_FILTER_STRIP.md).

## Files

| Area | File |
|------|------|
| Markup | `public/index.html`, `public/deck-builder.html`, `public/templates/database-view-complete.html` |
| Desktop hide | `public/css/database-view.css` |
| Mobile layout | `public/css/mobile-layout.css` (`.layout-mobile` + `@media` `#database-view` mirror) |
| Data + display | `public/js/card-data-display.js` — `window.basicUniverseData`, `displayBasicUniverse`, `buildBasicUniverseMobileCaptionHtml`, `setupBasicUniverseSearch` (sync mobile/desktop inputs, `layout-mode-change`) |
| Filters | `public/js/card-filter-toggles.js` — `applyBasicUniverseFilters` (in-memory pool + search) |
| Clear | `public/js/filter-functions.js` — `clearBasicUniverseFilters` |

## Caption (under card art)

1. **Name** — `.characters-mobile-card-caption__basic-universe-name` (bold, `--font-lg` token)
2. **Type icon + value + bonus** — `.characters-mobile-card-caption__basic-universe-stat-line`
3. **Set line** — `dbvSetCaptionLineFromCard(card)` → `.characters-mobile-card-caption__basic-universe-set-line`

## Typography

Stat-type toggles, to-use / bonus strips, card-name input, `td[data-label]::before` labels, checkbox label (`.checkbox-group label` — mobile-scoped `!important` override from [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css)), and caption lines all use the shared mobile token scale defined on `html.layout-mobile` in [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css). Do not introduce literal `rem` font sizes — reference a token from the scale. Full scale: [`MOBILE_DESIGN.md §10.8`](../../MOBILE_DESIGN.md#108-mobile-fluid-typography-tokens-htmllayout-mobile--done).

## Image sizing

Use the checklist in [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](./MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md): portrait list art uses `max-height: none !important` under `#basic-universe-table`.

## Tests

[`tests/unit/dbv-basic-universe-mobile.test.ts`](../../tests/unit/dbv-basic-universe-mobile.test.ts)
