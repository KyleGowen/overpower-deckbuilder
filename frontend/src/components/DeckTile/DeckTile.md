# DeckTile

Summary tile for a deck. Layout ("hero" art + info panel):

- **Art zone:** one feature character (first in the lineup) rendered via `CardImage`, zoomed
  (`scale(1.4)`, top-weighted crop) so the card's baked-in title/flavor text crops out. A tall
  bottom gradient scrim keeps the overlaid deck name readable.
- **On the scrim:** the deck name (`<h3>`).
- **Info panel (solid, never overlaps the art):** card count + threat ring, legality/Limited
  badges, and the last-updated date (shown on **both** variants).
- **`full` variant only (optional fields):** location chip (round thumb + name), mission-set chip
  (name), and the max-stat bar (E/C/BF/INT).

Used on Home (Community Decks rail, `compact`) and Deck Selection (`full`).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `deck` | `DeckListItem` | – | `{ metadata, cards }` shape from the list API. |
| `variant` | `'compact' \| 'full'` | `'full'` | `compact` (rails) hides stats + location/mission chips; both variants show name, lineup, count, threat, and updated date. |
| `maxStats` | `DeckStatLine \| null` | – | Precomputed max E/C/BF/INT across the deck's characters (Deck Selection enriches this from the catalog); shown on `full` only. |
| `rankLabel` | `string` | – | Optional rank tag (e.g. tournament rail). |
| `onOpen` | `() => void` | – | Opens the deck (whole tile is the button). |
| `onMenu` | `() => void` | – | Shows the actions menu (kebab); stops propagation. |
| `favorite` | `boolean` | – | Shows a favorite star. |

## Notes
- The feature hero, location, and mission are derived from `deck.cards` (`type === 'character' |
  'location' | 'mission'`), all present in the list payload; the feature hero is the first
  character. If there are no characters, a fallback card icon is shown.
- Legality badge uses `metadata.is_valid`; `Limited` from `metadata.is_limited`.
- `DeckTileEmpty` is exported for empty-list states.
