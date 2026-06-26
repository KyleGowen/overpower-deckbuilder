# DeckTile

Summary tile for a deck. Layout ("hero" art + info panel):

- **Art zone:** feature character via `CardImage` with `card-image--contain` — full landscape card
  (380:280), 1px padding, no zoom/crop. **Location** slides use full-res art with `object-fit: cover`
  so the narrower location frame fills the hero slot (thumbs are letterboxed at 236:151). **Hover** (mouse / fine pointer): waits 1s, then
  cycles every 1.5s through characters and, when set, the **location** card; pointer leave stops
  and keeps the last shown slide. **Press-and-hold** (touch): native `touchstart` / `touchend` on
  `.deck-tile__art`, which sets `touch-action: pan-x pan-y`. A still hold engages cycling after a
  ~0.75s delay (no OS long-press needed), then advances every 1.5s; a drag in either axis
  instead scrolls (vertical lists or horizontal Home rails — the browser fires `touchcancel`, which
  stops the cycle so scrolling is unblocked) — so the same touch on the art supports both scrolling
  and cycling. Child images use
  `pointer-events: none` and `-webkit-touch-callout: none` so the browser image long-press menu does
  not steal the gesture. Release stops cycling and suppresses the tile open click; a quick tap still
  opens the deck.
- **On the scrim:** the deck name (`<h3>`).
- **Info panel:** single **meta bar** (cards + threat `StatIconBadge`, optional mission-set chip on `full`),
  character max stats as four `StatIconBadge` icons (`full` only), then a **footer** row (updated date left, optional legality badge lower-right).

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

One row: card count on the **left**, mission set chip **centered** when known, threat `StatIconBadge` (`sm`) on the **right**. Long mission set names ellipsize; legality is not shown here. Applies to **compact** (Home rails) and **full** (deck selection).

## Stats row (`full` only)

When `maxStats` is provided, four `StatIconBadge` components (`md`) show character maximum primaries — energy, combat, brute force, intelligence — as icon-with-black-number overlays (no text labels).

## Footer

`.deck-tile__footer`: **Updated** date on the left; optional legality badge on the lower-right (`compact` and `full`). Legal decks show date only.

## Mobile density (`.layout-mobile`)

When deck tiles appear in the 2-column deck selection grid (~175px column width), mobile CSS scales the tile down:

- **Name:** 1-line clamp, smaller font
- **Meta bar:** card count + threat only; mission set chip hidden
- **Meta bar (legality):** legality badge centered between card count and threat (footer row hidden); `margin-bottom: calc(var(--space-1) / 2)` before stats row
- **Stats row (`full`):** four `md` badges shrunk to ~22px via CSS override
- **Footer:** hidden on mobile (updated date and footer legality omitted)
- **Menu:** 44×44px tap target; hover lift disabled
- **Art preview:** press-and-hold on the art zone cycles characters + location (same timing as desktop hover); release keeps last slide and does not open the deck

Same rules apply to Home rail `compact` tiles harmlessly (rails are horizontal scroll, not a 2-col grid).

## Legality badge

Via `deckTileLegalityBadge()`: **Limited** if `is_limited`; else **Not Legal** if `!is_valid`; else no badge (legal implied).

## Notes

- Art slides: characters from `deck.cards`, plus location when `defaultImage` is present (no location chip in metadata).
- `DeckTileEmpty` is exported for empty-list states.
