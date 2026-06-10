# CharacterRibbon

Renders a deck's characters (up to 4) as a polished image ribbon — the at-a-glance identity
of a deck. Uses real card thumbnails only (via `CardImage`).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `characters` | `RibbonCharacter[]` | – | `{ cardId, name?, imagePath? }` list. |
| `variant` | `'strip' \| 'fan'` | `'strip'` | Equal slots vs overlapping fan. |
| `max` | `number` | `4` | Max portraits to show. |
| `hasReserve` | `boolean` | `false` | Shows a corner "R" reserve badge. |

## Notes
- `aria-hidden` (decorative); the deck name carries the accessible label on `DeckTile`.
- Slots are z-ordered so earlier characters layer on top in the fan variant.
- Renders nothing if there are no characters (DeckTile shows a fallback icon instead).
