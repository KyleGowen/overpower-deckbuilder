# Collection view — mobile layout (`layout-mobile`)

> ⚠️ **LEGACY (v1) DOCUMENT.** This describes the deprecated **v1 vanilla-JS UI in `public/`**. The production frontend is the **v2 React SPA in `frontend/`** — see [`FRONTEND_V2.md`](FRONTEND_V2.md). The v1 UI is served only as a rollback (`EXCELSIOR_DISABLE_SPA=1`); do not build new features from this document. Use the v2 feature/component docs under `frontend/src/` instead.

This document describes the **Collection** tab (`#collection-view`) when **`html`** has **`layout-mobile`** (viewport-based layout mode, typically **≤900px**). It complements [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) **§10.7**, the **Collection view — mobile** section in [`STYLE_GUIDE.md`](STYLE_GUIDE.md), and [`public/js/.cursorrules`](../../public/js/.cursorrules).

Desktop Collection (**DTV**) keeps the wide sortable table (`#collection-table`); mobile (**MV**) uses a **list + bottom-sheet detail** and does **not** mirror desktop column-sort UI inside the list panel.

## Goals

- **One screen, readable rows:** thumb, title, subtitle (**Type · # · Set**), quantity controls (owned: **−** / count / **+**; unowned: single **+**).
- **Fixed list order on MV:** always **`set_number` ascending** via **`sortMergedCollectionCards`**, driven by module constants in **`collection-view.js`** (`COLLECTION_MOBILE_LIST_SORT_FIELD`, `COLLECTION_MOBILE_LIST_SORT_DIR`). Same comparator rules as the desktop **#** column (set code primary, foil tier, numeric set number — see **Collection table sort** in [`STYLE_GUIDE.md`](STYLE_GUIDE.md)); desktop thead sort does **not** change MV order.
- **No duplicate “find a card” field in the glass panel:** add-to-collection search stays **`#collectionSearchInput`** + **`CardSearchService`** / **`DeckEditorSearch`** only.
- **No in-panel list filter or sort chrome:** the rendered list does **not** include **`#collectionMobileListFilter`** or **`#collectionMobileSort`** (regression-tested in [`tests/unit/collection-view.test.ts`](../../tests/unit/collection-view.test.ts)).
- **Detail sheet** for inspect/adjust: full-width scrim, bottom panel, **Back** / scrim / **Escape**; row tap opens detail; clicks on **`.collection-quantity-control`** or other **buttons** do not open detail (delegate handler bails out).

## When MV markup runs

- **`collectionIsLayoutMobile()`** in [`public/js/collection-view.js`](../../public/js/collection-view.js) delegates to **`window.isLayoutMobile()`** (from [`public/js/layout-mode.js`](../../public/js/layout-mode.js)).
- **`displayCollectionCards`** closes any open detail when entering MV, sorts **`visibleCards`**, builds **`#collection-mobile-list`** / **`.collection-mobile-row`**, and injects into **`#collectionCardsList`**.
- **`visibleCards`** still respects **`showUnownedCards`** (**`#showUnownedToggle`**) and the empty states (**empty collection** vs **no rows after filter**).

## DOM and behavior (quick map)

| Piece | Id / class / note |
|-------|-------------------|
| List host | `#collectionCardsList` |
| List | `#collection-mobile-list.collection-mobile-list` |
| Row | `li.collection-mobile-row` (+ **`collection-card-unowned`** when not in collection) |
| Row tap target | **`.collection-mobile-row-main`** (delegate on `#collection-view` opens detail) |
| Detail root | `#collectionMobileDetail.collection-mobile-detail` (created under `#collection-view` by **`ensureCollectionMobileDetailPanel`**) |
| Dialog | `#collectionMobileDetailPanel` **`role="dialog"`** |
| Detail actions | **`.collection-mobile-detail-actions`** — owned: **−** / qty / **+** via **`handleCollectionMobileDetailQuantityClick`**; unowned: **`collection-add-btn`** → **`addCardToCollection`** |

## Layout mode changes

**`layout-mode-change`:** **`onCollectionLayoutModeChange`** closes the detail sheet, syncs guest sandbox banner state, and if **`#collection-view`** is visible, re-runs **`displayCollectionCards(mergedCollectionData)`** so table vs list stays correct.

**Delegate:** **`initializeCollectionView`** attaches **`click` → `onCollectionViewMobileActivate`** once per **`#collection-view`** (**`data-collection-mobile-delegate-bound`**).

## CSS

Mobile Collection rules live in [`public/css/collection-view.css`](../../public/css/collection-view.css) under **`html.layout-mobile`** (list grid, row thumb, detail overlay **`z-index: 10000`**, guest banner MV tweaks). Global shell remains in [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css) where shared with other views.

**Typography:** all font sizes in mobile Collection markup use the shared token scale (**`--font-3xs..2xl`**, **`--icon-sm/md/lg`**) defined on **`html.layout-mobile`** in [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css). Page title is **`--font-2xl`**, subtitle is **`--font-lg`**, search input is **`--font-sm`**, row title is **`--font-md`** with **`--font-xs`** subtitle, qty steppers are **`--font-2xs`**, detail heading is **`--font-md`** with **`--font-sm`** body, sandbox banner glyph is **`--icon-md`**. Do **not** add literal `font-size` to mobile rules — always reference a token. Scale and rules: [`MOBILE_DESIGN.md §10.8`](../../MOBILE_DESIGN.md#108-mobile-fluid-typography-tokens-htmllayout-mobile--done).

## GUEST

**`details#guestSandboxBanner`:** collapsed summary on MV, expanded copy + signup link; DTV stays an always-visible row. See **Collection view — mobile** in [`STYLE_GUIDE.md`](STYLE_GUIDE.md).

## Automated tests

[`tests/unit/collection-view.test.ts`](../../tests/unit/collection-view.test.ts) covers merge/sort, DTV table behavior, and MV: list vs table, absence of in-panel filter/sort ids, detail open/close, **set #** order, owned vs unowned row controls, detail content and steppers, **Escape**, delegate activation vs quantity button, and detail quantity **PUT** wiring.

**Coverage note:** the suite loads **`public/js/collection-view.js`** via **`eval`** with selective **`window`** exports. Default unit Jest **`collectCoverageFrom`** targets **`src/**/*.ts`**, so **Istanbul does not attribute line coverage** to that JS file; assertions still exercise MV behavior. See the file header comment in **`collection-view.test.ts`**.

Run:

```bash
npm run test:unit -- --testPathPattern=collection-view
```

## Related files

| Area | File |
|------|------|
| Logic | [`public/js/collection-view.js`](../../public/js/collection-view.js) |
| Styles | [`public/css/collection-view.css`](../../public/css/collection-view.css) |
| Layout mode | [`public/js/layout-mode.js`](../../public/js/layout-mode.js) |
| Shell / nav | [`public/components/globalNav.js`](../../public/components/globalNav.js) (`syncHeaderCollectionLayout`) |
| Backend API | `src/services/collectionService.ts`, `src/routes` collections routes, `src/database/collection/` |
