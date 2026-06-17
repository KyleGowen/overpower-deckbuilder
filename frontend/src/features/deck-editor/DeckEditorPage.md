# Deck Editor (DEV) — `/users/:userId/decks/:deckId`

Full-screen editor with its **own** chrome (no AppShell). It is **unguarded** so read-only /
shared deck links work for signed-out visitors (`?readonly=true` forces read-only; non-owners
are read-only automatically).

## Layout
- **Left rail**: quick nav (Home, Decks, Collection).
- **Sticky page header** (`.deck-editor__header`): stays pinned while the card list scrolls. Single **topbar row** (`.deck-editor__topbar`) with three zones:
  - **Leading** (`.deck-editor__topbar-leading`): back button, editable deck name, card count + threat + legality badge
  - **Center** (`.deck-editor__stats-panel`): **Character max** (highest character primaries) and **Icon totals** (deck-wide icon counts via `calculateDeckIconTotals`) — each with a small uppercase label and four inline icon + value groups in stat color
  - **Trailing** (`.deck-editor__actions`): **Draw Hand**, **Add Cards**, and **Save** (shows "Saved" when clean, "Saving…" while in flight)
  - Mobile: stats wrap to a second line within the same header; actions full-width below
- **Body**: card list grouped by type below the sticky header. **Main grid orientation**: characters use landscape `380:280` with thumbnail + cover; locations use **`502:359`** with full-res + cover; events use `236:151` with full-res + cover; all other types use portrait `5:7` with thumb + contain. Landscape sections use fixed **`285px`** columns (`repeat(auto-fill, 285px)`); portrait groups use `minmax(210px, 1fr)`.
- **Card detail**: clicking a deck card **image** opens the shared read-only [`CardDetailPanel`](../../components/CardDetailPanel/CardDetailPanel.tsx) (same slide-out as Database View — full art, stats, ability, metadata). Controls below the image do not open the panel. Works for owners and read-only visitors. **Owners** see a **Printings** section when the card has multiple catalog printings (alternate art + foil): each row shows friendly set name, checklist `#`, and **Apply**; the current printing’s button is disabled (“Applied”). Apply swaps **one deck tile instance** to that printing and refreshes slideout art + Details.
- **Per-card controls**: in `.deck-editor__card-footer` below the image, **right-aligned** — no tile name (name is on the card art). Card image is **full-bleed** to the tile edges above the footer (`padding: 0` on `.deck-editor__card`). **One tile per physical copy** — duplicate cards appear as separate images (no quantity stepper). New copies are added only via **Add Cards**.
  - **Characters (owners)**: **KO** toggle (`KoToggleButton`, `.deck-editor__ko-btn`) in the footer before trash; **Select Reserve** / **Reserve** (`ReserveCharacterButton`) at the **bottom-left** of the tile (`.deck-editor__card-reserve-wrap`, absolute); trash (`.deck-editor__card-remove`) stays **bottom-right** in the footer. Hidden reserve slots keep trash from shifting on that tile.
  - **Characters (authenticated visitors)**: **KO** toggle only in the footer (no trash/reserve edits).
  - **Characters (read-only)**: disabled **Reserve** on the reserved character only when applicable; **KO** still available for all signed-in users (GUEST, USER, ADMIN).
  - **All types (owners)**: trash only — removes that single instance. Logic: [`deckInstances.ts`](../../lib/decks/deckInstances.ts), [`deckCardControls.ts`](../../lib/decks/deckCardControls.ts), reserve: [`reserveCharacter.ts`](../../lib/decks/reserveCharacter.ts).
- **Threat chip**: client-calculated live via `calculateDeckTotalThreat` (characters + locations, reserve bumps for Victory Harben, Carson of Venus, Morgan le Fay). Shows `total/76` when over cap.

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
- **Logic**: [`drawHand.ts`](../../lib/decks/drawHand.ts) — 8 cards by default, 9th when an event is in the first 8 and the pile has >8 cards.
- **Catalog**: [`deckCardCatalog.ts`](../../lib/decks/deckCardCatalog.ts) — `buildDeckCardIndex`, `resolveDeckCatalogCard`, `deckCardDisplayName` (underscore type normalization + id-only fallback; labels never fall back to generic `"Card"`).
- **UI**: [`DrawHandPanel.tsx`](DrawHandPanel.tsx) uses [`SlideOutPanel`](../../components/SlideOutPanel/SlideOutPanel.tsx) (`side="top"`, `position="absolute"`) over `.deck-editor__content` — deck grid stays visible behind the shared blurred scrim (same pattern as Add Cards). Desktop: one horizontal row at **210px** per card (`--deck-editor-portrait-col`), uniform scale-to-fit for 8–9 cards; drag reorder on fine pointers. Mobile (`.layout-mobile`): **165px** cards in a horizontal snap carousel (no scale-down). **Events** in the draw hand are rotated 90° CCW into the portrait slot (draw-hand only).
- **Images**: `CardImage` with deck-grid thumbnail policy; thumb → full-res fallback; `.draw-hand__missing-art` shows card name when art is missing or fails to load.
- **Toggle**: First click opens and draws; second click (or × / backdrop) closes. **Draw again** footer button redraws without closing.
- **KO**: Drawn cards use `shouldDimDeckCard`; dimming updates when KO toggles without re-randomizing the hand.
- **Card detail**: Tapping a drawn card opens [`CardDetailPanel`](../../components/CardDetailPanel/CardDetailPanel.tsx).
- **Availability**: All visitors including read-only and signed-out (when deck has enough playable cards).

## Add Cards panel
A `SlideOutPanel` with search + type chips + card image grids. Panel width **575px** on desktop (`width={575}`).

- **All** is the first chip and default when the panel opens. It shows card images grouped by catalog type (characters → … → basic), each type in its own isolated 3-column grid so portrait and landscape art do not share rows across types.
- **Stacks** is the second chip. Each stack is a **clickable framed button**: landscape character (centered, one grid-cell width) plus linked specials and UA in a 3-column portrait grid. Hover highlights the frame in teal; click adds all missing stack cards and flashes the border. Complete stacks are dimmed and disabled. No title row or separate add button — character art identifies the stack. Search placeholder switches to *"Search character names..."* and filters by character name only. Pagination: **6 stacks/page**. Matching logic: [`characterStacks.ts`](../../lib/catalog/characterStacks.ts).
- **Missions** chip groups missions by **`mission_set`** in bordered frames (stack-like panel, not clickable as a whole). Each set uses a **4-column portrait grid** (`add-cards__grid--portrait-4`): missions 1–4 on row 1, missions 5–7 plus an **Add Set** button on row 2. Individual mission tiles keep per-card **+** add; **Add Set** bulk-adds missing missions in the set (disabled at 7 deck missions or when the set is complete). Sets sort A→Z by `mission_set`; within set by `set_number` then name. Pagination: **4 sets/page**. Logic: [`missionSets.ts`](../../lib/catalog/missionSets.ts), UI: [`MissionSetRow.tsx`](MissionSetRow.tsx).
- Other per-type chips show a single 3-column `CardTile` grid for that slug only.
- Search uses `cardMatchesSearchQuery` (name, character, card text) across all types on **All**, same scope as DBV/Collection.
- **Pagination**: **16** cards/page on All (8 rows at 2-column landscape width); per-type **24** for portrait types (8 rows × 3 columns) or **16** for landscape types — characters, locations, events (8 rows × 2 columns). Landscape sections use `.add-cards__grid--landscape`.
- **Default art only**: the catalog list dedupes foil rows and alternate-art variants client-side (`prepareAddCardsCatalogList` in `frontend/src/lib/catalog/defaultCatalogCards.ts`) so each logical card appears once with its default art. The in-deck badge counts copies of any variant (base, foil, or alternate) already in the deck.
- Clicking a card adds a copy to the working deck; **Done** closes the panel.

Implementation: [`AddCardsPanel.tsx`](AddCardsPanel.tsx), [`CharacterStackRow.tsx`](CharacterStackRow.tsx), [`MissionSetRow.tsx`](MissionSetRow.tsx), helpers in [`addCardsCatalog.ts`](addCardsCatalog.ts), [`characterStacks.ts`](../../lib/catalog/characterStacks.ts), [`missionSets.ts`](../../lib/catalog/missionSets.ts), and [`defaultCatalogCards.ts`](../../lib/catalog/defaultCatalogCards.ts).

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
