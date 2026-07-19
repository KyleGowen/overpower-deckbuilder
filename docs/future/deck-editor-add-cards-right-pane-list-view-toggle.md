# Deck Editor Add Cards Right Pane List View Toggle

## Status

Proposed. Not implemented.

## Problem

Some deck-builder users prefer a denser, older-style selection experience when they already know the card pool or need to compare names and text quickly. The current Add Cards result pane is intentionally card-art-first, but that makes quick text scanning harder for users who do not remember every card by image.

## Proposal

Add a view toggle to the Add Cards result pane on desktop:

- **Grid** remains the default and continues to emphasize card images.
- **List** shows compact rows for the currently selected card type or All-tab grouping.
- The toggle affects only the right/result pane, not the wide desktop context pane.
- The hover preview should continue to respond to the row under the pointer.
- Clicking a row should add the card, matching grid card-click behavior.

## List Row Content

Each row should include:

- Card name or linked display name.
- Compact type/set metadata.
- Current deck quantity.
- One-per-deck or unusable status when relevant.
- A short readable text cue where it helps scanning, truncated to one or two lines.

## Persistence

Persist the selected Add Cards result view for the current deck-editor session only at first. Do not persist across page reloads until users ask for it.

## Implementation Notes

Likely files:

- `frontend/src/features/deck-editor/AddCardsPanel.tsx`
- `frontend/src/features/deck-editor/DeckEditorPage.css`
- `frontend/src/features/deck-editor/addCardsCatalog.ts`
- `frontend/src/features/deck-editor/AddCardsQtyOverlay.tsx`

Prefer a small internal list-row component that reuses existing catalog display helpers and Add Cards quantity logic. Avoid reviving the old deck editor UI wholesale.

## Open Questions

- Should List be desktop-only, or should mobile get it later as a separate interaction?
- Should list rows expose plus/minus controls directly, or keep click-to-add with quantity shown?
- Should All-tab list mode use a flat checklist order or grouped sections?
