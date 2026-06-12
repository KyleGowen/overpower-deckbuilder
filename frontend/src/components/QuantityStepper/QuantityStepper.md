# QuantityStepper

Compact −/value/+ control for adjusting quantities (collection counts, deck card copies).
The center value is an editable field: type a non-negative integer and press Enter or blur to
apply (clamped to `min`/`max`). Escape cancels editing.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | – | Current quantity. |
| `onChange` | `(next) => void` | – | Called with the clamped next value. |
| `min` | `number` | `0` | Lower bound (disables −). |
| `max` | `number` | `99` | Upper bound (disables +). |
| `size` | `'sm' \| 'md'` | `'md'` | Compact vs default. |

## Notes
- Stops click propagation so it can live inside clickable tiles without triggering them.
- Buttons are labelled "Decrease"/"Increase" for AT.
- The caller decides what `onChange` does (e.g. `useCollection.setQuantity`, which POSTs a
  new card vs PUTs an existing one, including `0` to remove).
