# DeckTile

Summary tile for a deck: a `CharacterRibbon` art header plus name, card count, threat,
legality/limited badges, and (in the `full` variant) a max-stat line and last-updated date.
Used on Home (Community Decks rail) and Deck Selection.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `deck` | `DeckListItem` | – | `{ metadata, cards }` shape from the list API. |
| `variant` | `'compact' \| 'full'` | `'full'` | `compact` hides stats/updated (used in rails). |
| `maxStats` | `DeckStatLine \| null` | – | Precomputed max E/C/BF/INT across the deck's characters (Deck Selection enriches this from the catalog). |
| `rankLabel` | `string` | – | Optional rank tag (e.g. tournament rail). |
| `onOpen` | `() => void` | – | Opens the deck (whole tile is the button). |
| `onMenu` | `() => void` | – | Shows the actions menu (kebab); stops propagation. |
| `favorite` | `boolean` | – | Shows a favorite star. |

## Notes
- Characters are derived from `deck.cards` where `type === 'character'`; if none, a fallback
  card icon is shown.
- Legality badge uses `metadata.is_valid`; `Limited` from `metadata.is_limited`.
- `DeckTileEmpty` is exported for empty-list states.
