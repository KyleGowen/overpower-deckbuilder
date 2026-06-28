# FoilCard

v2 "Prismatic Laminate" foil overlay wrapper for foil printings. Wraps a card image and
layers animated luster/prism/facet/sheen effects on top. Used by `CardImage` when the
printing is foil.

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `seed` | `string` | – | Stable per-card seed; drives deterministic foil vars (`deriveFoilVars`/`deriveFoilStyle`) and the once-per-session intro cache. |
| `size` | `'thumb' \| 'hero'` | `'thumb'` | Grid thumb vs detail/hero scale. |
| `children` | `ReactNode` | – | The card image to overlay. |
| `className` | `string` | `''` | Extra classes on the root. |
| `eagerIntro` | `boolean` | `false` | Start the intro on mount (hero/detail) instead of waiting for viewport intersection. |

## Notes
- Phases: `pending → intro → settled`. Thumbs wait for an `IntersectionObserver` (rootMargin
  80px) and play the intro **once per session per seed** (`hasFoilIntroPlayed`/
  `markFoilIntroPlayed`). Hero (`eagerIntro`) replays the intro whenever `seed` changes
  (e.g. applying a different printing).
- Honors `prefers-reduced-motion` — skips straight to `settled` with no animation.
- Effect layers live in `.foil-card__stack` (`luster`, `prism`, `facets`, `sheen`,
  `hotspots`, `intro-glint`), all `aria-hidden`. Visuals are CSS-only in
  [`FoilCard.css`](./FoilCard.css); foil math lives in
  [`lib/visual/foilEffect.ts`](../../lib/visual/foilEffect.ts).
