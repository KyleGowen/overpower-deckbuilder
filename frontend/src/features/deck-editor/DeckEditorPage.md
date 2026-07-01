# Deck Editor (DEV) — `/users/:userId/decks/:deckId`

Full-screen editor with its **own** chrome (no AppShell). It is **unguarded** so read-only /
shared deck links work for signed-out visitors (`?readonly=true` forces read-only; non-owners
are read-only automatically).

## Layout
- **Left rail**: quick nav (Home, Decks, Collection).
- **Sticky page header** (`.deck-editor__header`): on **desktop**, stays pinned while the card list scrolls. On **mobile**, the header, type tabs, and card list share one scroll container (`.deck-editor__main`) so metadata scrolls off-screen for more card space. Single **topbar row** (`.deck-editor__topbar`) with three zones:
  - **Leading** (`.deck-editor__topbar-leading`): back button, editable deck name, draw-pile card count (excludes characters, locations, missions) + legality badge
  - **Center** (`.deck-editor__stats-panel`): **Threat** `StatIconBadge` (`lg`) left of **Character max** (highest character primaries) and **Icon totals** (deck-wide icon counts via `calculateDeckIconTotals`) — each stat row with a small uppercase label and four `StatIconBadge` overlays. **Desktop narrow main column** (`@container deck-editor-main` ≤1400px): topbar becomes two rows — row 1 keeps back, name, and meta chips on one line plus actions; row 2 is a full-width centered stats panel (see `STYLE_GUIDE_V2.md` § Deck Editor — Desktop header compaction). Section and per-icon `title` tooltips explain character max vs deck icon totals.
  - **Trailing** (`.deck-editor__actions`): **List View** / **Card View** toggle (`btn btn-ghost`, label shows destination mode), **Draw Hand**, **Add Cards**, and **Save** (shows "Saved" when clean, "Saving…" while in flight)
  - **Mobile**: stats use subgrid alignment; threat icon stat lives in the **meta row** (same horizontal line as card count + legality, threat right-aligned via `margin-left: auto`); Character max and Icon totals rows below; action buttons use compact chip-sized pills (`4px 10px`, `font-size-xs`); actions full-width below stats
  - **Mobile bottom nav**: [`MobileBottomNav`](../../components/MobileBottomNav/MobileBottomNav.tsx)
    (same bar as AppShell) is fixed at the bottom; **Decks** is the active tab. Hidden while
    Add Cards, Draw Hand, or Card Detail slide-outs are open. Left rail remains desktop-only.
    Scrollable content uses bottom padding `calc(--bottom-nav-height + safe-area + --space-2)`.
- **Body**: card list grouped by type below the header. **Section order** (Card and List views): Characters → Locations → Special Cards → Power Cards → Missions → Events → Aspects → universe types — via `deckEditorCatalogTypes()` in [`deckEditorSectionOrder.ts`](../../lib/decks/deckEditorSectionOrder.ts) (deck editor only; DBV/Add Cards use global `CATALOG_TYPES`). **Special cards** sort A→Z by linked character name, then special card name (Any Character last) in Card and List views (`sortDeckSpecialEntries` / `groupSpecialCardsByCharacter`). **View modes**: **Card View** (default) — image tile grid; **List View** — text rows with quantity, attack-type icons, collapsible type sections (desktop: two balanced columns; mobile: single column, no thumbnails). Toggle in header actions; `sessionStorage` key `deck-editor-view-mode`. List row click opens the same `CardDetailPanel` as card image click. **List view remove (owners)**: subtle trash icon (`.deck-editor__list-remove`, same `IconTrash` as card view) on every row’s right edge; one instance per click (aggregated quantity decrements). Character rows: Reserve + KO + trash (trash rightmost). Visitors see KO on characters only — no trash. Uses the same `removeDeckInstance` handler as card view. **Main grid orientation** (card view only): characters use landscape `380:280` with thumbnail + **contain** progressive; locations use **`502:359`** with full-res + cover; events use `236:151` with full-res + cover; all other types use portrait `5:7` with thumb + contain progressive. **Progressive images**: thumb-first then full-res (`CardImage` `progressive`, `loading="eager"`, `progressiveSessionScope="deck-editor"`); locations/events stay full-res only. Landscape sections use fixed **`285px`** columns (`repeat(auto-fill, 285px)`); portrait groups use `minmax(210px, 1fr)`. **Mobile (`.layout-mobile`)**: main deck body and Add Cards grids use **one card per row** (`grid-template-columns: minmax(0, 1fr)`) for all catalog types — full-width tiles, no multi-column cramming. **Mobile card view — type tabs**: horizontal chip strip (Add Cards `shortLabel` style) lists **only types present in the deck**; one type visible at a time; section titles hidden when tabs show; tabs scroll with the page (not sticky). **Swipe left/right** on the card list cycles types cyclically (`useHorizontalSwipe` on `.deck-editor__main`; swipes work on card art, blocked on footer/tabs/header). On type change, the page scrolls to top and the active chip scrolls into view (`scrollIntoView` inline center). **Mobile list view**: no type chip strip — all catalog sections in one vertical scroll with collapsible section headers; swipe-to-cycle types is disabled.
- **Card detail**: clicking a deck card **image** opens the shared read-only [`CardDetailPanel`](../../components/CardDetailPanel/CardDetailPanel.tsx) (same slide-out as Database View — full art, stats, ability, metadata). Controls below the image do not open the panel. Works for owners and read-only visitors. **Owners** also see a **Pre-Placed** toggle in the slide-out for cards that are eligible per character/location rules — see [Pre-Placed](#pre-placed) below. **Mobile back / swipe-back** closes the slide-out first (`useDeckCardDetailHistory` — React Router history entry + `popstate`); header chevron closes topmost overlay (card detail → draw hand → add cards) before navigating to deck selection. **Owners** see a **Printings** section when the card has multiple catalog printings (alternate art + foil): each row shows friendly set name, checklist `#`, and **Apply**; the current printing’s button is disabled (“Applied”). Apply swaps **one deck tile instance** (`instanceId`) to that printing’s `cardId` + `defaultImage` and refreshes slideout art; deck grid `CardImage` remounts on path change so progressive layers show the new art immediately. Reserve character and KO simulation follow `cardId` updates on characters.
- **Per-card controls**: in `.deck-editor__card-footer` below the image, **right-aligned** — no tile name (name is on the card art). Card image is **full-bleed** to the tile edges above the footer (`padding: 0` on `.deck-editor__card`). **One tile per physical copy** — duplicate cards appear as separate images (no quantity stepper). New copies are added only via **Add Cards**.
  - **Characters (owners)**: **KO** toggle (`KoToggleButton`, `.deck-editor__ko-btn`) in the footer before trash; **Select Reserve** / **Reserve** (`ReserveCharacterButton`) at the **bottom-left** of the tile (`.deck-editor__card-reserve-wrap`, absolute); trash (`.deck-editor__card-remove`) stays **bottom-right** in the footer. Hidden reserve slots keep trash from shifting on that tile.
  - **Characters (authenticated visitors)**: **KO** toggle only in the footer (no trash/reserve edits).
  - **Characters (read-only)**: disabled **Reserve** on the reserved character only when applicable; **KO** still available for all signed-in users (GUEST, USER, ADMIN).
  - **All types (owners)**: trash only — removes that single instance. Logic: [`deckInstances.ts`](../../lib/decks/deckInstances.ts), [`deckCardControls.ts`](../../lib/decks/deckCardControls.ts), reserve: [`reserveCharacter.ts`](../../lib/decks/reserveCharacter.ts).
  - **Pre-Placed chip**: a card marked Pre-Placed shows a small cyan **"Pre-Placed"** chip (`.deck-editor__preplaced-chip`) **center-aligned** in the footer row (same row as trash). The footer is a 3-column grid (`1fr auto 1fr` — empty spacer / centered chip / right-aligned controls) so the chip stays centered regardless of how many controls sit on the right.
- **Threat stat**: client-calculated live via `calculateDeckTotalThreat` (characters + locations, reserve bumps for Victory Harben, Carson of Venus, Morgan le Fay). Rendered as `.deck-editor__threat-stat` (icon + value) in the stats panel — not a meta chip. Shows `total/76` when over cap.

## Simulate KO
Client-only knock-out simulation for all signed-in users (GUEST, USER, ADMIN). Full behavior spec:
[`docs/current/SIMULATE_KO_FEATURE.md`](../../../docs/current/SIMULATE_KO_FEATURE.md).

- **State**: `koCharacterIds: Set<string>` in `DeckEditorPage` — **not saved**; resets on deck change / refresh.
- **Logic**: [`simulateKo.ts`](../../lib/decks/simulateKo.ts) — `buildKoDimmingContext`, `shouldDimDeckCard`, `calculateActiveTeamStats`.
- **UI**: `KoToggleButton` on character tiles; affected cards get `.deck-editor__card--ko-dimmed` on art only.
- **Stats**: **Character max** row uses active (non-KO) characters when any KO is set; icon totals stay deck-wide.
- **Mobile**: Same tile-footer `KoToggleButton` on character tiles (not the legacy DEV overflow ⋯ menu — see [`DECK_EDITOR_MOBILE_VIEW.md`](../../../docs/current/DECK_EDITOR_MOBILE_VIEW.md) for v1 only).
- **Signed-out visitors**: no KO control.

## Draw Hand

Client-only random hand simulation. Full cross-stack spec: [`docs/current/DRAW_HAND_FEATURE.md`](../../../docs/current/DRAW_HAND_FEATURE.md). Behavior mirrors legacy v1 [`draw-hand.js`](../../../public/js/components/draw-hand.js).

- **Entry**: **Draw Hand** button in the header actions (replaces the former Playtest placeholder). Enabled when the deck has **≥8 playable** cards (non character/location/mission); `exclude_from_draw` rows count toward the threshold but are omitted from the draw pile.
- **State**: `drawHandOpen` + `drawnCards` in `DeckEditorPage` — not persisted.
- **Logic**: [`drawHand.ts`](../../lib/decks/drawHand.ts) — 8 cards by default, 9th when an event is in the first 8 and the pile has >8 cards. After draw/redraw, `sortDrawnHandCards` orders by deck section order then within-type deck sort (power/special/name); manual drag reorder overrides until the next draw.
- **Catalog**: [`deckCardCatalog.ts`](../../lib/decks/deckCardCatalog.ts) — `buildDeckCardIndex`, `resolveDeckCatalogCard`, `deckCardDisplayName` (underscore type normalization + id-only fallback; labels never fall back to generic `"Card"`).
- **UI**: [`DrawHandPanel.tsx`](DrawHandPanel.tsx) uses [`SlideOutPanel`](../../components/SlideOutPanel/SlideOutPanel.tsx) (`side="top"`). **Desktop:** `position="absolute"` over `.deck-editor__content` — deck grid stays visible behind blurred scrim. One horizontal row at **210px** per card (`--deck-editor-portrait-col`), uniform scale-to-fit for 8–9 cards; drag reorder on fine pointers. **Mobile** (`.layout-mobile`): `position="fixed"`, **full-viewport** (`100dvh`) overlay; cards stack **vertically** in a scrollable body — centered `min(280px, 100%)` portrait slots with **5% inset** on art; full-width **Draw again** footer. **Events** in the draw hand are rotated 90° CCW into the portrait slot (draw-hand only).
- **Images**: `CardImage` with shared [`deckEditorCardImage.ts`](deckEditorCardImage.ts) loading props (progressive thumb → full-res, same as grid); events use single-layer full-res in `.draw-hand__event-rotate`; `.draw-hand__missing-art` shows card name when art is missing or fails to load.
- **Toggle**: First click opens and draws; second click (or × / backdrop) closes. **Draw again** footer button redraws without closing.
- **KO**: Drawn cards use `shouldDimDeckCard`; dimming updates when KO toggles without re-randomizing the hand.
- **Card detail**: Tapping a drawn card opens [`CardDetailPanel`](../../components/CardDetailPanel/CardDetailPanel.tsx).
- **Availability**: All visitors including read-only and signed-out (when deck has enough playable cards).

## Pre-Placed

Lets an owner mark a playable card as **Pre-Placed** — it starts the game already placed (under a location or with a character) instead of in the random draw pile. Stored as `exclude_from_draw` on the deck card (re-implements the legacy v1 control from [`public/js/game-logic.js`](../../../public/js/game-logic.js)); Draw Hand omits these rows while they still count toward deck size and the ≥8 playable threshold.

- **Toggle UI**: a small **Pre-Placed** pill button in the [`CardDetailPanel`](../../components/CardDetailPanel/CardDetailPanel.tsx) slide-out (`.card-detail__preplaced-btn`), shown only to owners and only for **eligible** cards. Active state fills the pill; a hint line explains the effect. Props: `prePlacedEligible`, `prePlaced`, `onTogglePrePlaced`.
- **Indicator**: when active, a centered **"Pre-Placed"** chip appears on the card tile footer (see Per-card controls above).
- **Eligibility** (client-only — backend stores the flag without validating type): [`prePlaced.ts`](../../lib/decks/prePlaced.ts)
  - **Training** card → deck contains the **"Spartan Training Ground"** location **and** the card is **not** one-per-deck.
  - **Basic Universe** card → deck contains the **"Dracula's Armory"** location **and** the card is **not** one-per-deck.
  - **"Sword and Shield"** special → deck contains the character **"Lancelot"**.
  - **One-per-deck exclusion:** OPD cards (e.g. **Sekhmet**) can never be pre-placed to a location — the toggle is hidden for OPD Training / Basic Universe cards (`isOnePerDeckCatalogCard` via [`deckCardControls.ts`](../../lib/decks/deckCardControls.ts)).
  - Deck-level enablers are computed once via `computePrePlacedFlags`; per-card check is `isPrePlacedEligible`.
- **Reconcile on delete**: when a deck instance is removed, `removeDeckInstance` runs `reconcilePrePlaced(cards, cardIndex)` ([`prePlaced.ts`](../../lib/decks/prePlaced.ts)) — any card whose `exclude_from_draw` is set but is **no longer eligible** (e.g. its enabling Dracula's Armory / Spartan Training Ground / Lancelot was deleted) has the flag cleared immediately in local state. Returns the same array reference when nothing changed.
- **Validation cap (server)**: when the enabling location is present, pre-placed cards are capped at **3 total and must be unique** by `cardId` — Basic Universe under Dracula's Armory, Training under Spartan Training Ground. Enforced by `pre_placed_basic_universe_*` / `pre_placed_training_*` rules in [`deck-validation/rules/`](../../../../src/services/deck-validation/rules/). The live legality badge reflects this because `validateDeck` ([`lib/api/decks.ts`](../../lib/api/decks.ts)) now sends each card's `exclude_from_draw`. Exceeding the cap or duplicating a card makes the deck **Not Legal** (no hard block on toggling).
- **Persistence**: toggling sets local state + `dirty`; persisted on **Save** through the existing `replaceDeckCards` path (`exclude_from_draw` is already in the save payload). No dedicated toggle endpoint.

## Add Cards panel
A `SlideOutPanel` with search + type chips + card image grids. Panel width **575px** on desktop (`width={575}`).

- **All** is the first chip and default when the panel opens. It shows card images grouped by catalog type (characters → … → basic), each type in its own isolated 3-column grid so portrait and landscape art do not share rows across types.
- **Stacks** is the second chip. Each stack is a **clickable framed button**: landscape character (centered, one grid-cell width) plus linked specials and UA in a 3-column portrait grid. Hover highlights the frame in teal; click adds all missing stack cards and flashes the border. Complete stacks are dimmed and disabled. No title row or separate add button — character art identifies the stack. Search placeholder switches to *"Search character names..."* and filters by character name only. Pagination: **6 stacks/page**. Matching logic: [`characterStacks.ts`](../../lib/catalog/characterStacks.ts).
- **Missions** chip groups missions by **`mission_set`** in bordered frames (stack-like panel, not clickable as a whole). Each set uses a **4-column portrait grid** (`add-cards__grid--portrait-4`): missions 1–4 on row 1, missions 5–7 plus an **Add Set** button on row 2. Individual mission tiles use the same per-card quantity overlay as other tabs; **Add Set** bulk-adds missing missions in the set (disabled at 7 deck missions or when the set is complete). Sets sort A→Z by `mission_set`; within set by `set_number` then name. Pagination: **4 sets/page**. Logic: [`missionSets.ts`](../../lib/catalog/missionSets.ts), UI: [`MissionSetRow.tsx`](MissionSetRow.tsx).
- Other per-type chips show a single 3-column `CardTile` grid for that slug only.
- Search uses `cardMatchesSearchQuery` (name, character, card text) across all types on **All**, same scope as DBV/Collection.
- **Pagination**: **16** cards/page on All (8 rows at 2-column landscape width); per-type **24** for portrait types (8 rows × 3 columns) or **16** for landscape types — characters, locations, events (8 rows × 2 columns). Landscape sections use `.add-cards__grid--landscape`. **Mobile (`.layout-mobile`)**: all Add Cards grids are **single column**; pagination is **8 cards/page** (8 rows × 1 column) for All and per-type tabs. Stacks (6/page) and mission sets (4/page) counts unchanged.
- **Mobile type tabs**: `.add-cards__types` is a single horizontally scrollable pill row (DBV/Collection parity). Swipe left/right on card content cycles tabs in `ADD_CARDS_TAB_ORDER` via `useHorizontalSwipe` + `ADD_CARDS_SWIPE_BLOCK_SELECTOR`; search/set/Hide Unusables persist across swipes. Active chip centers on tab change; `.slideout__body` scrolls to top.
- **Default art only**: the catalog list dedupes foil rows and alternate-art variants client-side (`prepareAddCardsCatalogList` in `frontend/src/lib/catalog/defaultCatalogCards.ts`) so each logical card appears once with its default art. Teamwork cards group by `to_use` + `followup_attack_types` (not name alone), since many distinct teamwork rows share the same display name. The overlay counter counts copies of any variant (base, foil, or alternate) already in the deck.
- **Quantity overlay** ([`AddCardsQtyOverlay.tsx`](AddCardsQtyOverlay.tsx)): top-right on card art via `CardTile` overlay. **Zero copies** — teal `+` pill (`.add-cards__add`); tap adds one. **One or more** — scrim pill (`.add-cards__qty`) with `−` / count / `+`; `−` removes the last-added instance in the variant group (LIFO via `findLastInstanceIdForRepresentative`); at zero the `+` pill returns. Card art tap still adds (fast bulk add); overlay controls use `stopPropagation`. One-per-deck cards cap at 1 (`+` disabled, art tap no-ops). Removal uses the same `removeDeckInstance` handler as the main deck grid (reserve/KO/pre-placed reconcile).
- **Done** closes the panel.

Implementation: [`AddCardsPanel.tsx`](AddCardsPanel.tsx), [`AddCardsQtyOverlay.tsx`](AddCardsQtyOverlay.tsx), [`CharacterStackRow.tsx`](CharacterStackRow.tsx), [`MissionSetRow.tsx`](MissionSetRow.tsx), helpers in [`addCardsCatalog.ts`](addCardsCatalog.ts), [`characterStacks.ts`](../../lib/catalog/characterStacks.ts), [`missionSets.ts`](../../lib/catalog/missionSets.ts), and [`defaultCatalogCards.ts`](../../lib/catalog/defaultCatalogCards.ts).

## Legality chip / Limited toggle
The legality chip in the topbar meta row shows **Legal** / **Not Legal** / **Limited** via the shared
[`deckLegalityBadge`](../../components/DeckTile/deckTileLegality.ts) helper (precedence **Limited > Not Legal > Legal**;
Limited renders yellow `--color-warning`). For the **owner in the deck editor**, this chip is a clickable
**button** (`.deck-editor__legality-toggle`, `handleToggleLimited`): clicking a Legal/Not-Legal chip flips the deck
to **Limited**, and clicking the Limited chip reverts to the computed legality. Non-owners and read-only visitors
see a static `<span>`. Marking Limited **skips legality validation** — the variant becomes `limited` so the
[`LegalityErrorsPopover`](../../components/LegalityErrorsPopover/LegalityErrorsPopover.tsx) errors are suppressed.
The toggle persists immediately via `updateDeckMeta({ is_limited })` (independent of the Save button) and invalidates
the `['decks']` queries so tile chips on every surface (`DeckTile`) reflect Limited via the same shared function.

## Save model
Edits accumulate in local working state; **Save** persists the full card list
(`replaceDeckCards`) and metadata (`updateDeckMeta` — name and `reserve_character`) for
owned/DB decks, or the guest equivalents for `guest_` decks. Threat in the header updates
live while editing; legality is debounced via `validateDeck`.

After a successful save, **local `cards` state remains authoritative** — the editor does
not re-run `expandDeckToInstances` or invalidate the deck query. React Query cache is updated
via `setQueryData` only so navigation away/back stays consistent, without remounting tiles or
flashing card images.

## Notes
- Owner vs read-only is resolved from the auth user vs the route `userId` and the `readonly`
  query param.
- Deck card-view layout conventions: see `docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md` for
  the landscape/portrait rules to preserve.
