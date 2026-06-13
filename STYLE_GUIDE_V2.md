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
12. [Database Filter Rail](#database-filter-rail)

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
- **`html { scrollbar-gutter: stable; }`** reserves vertical scrollbar space so the centered
  top nav does not shift when shorter pages (e.g. Decks) hide the document scrollbar.
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
- Card tiles (`CardTile`) use a type-aware aspect frame (`catalogType` prop): portrait
  `5:7` by default; characters `380:280`; locations and events `236:151`. Tiles use
  `--radius-md` corners, subtle border, and a label + set line beneath. Owned/selected tiles
  get the accent glow; unowned tiles in the Collection are dimmed. Database and Collection
  grids use 4 columns for landscape types and 6 for portrait (2 on mobile).
- **All tab** (first tab on Database and Collection; default selection remains Characters): cross-type **text list** via
  `CatalogAllList` — no card images. Rows use a **spread grid layout**: `#set_number`
  (monospace, `4.5rem`, extra padding before name), card name (foil `✦` when applicable),
  type badge (right-aligned column), friendly **set name** badge (left-aligned, ellipsis),
  a flexible spacer, and (Collection only) a trailing `QuantityStepper`.
  Mobile collapses to two rows (`#` + name, then badges + stepper). Sort is fixed checklist
  order: set → non-foil before foil → set_number → name (`compareAllCatalogCards`). Selected
  row: accent left border + `--color-accent-soft` background. DBV All opens detail slideout on
  row click only (deck/collection actions in panel). Pagination uses 48 rows per page on All
  (24 on image grids). Search + set filter apply; DBV hides `DbvFilterRail` on All.
- Missing art shows a neutral "No image" placeholder frame (no broken-image icon).
- **Deck tiles (`DeckTile`)** use a feature-character art zone at landscape card ratio
  (`aspect-ratio: 380 / 280`): the first character is shown as a **full card** (`object-fit:
  contain`, no zoom/crop), tight 1px inset. A bottom gradient scrim carries the deck **name**.
  Count, threat, legality/Limited badges, and updated date live in the solid info panel below; the
  `full` variant adds location/mission chips and the max-stat bar.

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
  Deck / + Collection), the color-coded stat row, and a Details key/value list
  (Set, **Is Foil** on Collection, **Has Foil** on Database, Set Number, abilities when present). Default width **504px** (20% wider
  than the original 420px drawer). Character detail uses a landscape art frame (`380:280`);
  the fifth stat tile is gray **Threat** instead of purple **Total**.

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

## Database Filter Rail

Always-visible per-type filter rail on DBV (`/data`), inserted between `.db__types` and
`.db__grid`. See [`DbvFilterRail.css`](frontend/src/features/database/components/DbvFilterRail.css).

| Element | Tokens / values |
|---|---|
| Rail (`.dbv-filter-rail`) | `--color-bg-elevated`, `--radius-md`, `--space-2` vertical / `--space-3` horizontal padding, `min-height: 40px`, `border: 1px solid var(--color-border)` |
| Group labels (`.dbv-filter-rail__label`) | `--font-size-xs`, `--color-text-dim` |
| Active icon toggles (`.dbv-power-strip__btn.is-active`, `.dbv-func-strip__btn.is-active`) | `--color-border-accent`, `box-shadow: 0 0 0 1px var(--color-accent-glow)` (matches `.db__type.is-active`) |
| Active stat cell (`.dbv-stat-cell.has-filter`) | `--color-border-accent`, `--color-accent-soft` |
| Chips (`.dbv-filter-rail__chip`) | `--color-accent-soft`, `--color-border-accent`, `--font-size-xs` |
| Clear (`.dbv-filter-rail__clear`) | `--color-accent-bright` |
| Stat op/value (`.dbv-stat-cell__op`, `.dbv-stat-cell__value`) | `width: calc(2.75rem * 1.15)`, `min-height: calc(1.5rem * 1.15)`, `font-size: calc(var(--font-size-xs) * 1.15)`; mobile `min-height: calc(36px * 1.15)` |
| Collapse toggle (`.dbv-filter-rail__toggle`) | Left-edge chevron; `28×28px` desktop, `44×44px` mobile; `--color-text-muted`, hover `--color-bg-hover` |
| Collapsed rail (`.dbv-filter-rail.is-collapsed`) | Transparent, no border; keeps `--space-3` horizontal padding so the chevron stays aligned with expanded; chevron locked left in `.dbv-filter-rail__toggle-icon-wrap` (28px); `1px` rule (`.dbv-filter-rail__toggle-line`) extends right |

**Layout:** Controls scroll horizontally on narrow viewports; mobile icon/stat tap targets
are **44px** under `.layout-mobile`. Trailing chips + Clear sit at the rail end.
