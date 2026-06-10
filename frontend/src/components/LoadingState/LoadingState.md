# LoadingState

Spinner + optional label for pending data. Used as route Suspense fallback and inside pages
while queries load.

## Props
| Prop | Type | Notes |
|---|---|---|
| `label` | `string` | Optional message under the spinner. |
| `fullscreen` | `boolean` | Centers in the viewport (route-level fallback). |

## Notes
- Respects `prefers-reduced-motion` (spinner animation collapses).
