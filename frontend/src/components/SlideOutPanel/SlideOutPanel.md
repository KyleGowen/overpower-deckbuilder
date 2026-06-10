# SlideOutPanel

Accessible slide-out drawer used for details and forms across the app (card detail, create
deck, deck actions, add cards, mobile account sheet).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | – | Controls mount/visibility. |
| `onClose` | `() => void` | – | Called on backdrop click, `Esc`, or close button. |
| `title` | `ReactNode` | – | Header title. |
| `footer` | `ReactNode` | – | Sticky footer slot. |
| `side` | `'right' \| 'bottom'` | `'right'` | Edge it slides from. Right = desktop drawer; bottom = mobile sheet. |
| `width` | `number` | `380` | Width for the right variant (full-width on mobile). |
| `ariaLabel` | `string` | – | Accessible label when there's no visible title. |

## Accessibility
- `role="dialog"`, `aria-modal="true"`; focus moves into the panel on open and returns to
  the trigger on close.
- Closes on `Escape` and backdrop click.

## Notes
- Sits above content via the drawer z-index with a scrim.
- There is also a `.cursorrules` in this folder describing the pattern.
