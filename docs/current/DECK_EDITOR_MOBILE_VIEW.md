# Deck Editor — Mobile View (DEV in MV)

This document is the **implementation reference** for the **Deck Editor View (DEV)** when the app is in **mobile layout mode** (`html.layout-mobile`, `window.isLayoutMobile() === true`). It complements:

- **[`DECK_EDITOR_CARD_VIEW_LAYOUT.md`](DECK_EDITOR_CARD_VIEW_LAYOUT.md)** — desktop **Card View** tiles (landscape/portrait, image chrome); not the mobile list.
- **[`STYLE_GUIDE.md`](STYLE_GUIDE.md)** — high-level tokens and the “Deck editor (DEV in MV)” bullet under **Mobile Adaptations**.
- **[`MOBILE_DESIGN.md`](../../MOBILE_DESIGN.md)** — global `layout-mobile` strategy and milestones.

**Terminology (project acronyms):**

| Term | Meaning |
|------|---------|
| **DEV** | Deck Editor View — the modal where users edit a deck (`#deckEditorModal`). |
| **MV** | Mobile view — narrow shell + `layout-mobile` on `<html>`. |
| **DTV** | Desktop view — wide shell; deck editor can use list view, card view, two-column pane, etc. |

The mobile DEV shell is **not** the Card Database (DBV). It only edits **`window.deckEditorCards`** inside the deck modal.

---

## When this UI is active

1. **`isLayoutMobile()`** is true (viewport ≤ 900px unless overridden by `preferDesktopLayout`).
2. The deck editor modal is open and visible (`#deckEditorModal`).
3. **`refreshDeckEditorLayoutMode()`** (or equivalent) runs **`renderDeckEditorMobileView()`** instead of list/card view renderers.

**Script load order** (from [`public/index.html`](../../public/index.html)): `deck-editor-rendering.js` loads **before** `deck-editor-mobile-view.js` so **`window.deckEditorCardHasAlternateArts`** exists when the mobile script runs.

---

## File map

| Area | Path |
|------|------|
| Logic | [`public/js/deck-editor-mobile-view.js`](../../public/js/deck-editor-mobile-view.js) |
| Styles | [`public/css/deck-editor-mobile.css`](../../public/css/deck-editor-mobile.css) |
| Modal chrome + flyout shell | [`public/index.html`](../../public/index.html) — `#devMobileDeckChrome`, `#devMobileDeckHeaderStats`, `#devMobileDeckActionsSheet`, `#deckEditorModal` header tweaks |
| Alternate-art predicate (shared with DTV rendering) | [`public/js/deck-editor-rendering.js`](../../public/js/deck-editor-rendering.js) — **`deckEditorCardHasAlternateArts`**, exported as **`window.deckEditorCardHasAlternateArts`** |
| Closes flyout when editor closes | [`public/js/deck-editor-core.js`](../../public/js/deck-editor-core.js) — **`closeDevMobileDeckActionsSheet`** |

---

## DOM overview (inside `#deckEditorModal`)

**Vertical rhythm (MV):** [`deck-editor-mobile.css`](../../public/css/deck-editor-mobile.css) reduces top dead space vs DTV: **`.modal-content.deck-editor-modal`** **`margin: 8px auto`**, **`body.deck-editor-active`** **`padding: 4px`**, **`.modal-header`** **`padding: 8px 12px 4px 12px`**, title block **`padding: 4px 0 6px 2px`**, **`.deck-title-with-validation`** **`gap: 6px`**, stats inner **`4px 4px 6px`**, collapsed header **`6px`** vertical padding.

### Header (MV-only blocks)

- **`#devMobileDeckHeaderExpandableRegion`** (`.dev-mobile-deck-header-expandable`) — wraps **`.deck-editor-title-section`** + **`.deck-summary-section`** (summary hidden on MV) so title/meta can be hidden when the header is collapsed.
- **`.dev-mobile-deck-header-stats`** (`#devMobileDeckHeaderStats`) — MAX/TOTAL energy–intelligence grid; same numeric IDs as desktop summary helpers (`#deckMobileMaxEnergy`, …).
- **`#devMobileDeckChrome`** — pill search **`.dev-mobile-deck-search-container`** with **`#devMobileDeckSearchInput`** and **`#devMobileDeckSearchResults`**, wrapped with **`#devMobileDeckHeaderCollapseToggle`** in **`.dev-mobile-deck-mv-search-row`** (flex row: search **`flex: 1`**, chevron at the right). When collapsed, the row uses **`display: contents`** so **search / hamburger / toggle** still form the parent header grid.
- **`#devMobileDeckHeaderCollapseToggle`** — small subtle chevron (**`deck-editor-mobile.css`**: ~**26×26px**, muted slate triangle, light border) to the **right of the search pill** in **`.dev-mobile-deck-mv-search-row`** when expanded; **`modal-header.dev-mobile-deck-header-collapsed`** hides the expandable region + stats and keeps **search + hamburger + toggle** on a single compact row. Preference: **`localStorage`** key **`devMobileDeckHeaderCollapsed`** (`'1'` = collapsed). **`window.applyDevMobileDeckHeaderCollapsed`**, **`window.syncDevMobileDeckHeaderCollapsedState`** in [`deck-editor-mobile-view.js`](../../public/js/deck-editor-mobile-view.js).
- **`.deck-editor-right-controls`** — hamburger **`.deck-editor-controls-menu`** (Draw Hand, Background, Preview, Export/Import, Save, Cancel). Styling lives in [`public/css/index.css`](../../public/css/index.css) (z-index ~10049–10051). **Expanded MV:** **`align-self: start`** on the header grid so the menu sits **top-right** with the deck title line; **collapsed** banner uses **`align-self: center`** so it lines up with the search row ([`deck-editor-mobile.css`](../../public/css/deck-editor-mobile.css)). **`#deckEditorControlsMenuPanel`** when open on MV (and narrow **≤480px** DTV): **`position: fixed`**, **`width: min(280px, calc(100vw - 32px))`**; **`left`** / **`top`** via **`positionDeckEditorControlsMenuPanel()`** in [`deck-editor-core.js`](../../public/js/deck-editor-core.js) (anchored to the toggle, viewport-clamped). **`absolute` + percentage `left`** was relative to the small menu shell and skewed the panel off-screen; an earlier **`fixed` + viewport-center** fix left the panel visually detached from the button.
- **`DeckEditorSearch`** — **`clickInsideRootSelectors`** still includes **`.dev-mobile-deck-search-container`** ([`DeckEditorSearch.js`](../../public/js/components/DeckEditorSearch.js)). MV enables `enableMultiSelect`: each result gets a right-side checkbox tap target plus a sticky **Add selected (N)** action in the dropdown. Tapping the thumbnail/name/type area still single-adds that result.

### Body — deck list

- **`#deckCardsEditor`** — under MV, **`display: block`**; inline `style` from DTV is cleared with **`removeAttribute('style')`** so flex/two-column rules do not win.
- Rendered HTML root: **`.dev-mobile-deck-list-root`**.

### Row actions flyout (card menu)

- **`#devMobileDeckActionsSheet`** — class **`dev-mobile-deck-row-menu`**: full-viewport layer with backdrop + fixed panel.
- **`#devMobileDeckActionsPanel`** — **`deck-editor-controls-menu-panel dev-mobile-deck-row-menu-panel`**: visually matches the header hamburger dropdown, scaled down (padding, row height, 18px icons).
- **`#devMobileDeckActionsBody`** — **`dev-mobile-deck-row-menu-items`**: injected menu rows.

**Z-index:** flyout uses **10052** (backdrop) / **10053** (panel), above the hamburger stack so the card menu stacks correctly when open.

---

## List structure: type sections and rows

### Collapsible sections

- One **`<section class="dev-mobile-deck-type-section">`** per non-empty type in **`TYPE_ORDER`** (character → … → power).
- Header: **`.dev-mobile-deck-type-header`** toggles **`toggleDevMobileDeckType(type)`**.
- Expansion state: **`deckEditorExpansionState`** (declared in `index.html` as `let`, **not** on `window`). **`getDeckExpansionState()`** in the mobile script reads it or falls back to **`window.deckEditorExpansionState`**.
- **`saveDeckExpansionState()`** persists toggles when available.

### Card rows

Each logical line in the deck is a **`.dev-mobile-deck-row`** with:

| Attribute / region | Role |
|--------------------|------|
| **`data-deck-index`** | Index into **`window.deckEditorCards`**. |
| **`data-instance`** | 0-based instance when **`quantity > 1`** (separate row per copy for stackable types). |
| **`.dev-mobile-deck-row-thumb`** | Square thumb; **`getCardImagePath`** + **`getDeckEditorCardViewInitialImagePath`** (thumb-first for character/location/mission where applicable). |
| **`.dev-mobile-deck-row-name`** | **`devMobileDisplayName(card, instanceAvailable)`** — type-specific label (power value/type, teamwork line, etc.). Typography: **`font-weight: 400`**, **`font-size: 0.9rem`**, **`color: #f8fafc`** ([`deck-editor-mobile.css`](/public/css/deck-editor-mobile.css)). |
| **`.dev-mobile-deck-row-actions`** | Quantity controls + optional **⋯**. |

### Quantity controls (`canStack`)

- **`canStack`** is false for **character**, **location**, and **mission** — one **−** removes the whole card / row semantics match **`removeCardFromEditor`**.
- Other types: **−** / **+** call **`removeOneCardFromEditor`** / **`addOneCardToEditor`**.
- Read-only / preview-as-owner-false: no action buttons (**`isDeckEditorReadOnlyUi()`**).

---

## ⋯ (overflow) visibility and menu contents

The **⋯** button is rendered **only** when **`collectDevMobileDeckRowSheetParts(card, deckIndex, instanceIndex).length > 0`**. The same function builds the flyout HTML, so the row never advertises an empty menu.

### Actions included (when applicable)

| Condition | UI | Handler / notes |
|-----------|-----|-----------------|
| Type is character, special, power, or location **and** **`deckEditorCardHasAlternateArts(acForAlt, card.type)`** | Change art | **`showAlternateArtSelectionForExistingCard`**, per-instance via **`resolveInstanceCardId`** |
| **`foilCardMap[instId]`** defined | Foil | **`toggleFoilForCard`**; **`instId`** from **`resolveInstanceCardId`** |
| Character + logged in | KO / Un-KO | **`toggleKOCharacter`** |
| Character + **`getReserveCharacterButton`** returns HTML | Custom block | **`.dev-mobile-deck-row-menu-custom`** |
| Training + **`hasSpartanTrainingGround()`** | Pre-placed / Include in draw | **`drawTrainingCard`** |
| Basic universe + **`hasDraculasArmory()`** | Same pattern | **`drawBasicUniverseCard`** |
| Special Sword and Shield + **`hasLancelot()`** | Same pattern | **`drawSwordAndShield`** |
| Mission + **`getDisplayMissionButton`** returns HTML | Custom block | **`.dev-mobile-deck-row-menu-custom`** |

**Alternate art detection** must stay aligned with **`deck-editor-rendering.js`** (card view / preview tiles). Do not duplicate divergent counting logic in the mobile file — call **`window.deckEditorCardHasAlternateArts`**.

### Menu presentation

- Primary actions use **`deck-editor-menu-panel-btn`** + **`deck-editor-menu-item-label`** + **`deck-editor-menu-item-icon`** (same structural pattern as the hamburger panel in **`index.css`**).
- Icons are inline SVGs (change art, foil, KO, “hand” for draw/pre-placed) defined in **`deck-editor-mobile-view.js`**; size is controlled in **`deck-editor-mobile.css`**.

---

## Opening, positioning, and closing the flyout

### Entry point

- **`openDevMobileDeckRowSheet(deckIndex, instanceIndex, anchorEl)`** — **`anchorEl`** should be the **⋯** button (`this` from inline `onclick`).
- Fallback: **`querySelector('.dev-mobile-deck-row[data-deck-index="…"][data-instance="…"] .dev-mobile-deck-overflow-btn')`** if **`anchorEl`** is missing.

### Positioning

- **`positionDevMobileRowMenuPanel(anchorEl)`** — **`position: fixed`**, aligns panel **right edge** to the trigger’s **right** by default, flips **above** the button if there is not enough space below, clamps to **12px** viewport margins.

### Dismissal

- Backdrop **`onclick="closeDevMobileDeckActionsSheet()"`**.
- **`document`** **`mousedown`** listener (**`devMobileRowMenuOutsideDown`**) — ignores clicks inside the panel or on the anchor button.
- **Escape** key (global listener in the mobile script).
- Clicking a **`<button>`** inside the panel closes after **`requestAnimationFrame`** (init once via **`#devMobileDeckActionsPanel`** **`data-dev-mobile-menu-init`**).
- **`closeDevMobileDeckActionsSheet`** clears panel **`top`/`left`/`visibility`**, **`hidden`** on sheet/panel, removes the mousedown listener, clears **`_devMobileDeckRowMenuAnchor`**.

### Re-render behavior

- **`renderDeckEditorMobileView`** calls **`closeDevMobileDeckActionsSheet()`** at the start (after layout checks) so the flyout does not reference removed row nodes when the list is rebuilt.

### Layout mode switch

- **`refreshDeckEditorLayoutMode()`** — if leaving MV, calls **`closeDevMobileDeckActionsSheet()`** and restores DTV renderers (card/list/**`displayDeckCardsForEditing`**).
- **`layout-mode-change`** document event triggers **`refreshDeckEditorLayoutMode`**.

---

## Integration points (do not break casually)

| Concern | Behavior |
|---------|----------|
| **`window.deckEditorCards`** | Source of truth for list content and indices. |
| **`availableCardsMap`** | **`lookupAvailableCard`** resolves **`type_cardId`** and hyphen/underscore type keys. |
| **`deck-editor-core.js`** | **`showDeckEditor`**, closing editor, etc. should keep **`closeDevMobileDeckActionsSheet`** in sync so no orphan overlay remains. |
| **KO dimming** | After render, **`applyKODimming()`** when **`currentUser`**. |
| **Search** | **`initializeDeckEditorSearch()`** from **`refreshDeckEditorLayoutMode`** when modal visible. |
| **Two-column / divider** | DTV-only; MV skips **`createTwoColumnLayout`** when **`isLayoutMobile()`** (see **`deck-editor-core.js`**). |

---

## Read-only and preview

- **`isPreviewReadOnlyMode`** or **`currentDeckData.metadata.isOwner === false`** → **`isDeckEditorReadOnlyUi()`** is true: no **−**/**+**/⋯, flyout open is a no-op.

---

## Public API (window)

| Function | Purpose |
|----------|---------|
| **`renderDeckEditorMobileView`** | Rebuild list HTML inside **`#deckCardsEditor`**. |
| **`refreshDeckEditorLayoutMode`** | Re-run search init + MV vs DTV deck body rendering when modal is visible. |
| **`toggleDevMobileDeckType(type)`** | Toggle section expand/collapse. |
| **`openDevMobileDeckRowSheet(deckIndex, instanceIndex, anchorEl)`** | Open positioned card menu. |
| **`closeDevMobileDeckActionsSheet`** | Close menu and tear down listeners. |

---

## Styling notes (`deck-editor-mobile.css`)

- List/row rules are scoped under **`.layout-mobile #deckEditorModal`** where needed to beat DTV **`!important`** from **`index.css`** / **`deck-cards-editor.css`**.
- **`.dev-mobile-deck-qty-btn`**, **`.dev-mobile-deck-overflow-btn`** — 30×30 with teal outline (overflow uses neutral border).
- Flyout compact tokens: smaller padding/gaps, **36px** min row height, **18px** icons, teal label/icon color **`#4ecdc4`** to match the deck hamburger menu.
- **Typography** uses the shared mobile token scale **`--font-3xs..2xl`** and **`--icon-sm/md/lg`** defined on **`html.layout-mobile`** in [`public/css/mobile-layout.css`](/public/css/mobile-layout.css). Header title is **`--font-xl`**, modal **`h3`** is **`--font-lg`**, meta row / validation badges / utility buttons are **`--font-xs`**, header card/threat values and row names are **`--font-sm`**, section headers are **`--font-md`**, validation icon and collapse carets are **`--icon-sm`**, draw-hand close is **`--icon-lg`**, card-view category toggle is **`--icon-md`**, draw-training pill and card-view add/remove buttons are **`--font-2xs`**. Do **not** add literal `font-size` in this file — always reference a token. Full scale and rules: [`MOBILE_DESIGN.md §10.8`](../../MOBILE_DESIGN.md#108-mobile-fluid-typography-tokens-htmllayout-mobile--done).

---

## Testing

There is **no** dedicated Jest suite for **`deck-editor-mobile-view.js`** today. Regression coverage is indirect:

- **`npm run test:unit`** — project-wide; no MV deck list assertions unless added.
- Manual QA: narrow viewport → open deck editor → expand types, **−**/**+**, **⋯** (alternate art, foil, KO, reserve, mission/training/special pre-place when deck qualifies), backdrop tap, Escape, switch to DTV via **`preferDesktopLayout`** or wide window.

When adding behavior, prefer **small unit tests** for pure helpers if extracted (e.g. alternate-art gating already lives on **`deckEditorCardHasAlternateArts`** in **`deck-editor-rendering.js`**).

---

## Changelog (recent product decisions)

1. **⋯ only when there are real actions** — avoids empty sheets; **Change art** only if **`deckEditorCardHasAlternateArts`** is true (parity with desktop card view).
2. **Bottom sheet replaced with hamburger-style dropdown** — **`#devMobileDeckActionsSheet`** is a fixed flyout anchored to **⋯**, reusing **`.deck-editor-controls-menu-panel`** visuals at smaller scale.

---

## Related documentation

- [`COLLECTION_VIEW_MOBILE.md`](COLLECTION_VIEW_MOBILE.md) — Collection tab MV (different feature; similar “row + actions” language in STYLE_GUIDE only).
- [`docs/FRONTEND_SCRIPT_MANIFEST.md`](../FRONTEND_SCRIPT_MANIFEST.md) — script order for the SPA.
