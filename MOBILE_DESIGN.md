# Mobile design — findings, strategy, and roadmap

This document is the **source of truth** for mobile and dual–layout-mode work on Excelsior Deckbuilder. It complements `[docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md)` (visual specs) and repo `[.cursorrules](.cursorrules)`.

---

## 1. Current architecture

- **Single HTML shell:** Express serves `[public/index.html](public/index.html)` for `/`, deck routes, collection, and `/data` via `[src/routes/pages.routes.ts](src/routes/pages.routes.ts)`. No separate mobile HTML or server-side device routing.
- **Views:** One global CSS/JS bundle; views toggle with classes such as `view-removed`.
- **Global chrome:** `[public/components/globalNav.html](public/components/globalNav.html)` injected into `#globalNav` from `[public/js/app-initialization.js](public/js/app-initialization.js)`.
- **Layout mode (implemented):** **Desktop** vs **mobile** layout mode is determined on the **client** using `**window.matchMedia`** and optional **user override** (`localStorage` key `preferDesktopLayout`). Root element classes: `layout-desktop` / `layout-mobile`. See `[public/js/layout-mode.js](public/js/layout-mode.js)`. **Shell hooks:** `window.isLayoutMobile()`, `window.applyLayoutMode()`, `window.LAYOUT_MOBILE_MAX_PX`, `window.setPreferDesktopLayout`, and the document event `**layout-mode-change`** (used e.g. by `[deck-editor-layout.js](public/js/deck-editor-layout.js)` to reflow when the user resizes or toggles desktop preference).

---

## 2. Inventory (major CSS/UX surfaces)


| Area                    | Primary files                                                                                                                        | Desktop-oriented notes                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App shell / deck editor | `[public/css/index.css](public/css/index.css)`                                                                                       | ~1400px container; two-pane flex; `overflow: hidden`; mixed z-index.                                                                                                                          |
| Card database           | `[public/css/card-tables.css](public/css/card-tables.css)`, `[public/css/database-view.css](public/css/database-view.css)`           | Fixed tables, wide filters (e.g. missions filters `min-width`).                                                                                                                               |
| Collection              | `[public/css/collection-view.css](public/css/collection-view.css)`                                                                   | 1400px max-width; small checkboxes in places.                                                                                                                                                 |
| Deck selection          | `[public/css/deck-selection.css](public/css/deck-selection.css)`                                                                     | 44×44 menu pattern in places.                                                                                                                                                                 |
| Global nav              | `[public/components/globalNav.css](public/components/globalNav.css)`, `[public/css/mobile-layout.css](public/css/mobile-layout.css)` | `@media` at 900px / 600px; under `.layout-mobile`, **row header** (logo left, 2×2 app grid + welcome) + 44px targets — see **§10**. Desktop: `**header-nav-cluster`** is `display: contents`. |


---

## 3. Breakpoint audit

- **STYLE_GUIDE** documents legacy **Mobile** `768px` for some older `@media` rules; **client layout mode** uses `**900px`** so the stacked shell matches the former “tablet” band (see below).
- **Codebase** historically used many thresholds (500, 600, 700, 768, 800, 900, 1000, 1200px) without a single token.
- **Canonical layout-mode breakpoint:** `**900px`** — `layout-mobile` for `max-width: 900px`, `layout-desktop` for `901px+` (avoids a cramped desktop shell between 769–900). Exposed as `**--layout-mobile-max: 900px`** on `:root` in `[public/css/mobile-layout.css](public/css/mobile-layout.css)` and mirrored in `layout-mode.js` (`LAYOUT_MOBILE_MAX_PX`).

---

## 4. Why mobile felt poor (root causes)

1. Two-pane deck editor + mouse-style resizer on narrow viewports.
2. Data-dense tables and wide filter bars requiring horizontal scroll.
3. List view locked to **two columns** in JS (`[public/js/deck-editor-layout.js](public/js/deck-editor-layout.js)`).
4. Inconsistent touch targets vs STYLE_GUIDE **44px** minimum.
5. STYLE_GUIDE responsive bullets were partly **aspirational** relative to code (now called out in STYLE_GUIDE).

---

## 5. Dual-interface strategy (industry standard)

- **Not recommended as default:** server **User-Agent** routing (fragile; wrong for narrow desktop windows).
- **Implemented:** `**matchMedia('(max-width: 900px)')`**, `**change`** listener on resize/orientation (with resize fallback where needed), root class `**layout-mobile**` / `**layout-desktop**`. *(Width-only for now; `(pointer: coarse)` is not used in `[layout-mode.js](public/js/layout-mode.js)` but could augment detection later.)*
- **Override:** `localStorage.setItem('preferDesktopLayout','1')` forces desktop layout class even on narrow viewports; remove key to restore breakpoint behavior. `**window.setPreferDesktopLayout(true|false)`** in `[layout-mode.js](public/js/layout-mode.js)` updates storage and reapplies classes. (Product may add a “Desktop site” link later.)
- **FOUC mitigation:** A blocking `[layout-mode.js](public/js/layout-mode.js)` `<script>` in `[public/index.html](public/index.html)` `<head>` (before main CSS) runs `applyLayoutMode()` synchronously on load so `<html>` usually has the correct class before first paint.
- **Styling:** `[public/css/mobile-layout.css](public/css/mobile-layout.css)` — rules scoped under `**.layout-mobile`** so desktop layout is unchanged.

---

## 6. Roadmap — milestones

```mermaid
flowchart TB
  M0[M0 Foundation docs and audit]
  M1[M1 Layout detection and mobile shell]
  M2a[M2a DB code hygiene]
  M2b[M2b DB agent context]
  M2c[M2c Mobile DBV UX]
  M3[M3 Deck list and selection mobile]
  M4[M4 Collection mobile]
  M5a[M5a Deck read-only mobile]
  M5b[M5b Deck owned edit mobile]
  M6[M6 Hardening and parity]
  M0 --> M1
  M1 --> M2a
  M2a --> M2b
  M2b --> M2c
  M2c --> M3
  M3 --> M4
  M4 --> M5a
  M5a --> M5b
  M5b --> M6
```




| Milestone         | What we deliver                                                     | Depends on | Done when                                         | Status      |
| ----------------- | ------------------------------------------------------------------- | ---------- | ------------------------------------------------- | ----------- |
| **M0**            | Baseline docs, STYLE_GUIDE alignment, breakpoint audit in this file | —          | This doc + STYLE_GUIDE updates landed             | done        |
| **M1**            | `matchMedia` layout mode, shell hooks, `mobile-layout.css`          | M0         | Narrow viewport gets `layout-mobile` + usable nav | done        |
| **M2** (umbrella) | Card database mobile-first                                          | M1         | M2a–M2c met                                       | in progress |
| **M2a**           | DB-scoped CSS/JS hygiene                                            | M1         | DBV files cleaned; no desktop regressions         | done        |
| **M2b**           | `.cursorrules` + agent context for DBV + mobile                     | M2a        | Rules committed                                   | done        |
| **M2c**           | Touch-first DBV browse/filter                                       | M2b        | Every DBV tab usable on phone (see tab checklist) | in progress |
| **M3**            | Deck list / selection mobile                                        | M2c        | Deck tiles/menus usable                           | pending     |
| **M4**            | Collection mobile                                                   | M3         | Collection usable                                 | pending     |
| **M5** (umbrella) | Deck editor mobile                                                  | M4         | M5a + M5b met                                     | pending     |
| **M5a**           | Read-only deck viewing                                              | M4         | Non-owner / readonly routes readable              | pending     |
| **M5b**           | Owned deck editing                                                  | M5a        | Owner edit/save on mobile                         | pending     |
| **M6**            | Tests, tablet policy, z-index pass                                  | M5b        | CI / docs                                         | pending     |


Roadmap **Status** values are `**pending`**, `**in progress`**, or `**done**`. They track delivery of each milestone row above. The **Refactor completion log** in §7 tracks smaller incremental items and may show status per line independently.

### M2 sub-milestones


| Sub     | Deliverable                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **M2a** | Hygiene in `card-tables.css`, `database-view.css`, touched DBV JS                                                                    |
| **M2b** | `[public/css/.cursorrules](public/css/.cursorrules)`, `[public/js/.cursorrules](public/js/.cursorrules)` DBV + `layout-mobile` notes |
| **M2c** | Mobile DBV UX (card rows, stacked filters, etc.)                                                                                     |


#### M2c — database view tabs (mobile UX)

Per-tab delivery for the Card Database (`#database-view`). **Status** values: `pending`, `in progress`, `done` (same as the roadmap table above).


| Tab (UI label)         | `data-tab` / container id                     | Status  |
| ---------------------- | --------------------------------------------- | ------- |
| **All**                | `all-cards` / `all-cards-tab`                 | done    |
| **Characters**         | `characters` / `characters-tab`               | done    |
| **Special Cards**      | `special-cards` / `special-cards-tab`         | done    |
| **Universe: Advanced** | `advanced-universe` / `advanced-universe-tab` | pending |
| **Locations**          | `locations` / `locations-tab`                 | pending |
| **Aspects**            | `aspects` / `aspects-tab`                     | done    |
| **Missions**           | `missions` / `missions-tab`                   | pending |
| **Events**             | `events` / `events-tab`                       | pending |
| **Universe: Teamwork** | `teamwork` / `teamwork-tab`                   | pending |
| **Universe: Ally**     | `ally-universe` / `ally-universe-tab`         | pending |
| **Universe: Training** | `training` / `training-tab`                   | pending |
| **Universe: Basic**    | `basic-universe` / `basic-universe-tab`       | pending |
| **Power Cards**        | `power-cards` / `power-cards-tab`             | pending |


### M5 sub-milestones


| Sub     | Deliverable                                                  |
| ------- | ------------------------------------------------------------ |
| **M5a** | Read-only / preview / non-owner deck views on narrow screens |
| **M5b** | Owner edit: stacked panes, single-column list, save          |


---

## 7. Preliminary sub-milestones (incremental refactors)

Small, desktop-neutral PRs; check off below as completed.

### Refactor completion log


| Item                                                                                                                                    | Milestone   | Status                                            |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| Breakpoint / layout tokens (`--layout-mobile-max`)                                                                                      | M0          | done                                              |
| Z-index / stacking map (doc + STYLE_GUIDE)                                                                                              | M0          | done                                              |
| CSS hygiene global (orphan block removal in `index.css`)                                                                                | M0          | done                                              |
| Viewport / clamp helpers (`viewport-positioning.js`)                                                                                    | M0          | done                                              |
| DRY entry HTML                                                                                                                          | M1          | n/a (single `index.html`)                         |
| Optional CSS load order split                                                                                                           | M1          | deferred (profile first)                          |
| Global nav stacked shell under `.layout-mobile` (flow layout, 44px targets)                                                             | M1          | done                                              |
| DB: separate data from table chrome                                                                                                     | M2a–M2c     | done (M2a: DB tables vs deck Card View CSS split) |
| Filter / toolbar extraction                                                                                                             | M2c         | deferred (larger refactor)                        |
| Touch-target utilities (`.touch-target-min`)                                                                                            | M2c         | done (base utilities in `mobile-layout.css`)      |
| DBV M2c: stacked filters, 44px targets, missions/special relax, Characters **card rows** (`data-label`, `card-display.js`)              | M2c         | done                                              |
| Deck editor layout config (`DECK_LIST_COLUMNS_MOBILE`)                                                                                  | M5a–M5b     | done                                              |
| Agent context: `public/css`, `public/js`, `public/components`, `public/.cursorrules` (layout-mobile, MOBILE_DESIGN pointers)            | M2b / shell | done                                              |
| Jest `Window` merge fixes (`getCardImagePath`, `SimulateKO`, deck globals)                                                              | M6          | done                                              |
| `index.html` head order regression (`layout-mode-and-viewport.test.ts`)                                                                 | M6          | done                                              |
| Global nav mobile: **2×2** app grid, `**header-nav-cluster`**, `**syncHeaderCollectionLayout**` / `**collection-tab-hidden**`           | M1          | done                                              |
| Global nav mobile: logo column **30.4%** / **134px** cap, `**padding-top: 0`** bar, `**align-items: flex-start**` on `**.header-left**` | M1          | done                                              |
| Global nav mobile: welcome `**justify-content: flex-end**`; account dropdown **50%** width, `**right: 0`**                              | M1          | done                                              |
| DBV **All** tab: remove inline **5-col** grid on `**#all-cards-grid-container`**; single column ≤900px + `**.layout-mobile**`           | M2c         | done                                              |
| DBV **All** tab cells: **+Deck** row then **-Collection | +Collection** (`mobile-layout.css` grid on `**.card-content-bottom`**)        | M2c         | done                                              |
| DBV Characters: **tabbed stat filters** (merged `colspan=5` header cell, `characters-stat-filter-tabs.js`)                              | M2c         | done                                              |
| DBV **Aspects** tab (mobile filter shell, value/no-value chrome, caption, actions grid; no pseudo **Actions** label)                  | M2c         | done                                              |


**M0 — Foundation**

- Breakpoint tokens on `:root`; document here and STYLE_GUIDE.
- Z-index map documented (nav 9999, etc.).
- Global CSS hygiene outside DBV-only passes.
- Shared viewport clamp helper for modals/menus.

**M1 — Layout mode + shell** (complete)

- `layout-mode.js` + `mobile-layout.css` linked from `[public/index.html](public/index.html)`; narrow viewports get `layout-mobile` and a **mobile global header** (logo left, 2×2 app controls, welcome row — **§10**; rules in `mobile-layout.css` global nav block).
- **Verification:** `[tests/unit/layout-mode-and-viewport.test.ts](tests/unit/layout-mode-and-viewport.test.ts)` (automated); manual steps in `[docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md)` § *Mobile milestone M1*.
- DRY HTML if a second shell is ever added.
- Optional deferred non-critical CSS on mobile (measure first).

**M2a**

- Extract row vs container boundaries when touching DBV files for hygiene.

**M2c** (in progress — tab checklist under **M2c — database view tabs** above)

- Filter/toolbar extraction for sheet UI — **still deferred** (see refactor log).
- **Shipped so far:** `mobile-layout.css` DBV shell, tab chrome, touch targets, fluid wide filters, missions/special min-width relax; **All** tab grid and per-cell actions (see §10.2). **Characters** tab: **card-row** layout with `data-label` on most tbody cells (not the actions column); **name/stat `td` cells hidden on mobile** (`tbody td:nth-child(n+3)`); **caption** under the image on mobile (`characters-mobile-card-caption`: name, optional inherent ability, set/number); **actions** cell uses the same **+Deck** / **-Collection  +Collection** grid as **All**; height-lock coordination in `card-display.js` (`isLayoutMobile`, `layout-mode-change`). **Characters stat filters:** five stat filter columns merged into one `**th` (`colspan=5`)** with **icon tabs** (`.characters-stat-tablist` / `.characters-stat-tab`) and a single visible `**.characters-stat-panel.is-active`** on `.layout-mobile`; desktop shows all five `.column-filters` groups in one row (`database-view.css`). `**characters-stat-filter-tabs.js**` handles tab clicks and `layout-mode-change`. **Semantics:** unchanged — `=` exact value; Min/Max inclusive range; `applyFilters` in `card-filter-toggles.js` ANDs active constraints per `data-column`. **Aspects** tab (M2c checklist **done**): Special-style mobile filters minus function toggles, **Clear filters** on the icon row, **`displayAspects`** list rows + caption — see **§10.5**.
- **Special Cards tab (`.layout-mobile`):** `**thead`** is `**display: block; width: 100%**`; `**tr.special-cards-filter-row**` is `**display: flex; flex-direction: row; flex-wrap: wrap**` with `**justify-content: center**` (Characters-like border, **12px** radius). **Row 1 (full width, centered):** **function** icon toggles, teal `**|`** (`**.special-function-filter-separator**`), then compact `**#clear-special-filters-mobile**` (**“Clear filters”**, `**clear-filters-btn--special-mobile-inline`**) in `**.special-function-mobile-trailing**` (`**th.special-filter-function-th**`, `**order: 1**`). **Row 2 (full width, centered):** **power/type** icons + **No Icon** (`**th.special-filter-icon-th`**, `**order: 2**`); `**.special-function-filter-toggles**` / `**.special-power-filter-toggles**` use `**justify-content: center**`; **no** `**|`** between function row and type row (only between function toggles and Clear). **Larger touch targets:** ~~**50px** toggles, **~~34px** icons (see `**mobile-layout.css`**). **Full-width** filter `**th`** (**character**, **name**, **effect**, **value**) use `**flex: 1 1 100%`** plus `**width: 100% !important**` / `**max-width: 100% !important**` so they override `**database-view.css**` `**#special-cards-table th:nth-child(n) { width: … !important }**` (without this, stacked filters collapse into a narrow left rail). **Visual order** (flex `**order`**, DOM unchanged): **value** row (`**= / Min / Max`**, **No value** ban — `**special-value-inputs-and-clear`** **column** flex, **no** horizontal **padding** so edges match `**.header-filter`**; `**.column-filters**` **grid** `**4fr 85fr 4fr 125fr 4fr 125fr 4fr 45fr 4fr`** = **1%** buffers, **21.25 / 31.25 / 31.25 / 11.25%** filters (5% reclaimed from halving gutters split across four controls), items in cols **2 / 4 / 6 / 8**) → **character** search → **card name** search → **card text** search. `**thead tr:first-child`** labels **visually hidden**; `**#clear-special-filters-desktop`** hidden on mobile. **Tbody** matches Characters (card rows, hidden cols 3+, captions, height locks). **Desktop:** `**#special-cards-table .special-function-mobile-trailing { display: none }`** in `**database-view.css**`. Embedded DBV may differ — parity targets `**[public/index.html](public/index.html)**`.
- **Verification:** [docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md) § *Mobile milestone M2c (Card Database / DBV)*.

**M5a**

- Deck layout config: column count + pane mode from shared constants in `deck-editor-layout.js`.

---

## 8. Risks and open decisions

- **Tablet / narrow window behavior:** `layout-mobile` applies up to **900px** so the stacked shell covers small tablets and the 769–900px band where the desktop header overlapped DB controls; large phones vs small tablets may still feel similar—optional future `(pointer: coarse)` augmentation noted in §5.
- **Resize thrash:** layout-mode uses `matchMedia` `change` events.
- **Read-only vs edit:** do not show misleading Save on M5a flows; match desktop auth.
- **Open:** “Desktop site” UX copy and placement; optional cookie mirror of `localStorage` override.

---

## 9. Links

- `[docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md)` — Responsive Design + Mobile layout mode section
- `[docs/current/PROJECT_LAYOUT.md](docs/current/PROJECT_LAYOUT.md)` — repo map
- `[docs/FRONTEND_SCRIPT_MANIFEST.md](docs/FRONTEND_SCRIPT_MANIFEST.md)` — script load order

---

## 10. Recent implementation notes (global nav + DBV All tab)

Use this section as **agent context** for what shipped after the base M1/M2c milestones. Primary code: `[public/components/globalNav.html](public/components/globalNav.html)`, `[public/components/globalNav.js](public/components/globalNav.js)`, `[public/css/mobile-layout.css](public/css/mobile-layout.css)`, `[public/js/all-cards-display.js](public/js/all-cards-display.js)`, `[public/index.html](public/index.html)`.

### 10.1 Global header under `.layout-mobile`

- **Structure:** `**[header-nav-cluster](public/components/globalNav.html)`** wraps `**.header-center**` (2×2 controls) and `**.header-right**` (user menu). On **desktop**, `**[.header-nav-cluster](public/components/globalNav.css)`** uses `**display: contents**` so the absolute-centered tab bar + `**.header-right**` layout is unchanged.
- **2×2 grid:** `**[.header-app-actions](public/components/globalNav.html)`** contains `**.app-tabs**` (three view buttons) and `**#newDeckBtn**`. `**mobile-layout.css**` sets `**display: grid**` `**1fr 1fr**` with `**display: contents**` on `**.app-tabs**` so four items participate in one grid. Placement: row 1 **Card Database**  **Collection**; row 2 **Deck Builder**  **+ Deck** (IDs `**#databaseViewBtn`**, `**#collectionViewBtn**`, `**#deckBuilderBtn**`, `**#newDeckBtn**`).
- **Logged out / no `getCurrentUser`:** `**[syncHeaderCollectionLayout()](public/components/globalNav.js)`** hides Collection and adds `**.collection-tab-hidden**` on `**.header-app-actions**` so **Card Database** spans the top row (no empty cell). Called from `**updateUserWelcome()`** after greeting/menu updates.
- **Logo column:** `**.header-left`** `**flex: 0 0 30.4%**`, `**max-width: 134px**` (~20% smaller than an earlier 168px cap). `**.unified-header**` uses `**padding: 0 10px 8px**` (no top padding). `**.header-left**` uses `**align-items: flex-start**` so the logo is not vertically centered in the tall stretch column (avoids a false “gap above logo”).
- **Welcome row:** `**.user-menu-toggle`** `**justify-content: flex-end**` so text and ▶ align with the right column of buttons.
- **Account dropdown:** `**.user-menu-dropdown`** `**width` / `max-width: 50%**`, `**left: auto**`, `**right: 0**`, `**min-width: 0**` (overrides component `**min-width: 260px**` for narrow half-width panel).

### 10.2 Card Database — “All” tab (`.layout-mobile` and narrow viewport)

- `**#all-cards-grid-container**` must **not** use an inline `**grid-template-columns: repeat(5, …)`** (removed from `[public/index.html](public/index.html)`); column count comes from `**[database-view.css](public/css/database-view.css)**` (`@media (max-width: 900px)` → single column) and `**mobile-layout.css**` under `**.layout-mobile**`.
- **Per-cell actions:** Under `**.layout-mobile #database-view #all-cards-grid-container .all-cards-cell .card-content-bottom`**, CSS grid places **+Deck** full width, then **-Collection** (left) and **+Collection** (right) on the next row (DOM order differs; explicit grid placement). Comment anchor in `**mobile-layout.css`**: `All tab cell actions`.
- **Characters tab row actions:** Under `**.layout-mobile #characters-table tbody td:nth-child(2)`**, the same grid pattern (**+Deck** full width; **-Collection** left, **+Collection** right). The actions `**td`** has **no** `**data-label`** so mobile does not show a **Deck & collection** pseudo label (`displayCharacters` in `**public/js/card-display.js`**).
- **Characters tab stats on mobile:** `**tbody td:nth-child(n+3)`** (**name** through **inherent abilities**) use `**display: none`** under `**.layout-mobile**` — card rows are **image + actions** only; filters still run against hidden cells.
- **All + Characters tile art (`.layout-mobile`):** Desktop **All** tab keeps `**max-width: 200px`** in `**database-view.css**`. Under `**.layout-mobile**`, `**mobile-layout.css**` sets `**#database-view**` custom properties `**--dbv-mobile-tile-img-max**` (`min(100%, calc(100vw - 28px))`) and `**--dbv-mobile-tile-img-landscape-max-h**` (`min(56vw, 480px)`). **All tab** `**#all-cards-grid-container`**: `**.all-cards-img-wrap**` and `**.all-cards-cell img**` use `**--dbv-mobile-tile-img-max**`; `**img.horizontal-card**` uses `**width: 100%**` and `**max-height: none**` so landscape tiles match portrait width (the landscape `**max-height**` token is for **Characters** / table rows, not the All grid). **Characters** tbody landscape art still uses `**max-height: var(--dbv-mobile-tile-img-landscape-max-h)`** with the same `**--dbv-mobile-tile-img-max**` width cap.
- **Characters tab image size (mobile):** `**tbody td:first-child .card-image-container`**: `**display: flex**`, `**width: 100%**`, `**max-width: 100%**`, `**margin-inline: auto**` (**prev | img | next**). `**img`**: `**max-width: var(--dbv-mobile-tile-img-max)**`, `**flex: 0 1 auto**`, `**object-fit: contain**`. Landscape art adds `**horizontal-card**` (same rule as `**all-cards-display.js**`: `**naturalWidth > naturalHeight**`); scoped `**max-height: var(--dbv-mobile-tile-img-landscape-max-h)**`. `**applyDbvHorizontalCardClass**` in `**card-display.js**` on image `**load**` and after `**navigateCardImage**` `**src**` changes. Inline `**max-width: 316px**` still skipped when `**isLayoutMobile()**`; mobile inline styles omit `**width` / `max-width**` so CSS owns dimensions. Caption `**max-width**` still `**min(444px, 100%)**` for long set lines.
- **Characters tab caption (mobile):** `**characters-mobile-card-caption`** under the image (`**characterMobileCaptionLines**` in `**card-display.js**`): line 1 = full `**name**`; line 2 = `**special_abilities**` when non-empty (same as Inherent Abilities column), `**.characters-mobile-card-caption__ability**`; line 3 = `**translateSet(set)**` + `**set_number**` (not text from parentheses — those stay on line 1); `**navigateCardImage**` syncs all lines when changing art.

### 10.3 Card Database — “Special Cards” tab (`.layout-mobile`)

- **Critical image sizing fix:** `database-view.css` has `td img { max-height: 180px !important }` that caps ALL table images. Mobile portrait image rules must include `max-height: none !important` to override this. **Repeatable fix pattern for all DBV tabs:** `[docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)`.
- **Prerequisite:** List art, hover, and lightbox scaling under this section apply only when `**<html>`** has `**layout-mobile**`. `**preferDesktopLayout**` (`localStorage` `**preferDesktopLayout=1**`) forces `**layout-desktop**` on narrow viewports, so `**displaySpecialCards**` keeps **120px** inline table art and **none** of the `**.layout-mobile #special-cards-table`** rules run — if “mobile Special” tweaks seem to do nothing, check this first (compare with **Characters** on the same device).
- **Markup:** `[public/index.html](public/index.html)` — `**tr.filter-row.special-cards-filter-row`**; `**th**` classes `**special-filter-***`; placeholders **Search character…** / **Search card name…** / **Search card text…**; `**#clear-special-filters-mobile`** sits in `**th.special-filter-function-th**` (`**.special-function-mobile-trailing**`) next to function toggles; value column is `**column-filters**` only inside `**special-value-inputs-and-clear**`.
- **CSS:** `[public/css/mobile-layout.css](public/css/mobile-layout.css)` — **Special Cards tab**: block `**thead`**, flex filter `**tr**`, full-width `**th**` overrides vs `**database-view.css**` `**!important**` column widths, `**order**` for filter rows, value sheet, tbody card layout. Desktop hides `**.special-function-mobile-trailing**` via `[public/css/database-view.css](public/css/database-view.css)`. **List art (~1.5× vs Characters):** `**#special-cards-table`** defines `**--dbv-mobile-special-portrait-img**` (`**min(100%, 870px)**` — avoids `**100vw**` clipping vs padded cells), `**--dbv-mobile-special-tile-img-max**`, `**--dbv-mobile-special-tile-img-landscape-max-h**`; portrait with nav uses `**flex: 1 1 0**` between arrows; tbody `**img**` rules use these instead of the shared `**--dbv-mobile-table-portrait-img***` / tile tokens where applicable. **Mobile caption** `**max-width`** `**min(666px, 100%)**`. `**@media (max-width: 900px)**` duplicates the **tbody / art / hover / lightbox** rules for `**#database-view #special-cards-table`** (and global hover/lightbox selectors) so **narrow viewports** still get large list art when `**layout-desktop`** (`**preferDesktopLayout**`). **Hover:** `**.layout-mobile .card-hover-modal[data-card-type='special']`** — tighter `**padding**`, larger `**max-width` / `max-height**` on `**.card-hover-image**` (and full-res layer). **Lightbox:** `**.layout-mobile #imageModal[data-open-context='special'] #modalImage`** — larger caps when `**openModal**` sets `**data-open-context**` from `**data-dbv-lightbox-context**` on the clicked `**img**`.
- **JS:** `[public/js/card-display.js](public/js/card-display.js)` — `**specialMobileCaption`**, `**buildSpecialMobileCaptionHtml**`, `**specialCardEffectPlainForMobileCaption**` (strips keyword tokens from the effect line; OPD/Cataclysm/Assist/Ambush use DB flags), `**clearSpecialRowHeightLocks**` / `**refreshSpecialTableHeightLocks**`, `**lockAllSpecialCardRowHeights**` and per-row locks gated by `**isLayoutMobileForCardDisplay()**`. `**isNarrowViewportDbvBand()**` (`**matchMedia('(max-width: 900px)')**`) is combined with `**isLayoutMobileForCardDisplay()**` for Special list inline styles and height locks so `**layout-desktop**` on a phone still omits **120px** width. Special list `**img`** includes `**data-dbv-lightbox-context="special"**` for the image modal. `**[public/js/modal-ui.js](public/js/modal-ui.js)**` `**openModal**` / `**closeModal**` set or clear `**#imageModal**` `**data-open-context**`. `**[public/js/card-hover-modal.js](public/js/card-hover-modal.js)**` `**positionModal**` uses a larger viewport-clamp box for `**special**` when `**isLayoutMobile()**` or the same **900px** breakpoint matches.

### 10.4 Tests and docs map

- **Confirmed fix + repeatable pattern:** `[docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md](docs/current/MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)` — `max-height: none !important` override checklist for every DBV tab. Apply when mobilizing any tab with card images in `<td>` elements.
- **What we tried (mobile DBV art + `#imageModal`):** `[docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md](docs/current/MOBILE_DBV_CARD_IMAGE_TRIES.md)` — CSS/JS approaches that shipped; why the UI can still look unchanged (layout mode, cache, list vs modal); pointers for the next fix. **§ Confirmed failed / ineffective (user QA)** records approaches that still showed tiny Special list art in real use (~Mar 2026).
- **Unit:** `[tests/unit/layout-mode-and-viewport.test.ts](tests/unit/layout-mode-and-viewport.test.ts)` — `layout-mode.js`, `**mobile-layout.css`**: global nav + DBV **All** strip (M1 describe), **DBV Characters tab**, **DBV Special Cards tab** (block `**thead`**, flex filter `**tr**`, `**width: 100% !important**` on filter `**th**`, `**order**` rows, value sheet + function-row Clear, tbody cards); `**public/index.html**` asserts `**special-cards-filter-row**` and `**clear-special-filters-mobile**`. **Aspects** mobile DBV: [tests/unit/dbv-aspects-mobile.test.ts](tests/unit/dbv-aspects-mobile.test.ts) (CSS, `database-view.css`, markup, `displayAspects` source + JSDOM).
- **Integration:** `[tests/integration/global-nav-integration.test.ts](tests/integration/global-nav-integration.test.ts)` — served `**globalNav.html`** / `**.css**` include `**header-nav-cluster**`, `**header-app-actions**`.
- **Style spec:** `[docs/current/STYLE_GUIDE.md](docs/current/STYLE_GUIDE.md)` — *Mobile Adaptations* / *Mobile layout mode* (global nav + DBV bullets).
- **Manual QA:** `[docs/current/TESTING_GUIDE.md](docs/current/TESTING_GUIDE.md)` — § *Mobile milestone M1* and *M2c* (All, Characters, Special Cards, **Aspects**).

### 10.5 Card Database — “Aspects” tab (`.layout-mobile`) — **done**

**M2c tab checklist** (§6): **Aspects** = **done**.

- **How it looks (filters, caption, actions, desktop chrome):** [`docs/current/DBV_ASPECTS_MOBILE.md`](docs/current/DBV_ASPECTS_MOBILE.md). **Regression tests:** [`tests/unit/dbv-aspects-mobile.test.ts`](tests/unit/dbv-aspects-mobile.test.ts).
- **Filter shell:** Same pattern as **Special Cards** (`flex` **`tr.aspects-filter-row`**, teal border shell) but **no** function-icon row; **mobile `order`**: **`.aspect-filter-icon-row`** — power types + No Icon (flex-grow center strip) + **`#clear-aspects-filters-mobile`** in **`.aspect-icon-mobile-trailing`** (**`margin-left: auto`**, right-aligned) → value sheet only → location / name / card text **`header-filter`** rows. **`[public/css/mobile-layout.css](public/css/mobile-layout.css)`**, **`[public/css/database-view.css](public/css/database-view.css)`** (hide **`.aspect-icon-mobile-trailing`** on desktop).
- **List rows:** **`displayAspects`** in **`[public/js/card-display-functions.js](public/js/card-display-functions.js)`** — **`card-image-container`**, **`--dbv-mobile-aspects-*`** art tokens, under-image **`characters-mobile-card-caption`** with **name → location → effect (plain) → Fortification! → One Per Deck**; fort/OPD table columns hidden on mobile. Helpers from **`[public/js/card-display.js](public/js/card-display.js)`**: **`isLayoutMobileForCardDisplay`**, **`isNarrowViewportDbvBand`**, **`specialCardEffectPlainForMobileCaption`** (exported on **`window`**). **`@media (max-width: 900px)`** **`#database-view #aspects-table`** mirror for **`preferDesktopLayout`** on narrow viewports.

