# CardTile

Grid tile for a single catalog card: portrait art + name + set/rarity, with optional
overlay and footer slots. Used by the Database and Collection grids.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `card` | `CatalogCard` | – | The card to render. |
| `onClick` | `() => void` | – | Fires on the art button (opens detail panel). |
| `overlay` | `ReactNode` | – | Top-right overlay (e.g. owned `x2` badge). |
| `footer` | `ReactNode` | – | Footer slot (e.g. `QuantityStepper` or +Deck button). |
| `dimmed` | `boolean` | `false` | Dims art (unowned cards in Collection). |
| `showMeta` | `boolean` | `true` | Toggle the name/set line. |

## Notes
- Name comes from `cardDisplayName(card)`; art path from `card.image_path || card.image`.
- The art is a `<button>` labelled `View {name}` for keyboard/AT access.
- Owned/selected emphasis and dimming are CSS-only (`.card-tile--dimmed`).
