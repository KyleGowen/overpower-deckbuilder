# DBV Aspects tab — mobile view (how it looks)

This document explains **how the Aspects tab** of the Card Database (`#aspects-table`) is built for **mobile layout** (`html.layout-mobile`) and for **narrow viewports** (`max-width: 900px`) when the user forces **desktop layout** (`preferDesktopLayout`). It complements [`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md) §10.5 and the **Aspects** bullets in [`STYLE_GUIDE.md`](STYLE_GUIDE.md).

## Goals

- **Match Special Cards** mobile DBV patterns (teal filter shell, stacked full-width filter rows, value grid, card-row tbody) **without** the six **function** icon toggles (aspects have no per-card function fields).
- **Large list art** on phone: same idea as Special — CSS variables on `#aspects-table`, **`max-height: none !important`** on portrait `img` so desktop `database-view.css` does not cap rows at 180px (see [`MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md`](MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX.md)).
- **Fortifications** and **One Per Deck** columns are **hidden** on mobile; optional lines appear in the **under-image caption** instead.

## When “mobile list art” and caption run in JS

[`displayAspects`](../../public/js/card-display-functions.js) sets **`useMobileListArt`** when either:

- `window.isLayoutMobileForCardDisplay()` is true (`layout-mobile` + database view), or  
- `window.isNarrowViewportDbvBand()` is true (`matchMedia('(max-width: 900px)')`) so **`preferDesktopLayout`** on a phone still gets large art and caption.

Helpers live on `window` from [`card-display.js`](../../public/js/card-display.js) (exported for aspects). **Plain effect** text for the caption uses `specialCardEffectPlainForMobileCaption` (HTML stripped).

## Filter shell (thead)

Under **`.layout-mobile #aspects-table`** in [`mobile-layout.css`](../../public/css/mobile-layout.css):

- **`thead`** is **`display: block`**, **`width: 100%`**.
- First label row: **visually hidden** (clip), same pattern as Special.
- **`tr.aspects-filter-row`**: flex row + wrap, **12px** radius, teal border/background tokens (`--aspects-header-shell-*`).
- **Hidden on mobile:** desktop Clear column, spacer, empty fort/OPD filter **`th`**.
- **Flex `order` (visual order):**
  1. **Icon row** (`th.aspect-filter-icon-th`) — **`.aspect-filter-icon-row`**: centered power-type toggles + No Icon; **`.aspect-icon-mobile-trailing`** with **`margin-left: auto`** holds **`#clear-aspects-filters-mobile`** (“Clear filters”, **≥44px** height).
  2. **Value** — **`.aspects-value-inputs-and-clear`** / **`.special-value-filters-inner`**: same **`column-filters`** grid as Special (**`4fr 85fr 4fr 125fr 4fr 125fr 4fr 45fr 4fr`**), **`=` / Min / Max / No value** ban control in grid columns **2 / 4 / 6 / 8**.
  3. **Location** search (placeholder **Search location…**).
  4. **Card name** search.
  5. **Card text** search.

**Desktop:** **`.aspect-icon-mobile-trailing`** is **`display: none`** in [`database-view.css`](../../public/css/database-view.css); Clear stays in the desktop column. Value wrapper uses **`display: block`** so the value row spans correctly.

## No value (ban) control

Aspects reuse **`.special-no-value-toggle-label` / `-face` / `-svg`** with **`#aspect-no-value-toggle`**. **`database-view.css`** mirrors **`#special-cards-table`** button chrome (36×36 face, border, hover, checked teal, focus ring) so the control matches Special on **desktop**. Mobile adjusts face sizing inside the value grid (see `mobile-layout.css`).

## Tbody: card rows, actions, caption

- **`tbody tr`**: block card, **10px** radius; **`td:nth-child(n+3)`** hidden (detail columns); only **image** + **actions** show, like Special/Characters.
- **Actions `td`:** **no `data-label`** — avoids a teal **ACTIONS** pseudo heading from **`td[data-label]::before`**.
- **Grid:** **+Deck** full width; **-Collection** | **+Collection** second row (same as All / Special).
- **Image:** **`--dbv-mobile-aspects-portrait-img`**, **`--dbv-mobile-aspects-tile-img-max`**, **`--dbv-mobile-aspects-tile-img-landscape-max-h`**; portrait **`max-height: none !important`**; landscape **`horizontal-card`** uses the landscape token.
- **Caption** (only when mobile list art): **`.characters-mobile-card-caption`** under the image — **name** → **location** → **plain effect** → optional **Fortification!** → optional **One Per Deck**. **`__fortification`** and **`__opd`** use **`font-weight: 700`** when present.
- **Lightbox:** **`data-dbv-lightbox-context="aspect"`** on the list **`img`**.

## Narrow viewport mirror

Inside **`@media (max-width: 900px)`**, **`#database-view #aspects-table`** repeats tbody + art + caption + fort/opd typography so **layout-desktop** at **≤900px** still matches phone sizing.

## Automated tests

[`tests/unit/dbv-aspects-mobile.test.ts`](../../tests/unit/dbv-aspects-mobile.test.ts) locks:

- **`mobile-layout.css`**: filter shell, order, value grid, action grid, art tokens, **`max-height` override**, caption + bold fort/opd, **`data-label::before`**, **900px** mirror.
- **`database-view.css`**: desktop hiding of **`.aspect-icon-mobile-trailing`**, value wrapper, **#aspects-table** no-value chrome.
- **`index.html`** + **`templates/database-view-complete.html`**: required IDs/classes/placeholders.
- **`card-display-functions.js`**: source contract (no **`data-label="Actions"`**, caption hooks, lightbox context).
- **JSDOM**: **`displayAspects`** output for mobile vs desktop vs narrow-band branches.

Run: `npm run test:unit -- tests/unit/dbv-aspects-mobile.test.ts`

## Related files (quick map)

| Area | File |
|------|------|
| Markup | [`public/index.html`](../../public/index.html), [`public/templates/database-view-complete.html`](../../public/templates/database-view-complete.html) |
| Mobile CSS | [`public/css/mobile-layout.css`](../../public/css/mobile-layout.css) (search `Aspects tab`) |
| Desktop / shared | [`public/css/database-view.css`](../../public/css/database-view.css) (`#aspects-table`) |
| Render | [`public/js/card-display-functions.js`](../../public/js/card-display-functions.js) (`displayAspects`, `aspectUseMobileListArt`, `aspectMobileCaptionOptionalLine`) |
| Layout helpers | [`public/js/card-display.js`](../../public/js/card-display.js) (`isLayoutMobileForCardDisplay`, `isNarrowViewportDbvBand`, caption plain text) |
