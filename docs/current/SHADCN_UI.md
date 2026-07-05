# shadcn/ui in Excelsior (v2 frontend)

The v2 React SPA uses [shadcn/ui](https://ui.shadcn.com/) for **dashboard tiles**, **data panels**, and future UI primitives. shadcn is copy-paste components (not an npm UI package) built on **Tailwind CSS v4**, **Radix UI**, and **class-variance-authority**.

## Stack location

| Piece | Path |
|-------|------|
| shadcn config | [`frontend/components.json`](../../frontend/components.json) |
| UI primitives | [`frontend/src/components/ui/`](../../frontend/src/components/ui/) |
| `cn()` helper | [`frontend/src/lib/utils.ts`](../../frontend/src/lib/utils.ts) |
| Excelsior → shadcn theme bridge | [`frontend/src/styles/shadcn-theme.css`](../../frontend/src/styles/shadcn-theme.css) |
| Tailwind entry (utilities only) | [`frontend/src/styles/tailwind.css`](../../frontend/src/styles/tailwind.css) |
| Design tokens (source of truth) | [`frontend/src/styles/tokens.css`](../../frontend/src/styles/tokens.css) |
| Dashboard tiles | [`frontend/src/components/dashboard/`](../../frontend/src/components/dashboard/) |

## CSS load order

In [`frontend/src/main.tsx`](../../frontend/src/main.tsx):

1. `tokens.css` — Excelsior `:root` variables
2. `shadcn-theme.css` — HSL variables shadcn/Tailwind consume
3. `tailwind.css` — Tailwind theme + utilities (**Preflight disabled**)
4. `global.css` — reset, `.btn`, `.panel`, legacy BEM base

**Preflight is off** so existing global form/button styles are not overridden.

## Theme bridge

shadcn expects HSL components (`--background: 228 52% 6%`). `shadcn-theme.css` maps these to the dark neon Excelsior palette (navy surfaces, cyan primary). When adding tokens, update **both** `tokens.css` and `shadcn-theme.css`, then document in [`STYLE_GUIDE_V2.md`](../../STYLE_GUIDE_V2.md).

| shadcn variable | Excelsior equivalent |
|-----------------|----------------------|
| `--background` | `--color-bg-base` |
| `--card` | `--color-bg-panel` |
| `--foreground` | `--color-text` |
| `--primary` | `--color-accent` |
| `--muted-foreground` | `--color-text-muted` |
| `--border` | `--color-border` |
| `--ring` | `--color-border-accent` |
| `--radius` | `--radius-lg` (14px) |

## When to use shadcn vs BEM

| Use shadcn (`ui/` + `dashboard/`) | Keep BEM + per-file CSS |
|-----------------------------------|-------------------------|
| New dashboard / stats tiles | Deck editor, DBV, deck tiles |
| New dialogs, sheets, dropdowns (future) | Global nav, card chrome |
| Tournament preview tiles | Collection, community lists |

Rule of thumb: **new data-dashboard and overlay primitives** → shadcn. **Existing card-game screens** → BEM until a deliberate migration.

## Adding a component

From `frontend/`:

```bash
npx shadcn@latest add button
```

If the CLI cannot find Tailwind config, copy the component from [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components) into `src/components/ui/` and fix `@/` imports.

Installed today: **Card**, **Badge**, **Separator**.

## Icons

shadcn defaults to **lucide-react** (installed). Existing screens use [`frontend/src/components/icons.tsx`](../../frontend/src/components/icons.tsx). New shadcn components may use Lucide; do not replace global nav icons without a product decision.

## z-index

Radix portals are capped below global nav popovers via `[data-radix-popper-content-wrapper] { z-index: var(--z-nav) }` in `tailwind.css`. Popovers that must sit above nav need explicit review.

## Dashboard tiles (tournament stats)

Preview tiles on Home and full dashboards (e.g. `/home/columbus-regional`) share:

- **`DashboardTile`** — shadcn `Card` shell with size variants (`rail`, `sm`, `md`, `lg`, `wide`, `tall`). Outer chrome is overridden in [`DashboardTile.css`](../../frontend/src/components/dashboard/DashboardTile.css) to match **`.deck-tile`**: `--color-bg-panel`, `1px solid var(--color-border)`, `--radius-lg`, no default shadow.
- **`DashboardGrid`** — 12-column desktop grid, single column mobile
- **`DashboardRail`** — horizontal scroll rail with fixed deck-tile column widths
- **Layout config** — [`columbusDashboardLayout.ts`](../../frontend/src/lib/tournaments/columbusDashboardLayout.ts)

See [`frontend/src/components/dashboard/DashboardGrid.md`](../../frontend/src/components/dashboard/DashboardGrid.md).

## Local dev

Tailwind is processed by **`@tailwindcss/postcss`** ([`postcss.config.js`](../../frontend/postcss.config.js)) so legacy BEM `.css` files are not parsed as Tailwind. Restart Vite after changing `tailwind.css` or `shadcn-theme.css`.
