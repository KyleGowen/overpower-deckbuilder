# CardImage

Renders a single OverPower card image with loading/error handling. This is the **only**
sanctioned way to display card art — it routes paths through
[`lib/images/cardImages.ts`](../../lib/images/cardImages.ts) so CDN base and thumbnail rules
apply consistently (and keep working after the CDN cutover).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `imagePath` | `string \| null` | – | Raw card path (`card.image_path` / `card.image`). |
| `alt` | `string` | – | Required alt text. |
| `useThumbnail` | `boolean` | `true` | Use the `/thumb/` variant (tiles, ribbons, lists). Set `false` for full art (detail panel). |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Native loading hint. |
| `className`, `style` | – | – | Passthrough. |

## Behavior
- Shows a loading state until the image fires `onLoad`.
- On error, swaps to `placeholderImageUrl()` (a neutral "No image" frame) — never a broken
  image icon.
- `decoding="async"`, `draggable={false}`.

## Notes
- Do not hardcode image URLs anywhere else; always go through this component or the
  `cardImages.ts` helpers.
- `.card-image--contain` modifier renders full art without cropping (used by the detail
  panel).
