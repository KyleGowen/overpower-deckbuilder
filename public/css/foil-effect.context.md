# Foil Shimmer Effect — Cursor Context

> This file provides context for AI assistance when working on foil card visuals.
> Keep it co-located with `foil-effect.css` so it is always available.
> Full style-guide documentation: `docs/current/STYLE_GUIDE.md` → **Foil Card Shimmer Effect**

---

## What `foil-effect.css` Does

Single source of truth for all foil card visuals in the app:

1. **`.foil-shimmer`** — the metallic sheen effect applied to card image wrappers
2. **`.foil-btn` / `.foil-btn--active`** — Foil toggle button states in the deck editor

Foil cards share the **same image** as their non-foil counterpart. The sheen is
CSS-only — no separate image files are needed. The `is_foil` flag on API card
data drives whether `.foil-shimmer` is added at render time.

---

## How to Apply

Add `.foil-shimmer` to the **immediate wrapper** of a `<img>`. Never to the
`<img>` itself (`::after` requires a positioned parent):

```html
<!-- ✅ Correct -->
<div class="card-foil-img-wrap foil-shimmer">
  <img src="..." class="card-view-image">
</div>

<!-- ❌ Wrong — ::after will not render on replaced elements -->
<img class="foil-shimmer" src="...">
```

The wrapper must have `overflow: hidden` (provided by `.foil-shimmer` base rule
and `.card-foil-img-wrap` in both `foil-effect.css` and `deck-editor-card-view.css`).

For the **deck-editor card view**, also add `.foil-once` (one-shot static mode):

```html
<div class="card-foil-img-wrap foil-shimmer foil-once">...</div>
```

For the **deck-editor tile view** (tile already uses `::before`/`::after`),
inject a standalone shimmer div as the first child:

```html
<div class="deck-card-editor-item ...">
  <div class="tile-foil-shimmer" aria-hidden="true"></div>
  ...
</div>
```

---

## CSS Custom Properties (set on the wrapper, cascade into `::after`)

| Property | Default | Range | Purpose |
|----------|---------|-------|---------|
| `--foil-duration` | `0.9s` | `0.25–1.15s` | Sweep duration |
| `--foil-translate-end` | `0%` | `-5%–+5%` | Where the band rests after sweep |
| `--foil-opacity` | `1` | `0.55–1.0` | Overall shimmer brightness |
| `--foil-angle` | `115deg` | `90–150deg` | Gradient diagonal angle |
| `--foil-anim-delay` | `0s` | `0s` or `-100s` | **Internal deck-editor flag only.** `-100s` snaps one-shot animation to end state for already-animated cards. |

`foil-animation.js` sets all of these (except `--foil-anim-delay`) on every
hover / render trigger. Do not hard-code them in HTML.

---

## Animation Modes

### Interactive (hover) — Collection, Database view, Hover modal

`foil-animation.js` adds `.foil-active` on `mouseenter`, removes on `mouseleave`.
`transition: none` on the base `::after` rule snaps back instantly so the next
hover always starts clean. Elements with `.foil-once` are **skipped** by hover
listeners so deck-editor cards stay frozen.

### One-Shot Static — Deck editor (card view + tile view)

The `foil-once-sweep` keyframe animation plays once with `forwards` fill-mode.
`initDeckEditorFoilElements()` in `deck-editor-rendering.js` handles re-render
stability via `_foilAnimatedInstances` (a module-level `Set`):

- **Already-animated card**: `--foil-anim-delay: -100s` snaps to end state,
  CSS vars are NOT re-randomised → no visible flicker.
- **Newly-foiled card**: `--foil-anim-delay: 0s`, vars randomised, sweep plays.
- **De-foiled card**: key pruned from set; re-foiling plays a fresh animation.

---

## Oversized `::after` (`inset: -50% -20%`)

The `::after` extends 20% beyond each horizontal edge and 50% beyond each
vertical edge. This prevents the diagonal gradient band from producing a hard
clipped line at the card corners when `overflow: hidden` clips it. The
`--foil-translate-end` range is capped at ±5% so the opaque band centre never
reaches the card's left/right edges.

---

## Editing the Effect

**Visual look** — edit only `foil-effect.css`:
- Gradient colours/stops: `linear-gradient()` in `.foil-shimmer::after`
- Band width: stop percentages (default 20%–80%)
- Oversized area: `inset:` values (keep negative)

**Timing/randomisation** — edit constants at the top of `foil-animation.js`:
- `FOIL_STOP_SECONDS`, `FOIL_VARIANCE_SEC`, `FOIL_MIN_SEC`
- `FOIL_END_MIN/MAX` — keep ≤ ±20% to avoid hard edges
- `FOIL_OPACITY_MIN/MAX`, `FOIL_ANGLE_MIN/MAX`

**No other files need to change** when tuning the visual effect.

---

## Foil Toggle Button

Always reads "Foil". Active = solid teal fill (inverted scheme, same as KO
button). Both states in `foil-effect.css` so all foil visuals stay in one file.

```
.foil-btn            → outline teal (unpressed)
.foil-btn--active    → solid #4ecdc4, dark text (pressed)
```
