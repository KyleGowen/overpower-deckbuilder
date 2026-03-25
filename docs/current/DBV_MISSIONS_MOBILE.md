# DBV Missions tab — mobile view (how it looks)

This document explains **how the Missions tab** of the Card Database (`#missions-table`) is built for **mobile layout** (`html.layout-mobile`) and for **narrow viewports** (`max-width: 900px`) when the user forces **desktop layout** (`preferDesktopLayout`). It complements [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) **§10.6** and the **Missions** bullet in [`STYLE_GUIDE.md`](STYLE_GUIDE.md).

## Goals

- **Simpler than Aspects:** Mission cards only need **mission set** (story set, 7 cards) and **card name** in the data model; mobile UI uses a **single mission-set dropdown** (plus shared DBV search) instead of many header filters.
- **Match Special / Aspects** for **tbody**: vertical **card rows**, large list art, **`max-height: none !important`** on portrait `img` (see [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)).
- **No tab-level Clear button** — reset via **All** in the dropdown, desktop checkboxes, global clear, or `clearMissionsFilters()` if invoked programmatically.

## When “mobile list art” and caption run in JS

[`displayMissions`](../../public/js/card-display-functions.js) uses **`missionUseMobileListArt()`** when either:

- `window.isLayoutMobileForCardDisplay()` is true, or  
- `window.isNarrowViewportDbvBand()` is true (`matchMedia('(max-width: 900px)')`).

Then: **`card-image-container`**, **`data-dbv-lightbox-context="mission"`**, no fixed **120px / 180px** inline sizing on the `img`.

**Caption** (three lines): **card name** → **`mission_set`** → **product set + number** via **`window.dbvSetCaptionLineFromCard`** ([`dbvSetCaptionLineFromCard`](../../public/js/card-display.js) — same **`translateSet` + `set_number`** idea as character DBV).

## Filter shell (thead)

Under **`.layout-mobile #missions-table`** in [`mobile-layout.css`](../../public/css/mobile-layout.css):

- **`thead`** **`display: block`**, first label row **visually hidden**.
- **`tr.missions-filter-row`**: flex + wrap, **12px** radius, **`--missions-header-shell-*`** (teal border / dark shell).
- **Hidden on mobile:** **`.missions-filter-clear-th`** (placeholder column — no Clear control), spacer / empty **`th`**, **`.missions-checkbox-group`**.
- **`.missions-mobile-set-row`:** uppercase label **`.missions-mobile-set-label`** (**`color: #4ecdc4`**, matches DBV **`data-label`** headings) + **`#missions-mission-set-filter`** full width (**≥44px** height, teal border).
- **`@media (max-width: 900px)`**: **`#database-view #missions-table`** repeats the same filter + tbody rules for **`preferDesktopLayout`** on narrow viewports.

**Desktop:** **`.missions-mobile-set-row`** is **`display: none`** in [`database-view.css`](../../public/css/database-view.css); **`.missions-filter-clear-th`** is **`display: none !important`** (table column kept for structure). Mission-set **checkboxes** remain in **`.missions-checkbox-group`**.

## Filters (JS)

[`search-filter-functions.js`](../../public/js/search-filter-functions.js):

- **`missionsFilterUsesMobileSelect()`** — true when **`layout-mobile`** or **`(max-width: 900px)`** (must match CSS that shows the `<select>`).
- **`populateMissionsMissionSetSelect()`** — **All** + sorted distinct **`mission_set`** from **`window.missionsData`**; preserves selection when options refresh.
- **`applyMissionFilters()`** — applies shared **search** text on **`card_name` / `mission_set`**, then either **mobile** (one set or All) or **desktop** (checkbox OR). Exported on **`window`**.
- **`setupMissionSearch()`** — wires search input, checkboxes, **`#missions-mission-set-filter`** **`change`**.

[`loadMissions`](../../public/js/card-data-display.js) sets **`window.missionsData`**, then **`populateMissionsMissionSetSelect()`** + **`applyMissionFilters()`** so the list respects the current UI.

## Tbody: card rows, actions, caption

Same pattern as **Aspects**: **`tbody tr`** block cards; **`td:nth-child(n+3)`** hidden; actions **2×2 grid** (**+Deck** full width; collection row). Art tokens **`--dbv-mobile-missions-*`**.

## Automated tests

[`tests/unit/dbv-missions-mobile.test.ts`](../../tests/unit/dbv-missions-mobile.test.ts) locks:

- **`mobile-layout.css`**: filter shell, select row, label teal, tbody cards, art **`max-height`**, **900px** mirror.
- **`database-view.css`**: hide **`.missions-mobile-set-row`** and **`.missions-filter-clear-th`** on desktop.
- **Markup** (`index.html`, template): **`missions-filter-row`**, **`#missions-mission-set-filter`**, no tab-level Clear **`onclick`** / **`clear-missions-filters-mobile`**.
- **Source contracts**: **`displayMissions`**, **`search-filter-functions.js`**, **`card-display.js`** export, **`card-data-display.js`** / **`filter-functions.js`** where applicable.

Run: `npm run test:unit -- tests/unit/dbv-missions-mobile.test.ts`

## Related files (quick map)

| Area | File |
|------|------|
| Markup | [`public/index.html`](../../public/index.html), [`public/templates/database-view-complete.html`](../../public/templates/database-view-complete.html) |
| Mobile CSS | [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css) (search **Missions tab**) |
| Desktop / shared | [`public/css/database-view.css`](../../public/css/database-view.css) (`#missions-table` missions-only rules) |
| Render | [`public/js/card-display-functions.js`](../../public/js/card-display-functions.js) (`displayMissions`, `missionUseMobileListArt`) |
| Set line helper | [`public/js/card-display.js`](../../public/js/card-display.js) (`dbvSetCaptionLineFromCard` on **`window`**) |
| Filters + load | [`public/js/search-filter-functions.js`](../../public/js/search-filter-functions.js), [`public/js/card-data-display.js`](../../public/js/card-data-display.js), [`public/js/filter-functions.js`](../../public/js/filter-functions.js) (`clearMissionsFilters`) |
