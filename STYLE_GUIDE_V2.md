# Excelsior Style Guide (v2)

Visual source of truth for the **v2 React SPA** under [`frontend/`](frontend/). This
guide describes the dark, neon, card-game-companion theme derived from the mocks in
`docs/mocks`. The legacy vanilla-JS site under `public/` is documented separately in
`STYLE_GUIDE.md`; **do not** mix the two.

> **Rule:** Whenever you change a visual pattern, token, or add a screen in `frontend/`,
> update this file. Tokens are defined in
> [`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css) — this doc and that
> file must always agree.

## Table of Contents
1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Buttons & Controls](#buttons--controls)
5. [Layout & Navigation](#layout--navigation)
6. [Cards & Card Art](#cards--card-art)
7. [Stats, Badges & Status](#stats-badges--status)
8. [Panels & Overlays](#panels--overlays)
9. [Responsive (Mobile vs Desktop)](#responsive-mobile-vs-desktop)
10. [Motion](#motion)
11. [Per-Screen Notes](#per-screen-notes)

---

## Design Principles
- **Dark, layered surfaces.** Deep navy base with progressively lighter "elevated"
  surfaces; never pure black, never light mode.
- **Neon cyan accent.** A single dominant accent (`--color-accent`) used for primary
  actions, active states, and glows. Use sparingly so it stays special.
- **Card art is the hero.** OverPower card images carry the visual weight. Chrome stays
  understated (muted text, thin borders) so art pops. Only ever render real card images
  shipped in the repo — never invent or hotlink art.
- **Calm density.** Generous spacing on a fixed `--content-max-width` rail; grids breathe.

## Design Tokens
All tokens live in `:root` in `tokens.css`. Reference them via `var(--token)`; **never**
hardcode hex values in component CSS.

### Surfaces
| Token | Value | Use |
|---|---|---|
| `--color-bg-base` | `#070b16` | App background |
| `--color-bg-surface` | `#0d1526` | Cards, rows, default surface |
| `--color-bg-elevated` | `#141f35` | Raised tiles, hovered surfaces |
| `--color-bg-panel` | `#0f1928` | Slide-out panels |
| `--color-bg-input` | `#0a1220` | Inputs, selects |
| `--color-bg-hover` | `#18243d` | Hover fill |
| `--color-bg-scrim` | `rgba(4,7,14,.72)` | Modal/drawer scrim |

### Accent (neon cyan)
| Token | Value |
|---|---|
| `--color-accent` | `#00c8e8` |
| `--color-accent-bright` | `#00e5ff` |
| `--color-accent-dim` | `#1c7d92` |
| `--color-accent-soft` | `rgba(0,200,232,.14)` |
| `--color-accent-glow` | `rgba(0,229,255,.35)` |

### Text & Borders
| Token | Value |
|---|---|
| `--color-text` | `#e8edf7` |
| `--color-text-muted` | `#8aa0c2` |
| `--color-text-dim` | `#56678a` |
| `--color-text-on-accent` | `#021018` |
| `--color-border` | `#1d2c47` |
| `--color-border-strong` | `#2a3e63` |
| `--color-border-accent` | `rgba(0,200,232,.45)` |

### Radius / Shadows
- Radii: `--radius-sm 6px`, `--radius-md 10px`, `--radius-lg 14px`, `--radius-xl 20px`,
  `--radius-full 999px`.
- Shadows: `--shadow-card`, `--shadow-panel`, `--shadow-pop`, and `--shadow-glow`
  (accent ring + glow used on focus/active art).
- Spacing scale: `--space-1` (4px) … `--space-16` (64px), 4px-based.

## Typography
- Family: `--font-sans` = Inter, then system fallbacks (no remote webfont required).
- Scale: `--font-size-xs` (.6875rem) → `--font-size-4xl` (3rem).
- Weights: 400 / 500 / 600 / 700.
- Page titles use `--font-size-2xl`/`3xl`, semibold, with a leading icon in
  `--color-accent`. Body copy is `--font-size-base` in `--color-text`; secondary copy in
  `--color-text-muted`.

## Buttons & Controls
Defined in [`frontend/src/styles/global.css`](frontend/src/styles/global.css).

| Class | Look | Use |
|---|---|---|
| `.btn .btn-primary` | Cyan gradient fill, dark text, glow on hover | Primary action (Log In, New Deck, Save, Add to Deck) |
| `.btn .btn-secondary` | Elevated surface, border, light text | Secondary actions |
| `.btn .btn-ghost` | Transparent, text only | Tertiary / inline |
| `.btn .btn-danger` | Red (`--color-danger`) | Destructive (Delete) |

- Disabled buttons drop to ~50% opacity and `cursor: not-allowed`; loading buttons show
  text like `Saving...` / `Creating...` and are disabled.
- Inputs/selects/textareas use `--color-bg-input`, `--color-border`, `--radius-md`, and a
  cyan focus ring (`--color-border-accent`).

## Layout & Navigation
- Fixed-width content rail: `--content-max-width: 1320px`, centered with side gutters.
- **Desktop** (`> 900px`): sticky **top nav** (`--top-nav-height: 60px`) with the logo,
  primary links (Home, Database, Decks, Collection), and the user menu on the right. The
  active link is cyan with a soft pill background.
- **Mobile** (`<= 900px`): a fixed **bottom nav** (`--bottom-nav-height: 66px`) with
  icon+label tabs (Home, Database, Decks, Collection, Profile). Top nav is hidden.
- Nav, dropdowns, and tooltips sit at `--z-nav: 9999` so they always clear page content.

## Cards & Card Art
- Card art is rendered exclusively through the `CardImage` component, which resolves
  paths via [`frontend/src/lib/images/cardImages.ts`](frontend/src/lib/images/cardImages.ts)
  (CDN base + thumbnail rules). Never hardcode image URLs.
- Card tiles (`CardTile`) use a portrait aspect frame, `--radius-md` corners, subtle
  border, and a label + set line beneath. Owned/selected tiles get the accent glow; unowned
  tiles in the Collection are dimmed.
- Missing art shows a neutral "No image" placeholder frame (no broken-image icon).
- Character art is also composited into deck tiles via `CharacterRibbon` (overlapping
  cropped portraits) for a recognizable, art-forward deck summary.

## Stats, Badges & Status
OverPower stat colors (also exposed as `.stat-energy` etc. utility classes):

| Stat | Token | Color |
|---|---|---|
| Energy | `--color-stat-energy` | amber `#f6a623` |
| Combat | `--color-stat-combat` | red `#ef4d5a` |
| Brute Force | `--color-stat-brute-force` | green `#4bd07b` |
| Intelligence | `--color-stat-intelligence` | blue `#3aa0ff` |
| Total | `--color-stat-total` | violet `#b06bff` |

- Stat tiles show the value in the stat color over an elevated surface with a muted label.
- **Legality**: `Legal` uses `--color-legal` (green), `Not Legal` uses `--color-not-legal`
  (red); `Limited` is a neutral/info chip.
- **Rarity** dots/labels use the `--color-rarity-*` ramp.
- Quantity badges (`x2`) overlay the top-right of a card tile in an accent pill.

## Panels & Overlays
- `SlideOutPanel` is the standard right-hand drawer for details and forms (card detail,
  create deck, deck actions, add cards). It uses `--color-bg-panel`, `--shadow-pop`, a
  scrim at `--z-drawer`, focus trapping, `Esc` to close, and slides in with `--ease-out`.
- The card **detail panel** shows the full art, type/set chips, an action slot (e.g. Add to
  Deck / collection stepper), the color-coded stat row, and a Details key/value list
  (Set, Set Number, Threat Level, Is Foil, abilities when present).

## Responsive (Mobile vs Desktop)
- Single breakpoint: **900px** (`--layout-mobile-max`).
- Never branch on user-agent. The `<html>` element carries `.layout-mobile` /
  `.layout-desktop`, driven by `useLayoutMode()`
  ([`LayoutModeProvider`](frontend/src/lib/layout/LayoutModeProvider.tsx)) using
  `matchMedia`. An inline script in `index.html` sets the class before first paint to avoid
  FOUC, honoring a `localStorage.preferDesktopLayout` override.
- Write desktop styles as the default and scope mobile overrides under `.layout-mobile`.

## Motion
- Easing: `--ease-out` (`cubic-bezier(.16,1,.3,1)`).
- Durations: `--dur-fast 120ms` (hovers), `--dur-med 220ms` (panels), `--dur-slow 360ms`.
- Respect `prefers-reduced-motion`: transitions collapse to near-instant.

## Per-Screen Notes
Each screen has a companion doc in its feature folder:
- Login — [`frontend/src/features/login/LoginPage.md`](frontend/src/features/login/LoginPage.md)
- Home — [`frontend/src/features/home/HomePage.md`](frontend/src/features/home/HomePage.md)
- Database (DBV) — [`frontend/src/features/database/DatabasePage.md`](frontend/src/features/database/DatabasePage.md)
- Collection — [`frontend/src/features/collection/CollectionPage.md`](frontend/src/features/collection/CollectionPage.md)
- Deck Selection — [`frontend/src/features/deck-selection/DeckSelectionPage.md`](frontend/src/features/deck-selection/DeckSelectionPage.md)
- Deck Editor (DEV) — [`frontend/src/features/deck-editor/DeckEditorPage.md`](frontend/src/features/deck-editor/DeckEditorPage.md)

Architecture, data flow, and serving are documented in
[`docs/current/FRONTEND_V2.md`](docs/current/FRONTEND_V2.md).
