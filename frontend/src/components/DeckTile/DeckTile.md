# DeckTile

Summary tile for a deck. Layout ("hero" art + info panel):

- **Art zone:** feature character via `CardImage` with `card-image--contain` — full landscape card
  (380:280), 1px padding, no zoom/crop. **Location** slides use full-res art with `object-fit: cover`
  so the narrower location frame fills the hero slot (thumbs are letterboxed at 236:151). **Hover:** waits 1s (current slide already visible), then
  cycles every 1.5s through characters and, when set, the **location** card; pointer leave stops
  and keeps the last shown slide. Bottom gradient scrim keeps the deck name readable.
- **On the scrim:** the deck name (`<h3>`).
- **Info panel:** single **meta bar** (cards + threat metrics, optional mission-set chip on `full`),
  max stats (`full` only), then a **footer** row (updated date left, optional legality badge lower-right).

Used on Home (Community Decks rail, `compact`) and Deck Selection (`full`).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `deck` | `DeckListItem` | – | `{ metadata, cards }` shape from the list API. |
| `variant` | `'compact' \| 'full'` | `'full'` | `compact` (rails) hides stats; both variants show meta bar + footer + mission set chip when known. |
| `maxStats` | `DeckStatLine \| null` | – | Precomputed max E/C/BF/INT (Deck Selection); `full` only. |
| `missionSetName` | `string \| null` | – | Mission **set** name from catalog; shown centered in meta bar when known. |
| `rankLabel` | `string` | – | Optional rank tag (e.g. tournament rail). |
| `onOpen` | `() => void` | – | Opens the deck (whole tile is the button). |
| `onMenu` | `() => void` | – | Shows the actions menu (kebab); stops propagation. |

## Meta bar

One row: card count on the **left**, mission set chip **centered** when known, threat on the **right**. Long mission set names ellipsize; legality is not shown here. Applies to **compact** (Home rails) and **full** (deck selection).

## Footer

`.deck-tile__footer`: **Updated** date on the left; optional legality badge on the lower-right (`compact` and `full`). Legal decks show date only.

## Legality badge

Via `deckTileLegalityBadge()`: **Limited** if `is_limited`; else **Not Legal** if `!is_valid`; else no badge (legal implied).

## Notes

- Art slides: characters from `deck.cards`, plus location when `defaultImage` is present (no location chip in metadata).
- `DeckTileEmpty` is exported for empty-list states.
