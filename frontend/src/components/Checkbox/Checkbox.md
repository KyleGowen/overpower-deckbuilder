# Checkbox

Stylized checkbox for filter toggles (Owned only, Has Foil, Hide Unusables, layout
preferences). Uses a visually hidden native `<input type="checkbox">` for accessibility
with a custom 20×20px control face matching v2 accent tokens.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `checked` | `boolean` | – | Controlled checked state. |
| `onChange` | `(checked) => void` | – | Called when toggled. |
| `label` | `ReactNode` | – | Visible label text beside the box. |
| `disabled` | `boolean` | `false` | Disables interaction; 45% opacity. |
| `id` | `string` | – | Optional `id` for the native input. |
| `className` | `string` | – | Extra classes on the root `<label>`. |
| `labelPosition` | `'start' \| 'end'` | `'start'` | Box before or after label text. |
| `aria-label` | `string` | – | Overrides AT name when label is not plain text. |

## Notes
- Root class: `.checkbox`; checked: `.is-checked`; disabled: `.is-disabled`.
- Custom face: `.checkbox__control` with `IconCheck` when checked.
- Mobile (`.layout-mobile`): label row `min-height: 44px` for thumb-friendly tap targets.
- Focus ring appears on `.checkbox__control` when the sr-only input has `:focus-visible`.
