# Deck Editor (DEV) — `/users/:userId/decks/:deckId`

Full-screen editor with its **own** chrome (no AppShell). It is **unguarded** so read-only /
shared deck links work for signed-out visitors (`?readonly=true` forces read-only; non-owners
are read-only automatically).

## Layout
- **Left rail**: quick nav (Home, Decks, Collection).
- **Top bar**: back button, editable deck name, card count + threat + legality badge, and
  actions — Playtest (placeholder), **Add Cards**, and **Save** (shows "Saved" when clean,
  "Saving…" while in flight).
- **Body**: max-stat tiles (E/C/BF/INT) and the card list grouped by type, each row with a
  `QuantityStepper` and remove. Empty decks show an EmptyState with an Add Cards CTA.

## Add Cards panel
A `SlideOutPanel` with search + type chips + a card grid (first 60, refine via search).
Clicking a card adds a copy to the working deck; "Done" closes the panel.

## Save model
Edits accumulate in local working state; **Save** persists the full card list
(`replaceDeckCards`) and metadata (`updateDeckMeta`) for owned/DB decks, or the guest
equivalents for `guest_` decks. Stats/threat/legality reflect the saved deck.

## Notes
- Owner vs read-only is resolved from the auth user vs the route `userId` and the `readonly`
  query param.
- Deck card-view layout conventions: see `docs/current/DECK_EDITOR_CARD_VIEW_LAYOUT.md` for
  the landscape/portrait rules to preserve.
