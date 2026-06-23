# Logo

Excelsior branding images. Resolves via `assetUrl()`
([`lib/images/cardImages.ts`](../../lib/images/cardImages.ts)) so assets load from the CDN in
production and from local static files in dev.

## Props
| Prop | Type | Notes |
|---|---|---|
| `variant` | `'wordmark' \| 'emblem'` | Default `wordmark`. Emblem is the symbol-only triangle mark for compact chrome. |
| `height` | `number` | Render height in px (width scales). |
| `className` | `string` | Passthrough. |
| `alt` | `string` | Default `Excelsior`. |

## Assets
| Variant | Path | Usage |
|---|---|---|
| `wordmark` | `/src/resources/images/logo/logo5.png` | Login hero/card, legacy header |
| `emblem` | `/src/resources/images/logo/logo6.png` | v2 desktop top nav, deck editor left rail |

## Notes
- Never hardcode asset paths outside this component; `assetUrl()` applies the CDN base.
- Desktop top nav and deck editor rail use `variant="emblem"`; login keeps the default wordmark.
