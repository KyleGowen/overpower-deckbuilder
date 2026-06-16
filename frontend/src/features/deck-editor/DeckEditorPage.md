# Deck Editor (DEV) — `/users/:userId/decks/:deckId`

Full-screen editor with its **own** chrome (no AppShell). It is **unguarded** so read-only /
shared deck links work for signed-out visitors (`?readonly=true` forces read-only; non-owners
are read-only automatically).

## Layout
- **Left rail**: quick nav (Home, Decks, Collection).
- **Sticky page header** (`.deck-editor__header`): stays pinned while the card list scrolls. Contains:
  - **Top bar row** (`.deck-editor__topbar`): back button, editable deck name, card count + threat + legality badge, and
    actions — Playtest (placeholder), **Add Cards**, and **Save** (shows "Saved" when clean,
    "Saving…" while in flight).
  - **Stats rows** (`.deck-editor__stats-panel`): **Character max** (highest character primaries) and **Icon totals** (deck-wide icon counts via `calculateDeckIconTotals`). Each row has a small uppercase label on the left and four inline icon + value groups in stat color.
- **Body**: card list grouped by type below the sticky header. **Main grid orientation**: characters, locations, and events use landscape aspect ratios (`380:280` / `236:151`) with `card-image--contain`; all other types use portrait `5:7`. Landscape type sections use a wider grid (`deck-editor__cards--landscape`, `minmax(190px, 1fr)`).

## Add Cards panel
A `SlideOutPanel` with search + type chips + card image grids. Panel width **575px** on desktop (`width={575}`).

- **All** is the first chip and default when the panel opens. It shows card images grouped by catalog type (characters → … → basic), each type in its own isolated 3-column grid so portrait and landscape art do not share rows across types.
- **Stacks** is the second chip. Each stack is a **clickable framed button**: landscape character (centered, one grid-cell width) plus linked specials and UA in a 3-column portrait grid. Hover highlights the frame in teal; click adds all missing stack cards and flashes the border. Complete stacks are dimmed and disabled. No title row or separate add button — character art identifies the stack. Search placeholder switches to *"Search character names..."* and filters by character name only. Pagination: **6 stacks/page**. Matching logic: [`characterStacks.ts`](../../lib/catalog/characterStacks.ts).
- Per-type chips show a single 3-column `CardTile` grid for that slug only.
- Search uses `cardMatchesSearchQuery` (name, character, card text) across all types on **All**, same scope as DBV/Collection.
- **Pagination**: **16** cards/page on All (8 rows at 2-column landscape width); per-type **24** for portrait types (8 rows × 3 columns) or **16** for landscape types — characters, locations, events (8 rows × 2 columns). Landscape sections use `.add-cards__grid--landscape`.
- **Default art only**: the catalog list dedupes foil rows and alternate-art variants client-side (`prepareAddCardsCatalogList` in `frontend/src/lib/catalog/defaultCatalogCards.ts`) so each logical card appears once with its default art. The in-deck badge counts copies of any variant (base, foil, or alternate) already in the deck.
- Clicking a card adds a copy to the working deck; **Done** closes the panel.

Implementation: [`AddCardsPanel.tsx`](AddCardsPanel.tsx), [`CharacterStackRow.tsx`](CharacterStackRow.tsx), helpers in [`addCardsCatalog.ts`](addCardsCatalog.ts), [`characterStacks.ts`](../../lib/catalog/characterStacks.ts), and [`defaultCatalogCards.ts`](../../lib/catalog/defaultCatalogCards.ts).

## Save model
Edits accumulate in local working state; **Save** persists the full card list
(`replaceDeckCards`) and metadata (`updateDeckMeta`) for owned/DB decks, or the guest
equivalents for `guest_` decks. Stats/threat/legality reflect the saved deck.

## Notes
- Owner vs read-only is resolved from the auth user vs the route `userId` and the `readonly`
  query param.
- Deck card-view layout conventions: see `docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md` for
  the landscape/portrait rules to preserve.
