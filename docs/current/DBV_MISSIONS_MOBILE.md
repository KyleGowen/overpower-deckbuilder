# DBV Missions tab — mobile view (how it looks)

This document explains **how the Missions tab** of the Card Database (`#missions-table`) is built for **mobile layout** (`html.layout-mobile`) and for **narrow viewports** (`max-width: 900px`) when the user forces **desktop layout** (`preferDesktopLayout`). It complements [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) **§10.6** and the **Missions** bullet in [`STYLE_GUIDE.md`](STYLE_GUIDE.md). **Card-name filter markup** (`#missions-mobile-card-name-filter`, `#missions-header-card-name-filter`) is created by [`DBV_CARD_NAME_FILTER.md`](../../public/js/DBV_CARD_NAME_FILTER.md) from `[data-dbv-name-filter]` hosts in [`index.html`](../../public/index.html) / [`database-view-complete.html`](../../public/templates/database-view-complete.html). **Mission set `<select>`** (`#missions-mission-set-filter`) is built by [`dbv-mission-set-filter.js`](../../public/js/dbv-mission-set-filter.js) into **`[data-dbv-mission-set-filter="missions"]`** — see [`DBV_MISSION_SET_FILTER.md`](../../public/js/DBV_MISSION_SET_FILTER.md).

## Goals

- **Simpler than Aspects:** Mission cards only need **mission set** (story set, 7 cards) and **card name** in the data model; mobile UI uses a **mission-set dropdown** plus a **card-name** text field (and shared DBV `#search-input`) instead of many header filters.
- **Match Special / Aspects** for **tbody**: vertical **card rows**, large list art, **`max-height: none !important`** on portrait `img` (see [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)).
- **No tab-level Clear button** — reset via **All** in the mission-set dropdown, global clear, or `clearMissionsFilters()` if invoked programmatically.

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
- **Hidden on mobile:** **`.missions-filter-leading-th`** (**`colspan="2"`** placeholder over Image + actions — must stay in the layout; hidden on MV with **`display: none`** only there), **`.missions-filter-card-name-th`** (desktop-only **`.header-filter`**; mobile uses **`#missions-mobile-card-name-filter`**).
- **`.missions-mobile-set-row`:** **`#missions-mission-set-filter`** full width (**≥44px** height on MV, teal border). **MV** also shows uppercase **`.missions-mobile-set-label`** (**`#4ecdc4`**) — **DTV** hides that label (thead **Mission Set** is enough).
- **`.missions-mobile-card-name-row`:** same label style + **`#missions-mobile-card-name-filter`** (substring match on **`card_name`**, combined with set dropdown and **`#search-input`**).
- **`@media (max-width: 900px)`**: **`#database-view #missions-table`** repeats the same filter + tbody rules for **`preferDesktopLayout`** on narrow viewports.

**Desktop:** **`#missions-mission-set-filter`** lives in **`.missions-mobile-set-row`** (teal label + select, same component as MV) in [`database-view.css`](../../public/css/database-view.css). **`.missions-mobile-card-name-row`** is **`display: none`** on DTV (card name uses **`#missions-header-card-name-filter`**). **Filter row:** **`th.missions-filter-leading-th colspan="2"`** spans Image + deck columns (do **not** use **`display: none`** on a single **`th`** — it breaks column alignment); **`.missions-filter-card-name-th`** holds **`#missions-header-card-name-filter`**.

## Filters (JS)

[`search-filter-functions.js`](../../public/js/search-filter-functions.js):

- **`missionsFilterUsesMobileSelect()`** — true when **`layout-mobile`** or **`(max-width: 900px)`** (gates which **card-name** field is used; mission set always uses **`#missions-mission-set-filter`**).
- **`populateMissionsMissionSetSelect()`** — defined in **`dbv-mission-set-filter.js`** (**All** + sorted distinct **`mission_set`** from **`window.missionsData`**; preserves selection when options refresh).
- **`applyMissionFilters()`** — in **`search-filter-functions.js`**: applies shared **search** text on **`card_name` / `mission_set`**, then **substring** on **`card_name`** from **`#missions-mobile-card-name-filter`** (MV) or **`#missions-header-card-name-filter`** (DTV), then **mission set** from **`#missions-mission-set-filter`** (**All** = show all sets). Exported on **`window`**.
- **`setupMissionSearch()`** — wires search input, **`#missions-mobile-card-name-filter`** **`input`**, **`#missions-header-card-name-filter`** **`input`**. **`#missions-mission-set-filter`** **`change`** is bound in **`dbv-mission-set-filter.js`** (**`initDbvMissionSetFilters`**).

[`loadMissions`](../../public/js/card-data-display.js) sets **`window.missionsData`**, then **`populateMissionsMissionSetSelect()`** + **`applyMissionFilters()`** so the list respects the current UI.

## Tbody: card rows, actions, caption

Same pattern as **Aspects**: **`tbody tr`** block cards; **`td:nth-child(n+3)`** hidden; actions **2×2 grid** (**+Deck** full width; collection row). Art tokens **`--dbv-mobile-missions-*`**.

## Automated tests

[`tests/unit/dbv-missions-mobile.test.ts`](../../tests/unit/dbv-missions-mobile.test.ts) locks:

- **`mobile-layout.css`**: filter shell, select row, label teal, tbody cards, art **`max-height`**, **900px** mirror.
- **`database-view.css`**: DTV shows **`.missions-mobile-set-row`** (mission-set **`<select>`**); hide **`.missions-mobile-card-name-row`**; **`.missions-filter-leading-th`** uses **`colspan="2"`** (layout-preserving).
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
