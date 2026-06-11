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
| `catalogType` | `CatalogType` | – | Database grid: landscape vs portrait art frame + `contain` fit. |
| `hasFoilVersion` | `boolean` | `false` | Silver ✦ on tile (bottom-right of full tile, `title="has foil"`). |

## Notes
- Name comes from `cardDisplayName(card)`; art path from `card.image_path || card.image`.
- With `catalogType`, characters use `380:280` landscape; locations/events use `236:151`; other types use `5:7` portrait. Images use `card-image--contain` (no crop) and `CardImage` `progressive` + `catalogType` (portrait/landscape thumb presets → full-res fade).
- Set line shows `{set} {set_number}` when a number exists; set code only otherwise.
- The art is a `<button>` labelled `View {name}` for keyboard/AT access.
- Owned/selected emphasis and dimming are CSS-only (`.card-tile--dimmed`).
