# Excelsior Style Guide (v2)

Visual source of truth for the **v2 React SPA** under [`frontend/`](frontend/). This
guide describes the dark, neon, card-game-companion theme derived from the mocks in
`docs/mocks`.

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
13. [Home Recent Updates](#home-recent-updates)

---

## Design Principles
- **Dark, layered surfaces.** Deep navy base with progressively lighter "elevated"
  surfaces; never pure black, never light mode.
- **Neon cyan accent.** A single dominant accent (`--color-accent`) used for primary
  actions, active states, and glows. Use sparingly so it stays special.
- **Card art is the hero.** OverPower card images carry the visual weight. Chrome stays
  understated (muted text, thin borders) so art pops. Only ever render real card images
  shipped in the repo — never invent or hotlink art.
- **Calm density.** Generous spacing on a full-width layout with edge padding; grids breathe and scale with viewport width.

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

### Semantic (KO simulation)
| Token | Value | Use |
|---|---|---|
| `--color-ko` | `#e85d6a` | Simulate KO toggle active fill |
| `--color-ko-soft` | `rgba(232,93,106,.16)` | KO button default background |
| `--color-ko-border` | `rgba(232,93,106,.38)` | KO button border |

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
| `.btn .btn-primary` | Cyan gradient fill, dark text, glow on hover | Primary action (Log In, New Deck, Save) |
| `.btn .btn-secondary` | Elevated surface, border, light text | Secondary actions |
| `.btn .btn-ghost` | Transparent, text only | Tertiary / inline |
| `.btn .btn-danger` | Red (`--color-danger`) | Destructive (Delete) |

- **Home hero CTA** (`.home__hero-cta`): accent-outline pill (`btn-ghost` + local overrides), not `btn-primary` gradient — compact chip sizing aligned with deck-editor header actions.
- **DBV detail slide-out actions** (`.db__detail-actions .btn`): same accent-outline pill family for Add to Deck / Collection under `CardDetailPanel` on `/data`.
- Disabled buttons drop to ~50% opacity and `cursor: not-allowed`; loading buttons show
  text like `Saving...` / `Creating...` and are disabled.
- Inputs/selects/textareas use `--color-bg-input`, `--color-border`, `--radius-md`, and a
  cyan focus ring (`--color-border-accent`).

### Checkbox (`Checkbox` component)

Reusable stylized checkbox for filter toggles. Component:
[`frontend/src/components/Checkbox/`](frontend/src/components/Checkbox/). Native
`<input type="checkbox">` is sr-only; custom face is `.checkbox__control`.

| Element | Tokens / values |
|---|---|
| Root (`.checkbox`) | `inline-flex`, `gap: var(--space-2)`, `--font-size-sm`, `--color-text-muted`; checked (`.is-checked`) brightens label to `--color-text` |
| Control face (`.checkbox__control`) | **20×20px**, `--radius-sm`, `--color-bg-input` bg, `1px solid --color-border` |
| Hover (enabled) | `--color-bg-hover` bg, `--color-border-accent` border |
| Checked | `--color-accent-soft` bg, `--color-border-accent` border, `box-shadow: 0 0 0 1px var(--color-accent-glow)`; `IconCheck` at 12px in `--color-accent-bright` |
| Focus | `outline: 2px solid --color-border-accent; outline-offset: 2px` on control when input `:focus-visible` |
| Disabled (`.is-disabled`) | `opacity: 0.45`, `cursor: not-allowed` |
| Mobile (`.layout-mobile .checkbox`) | `min-height: 44px`, `padding-inline: var(--space-1)` for thumb-friendly tap rows |

**`labelPosition`:** default `'start'` (box before label) for filter toggles; `'end'` for
account-sheet row (`.account-sheet__toggle`) with `justify-content: space-between`.

**Usages:** Collection **Owned only** (`.col__owned-toggle`), DBV **Has Foil**
(`.dbv-filter-rail__foil-toggle`), deck editor Add Cards **Hide Unusables**
(`.add-cards__filters-toggle`), mobile account sheet **Use desktop layout**.

## Layout & Navigation
- Full-width layout: `--content-max-width: none`; page `*__inner` wrappers and `.top-nav__inner` span the viewport with horizontal padding (`--space-6` desktop, `--space-4` mobile) as side gutters. Deck editor uses the same full-bleed pattern with its own chrome (no AppShell wrapper); on mobile it still mounts the shared [`MobileBottomNav`](frontend/src/components/MobileBottomNav/MobileBottomNav.tsx).
- **`html.layout-desktop { scrollbar-gutter: stable; }`** reserves vertical scrollbar space so the centered
  top nav does not shift when shorter pages (e.g. Decks) hide the document scrollbar.
- **Mobile horizontal containment:** `html.layout-mobile`, `body`, `#root`, and `.app-shell` / `.app-shell__content` use `overflow-x: clip` and `max-width: 100%` so the page cannot pan sideways. Intentional horizontal scroll stays on inner regions (`.db__types`, `.col__types`, `.dbv-filter-rail__controls`, `.home__rail`) via `overflow-x: auto`, `min-width: 0`, and `overscroll-behavior-x: contain`.
- **Collection mobile header** (`layout-mobile`, [`CollectionPage.css`](frontend/src/features/collection/CollectionPage.css)): four stacked rows — (1) `.col__heading` flex row with `.col__title` left and `.col__stats` right on one line (`margin-top: 0` on stats); (2) `.col__search` full width (`flex: 1 1 100%`); (3) `.col__set` + `.col__owned-toggle` on the next line (set select `min-width: 173px` / `max-width: 230px`, left-aligned; toggle `margin-left: auto`); (4) `.col__types` horizontal chip scroll below the header. Desktop keeps the original side-by-side header band. **Mobile type-tab swipe** (`.layout-mobile .col`): horizontal swipe on card grid, All list, or empty content cycles type tabs cyclically (`DBV_TAB_ORDER`: All → Characters → … → Basic → wrap); `touch-action: pan-y` on `.col`; blocked regions in `COLLECTION_SWIPE_BLOCK_SELECTOR` (`.col__types`, `.col__header`, `.pagination`, `.qty-stepper`); disabled while `CardDetailPanel` is open; active `[data-col-tab]` chip centers on tab change.
- **Desktop** (`> 900px`): sticky **top nav** (`--top-nav-height: 60px`) with the logo,
  primary links (Home, Database, Decks, Collection), and the user menu on the right. The
  active link is cyan with a soft pill background.
- **Mobile** (`<= 900px`): a fixed **bottom nav** (`--bottom-nav-height: 66px`) with
  icon+label tabs ordered **Database, Decks, Home, Collection, Profile** (Home centered;
  `.bottom-nav__item--home .bottom-nav__icon` at `calc(1.4rem * 1.15)` vs `1.4rem` for other
  tabs). Top nav is hidden. Deck editor (outside AppShell) uses the same bottom nav on mobile;
  `.deck-editor__content` bottom padding clears the fixed bar (`--bottom-nav-height` + safe area).
- Nav, dropdowns, and tooltips sit at `--z-nav: 9999` so they always clear page content.

## Cards & Card Art
- Card art is rendered exclusively through the `CardImage` component, which resolves
  paths via [`frontend/src/lib/images/cardImages.ts`](frontend/src/lib/images/cardImages.ts)
  (CDN base + thumbnail rules). Never hardcode image URLs.
- Card tiles (`CardTile`) use a type-aware aspect frame (`catalogType` prop): portrait
  `5:7` by default; characters `380:280`; locations and events `236:151`. Tiles use
  `--radius-md` corners, subtle border, and a label + set line beneath. Owned/selected tiles
  get the accent glow; unowned tiles in the Collection are dimmed. Database and Collection
  grids use 4 columns for landscape types and 6 for portrait (1 on mobile).
- **All tab** (first tab on Database and Collection; Collection defaults to **All**): cross-type **text list** via
  `CatalogAllList` — no card images. **Database** rows: `#set_number`, card name, type badge, friendly set name,
  spacer, and (Collection only) trailing `QuantityStepper`. **Collection** All uses `typeBetweenNumberAndName`:
  `#` → type → name → set on desktop with fixed scan-band column widths and tabular `#` numerals;
  mobile row 1 is set code + `#` + compact type + name (single row, `compactTypeLabels`).
  Sort is fixed checklist
  order: set → non-foil before foil → set_number → name (`compareAllCatalogCards`). Selected
  row: accent left border + `--color-accent-soft` background. DBV All opens detail slideout on
  row click only (deck/collection actions in panel). Pagination uses 48 rows per page on All
  (24 on image grids). Search + set filter apply; DBV hides `DbvFilterRail` on All.
- Missing art shows a neutral "No image" placeholder frame (no broken-image icon).
- **Deck tiles (`DeckTile`)** use a feature-character art zone at landscape card ratio
  (`aspect-ratio: 380 / 280`): characters (and the location card when set) cycle on hover after a
  1s delay. Character slides use `object-fit: contain`; location slides use full-res art with
  `object-fit: cover` so the 236×151 location frame fills the hero slot without letterboxing. A bottom
  gradient scrim carries the deck **name** (`.deck-tile__name`: `calc(var(--font-size-lg) * 1.1)`;
  compact tiles use `calc(var(--font-size-base) * 1.1)`). The info panel opens with a single
  **meta bar**: 18×18 cards icon + count on the left, mission set chip centered (`full`,
  catalog `mission_set`), and `threat.png` + threat on the right. Max-stat bar follows on `full` tiles. A **footer** row
  shows the updated date (left) and optional legality badge lower-right (**Limited** or **Not Legal**
  only; legal decks show date only).
- **Foil laminate (per screen):** The prismatic `FoilCard` overlay is controlled by `showFoilEffect`
  on `CardImage` / `CardTile` / `CardDetailPanel` (default `true`). Base cards that merely have a
  foil variant show a silver ✦ badge (`.card-tile__foil-badge`) instead of the laminate.

  | Screen | Laminate | Indicator |
  |---|---|---|
  | Database View — grid | Off | ✦ badge + **Has Foil** metadata |
  | Database View — detail slide-out | On for foil printings | **Has Foil** / **Is Foil** metadata |
  | Deck editor — Add Cards slideout | Off | Plain catalog art |
  | Deck editor — card grid, Draw Hand, detail | On when `is_foil` or foil printing selected | — |
  | Collection (grid + detail) | On for foil printings | — |
  | Deck tiles (selection / home / community) | On when deck entry `is_foil` on character slides | — |

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
- **Deck tile legality** (`DeckTile` footer): show **Limited** when `is_limited`; else **Not
  Legal** when `!is_valid`; else no badge. Never show Legal + Limited together.
- **Legality** (deck editor, etc.): `Legal` uses `--color-legal` (green), `Not Legal` uses
  `--color-not-legal` (red); `Limited` uses `--color-warning` (yellow `#f6a623`, `.badge-limited`).
- **Legality chip is interactive in the deck editor for the owner**: rendered as a clickable
  `<button>` (`.deck-editor__legality-toggle`, `cursor: pointer`). Clicking a Legal/Not-Legal chip
  toggles the deck to the yellow **Limited** chip (skips legality validation); clicking Limited
  reverts. Non-owners/read-only see a static chip. All other surfaces remain display-only.
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
- Home Recent Updates list — [`frontend/src/features/home/HomeUpdatesPage.md`](frontend/src/features/home/HomeUpdatesPage.md)
- Database (DBV) — [`frontend/src/features/database/DatabasePage.md`](frontend/src/features/database/DatabasePage.md)
- Collection — [`frontend/src/features/collection/CollectionPage.md`](frontend/src/features/collection/CollectionPage.md)
- Deck Selection — [`frontend/src/features/deck-selection/DeckSelectionPage.md`](frontend/src/features/deck-selection/DeckSelectionPage.md)
- Deck Editor (DEV) — [`frontend/src/features/deck-editor/DeckEditorPage.md`](frontend/src/features/deck-editor/DeckEditorPage.md)

### Deck Editor — Desktop header compaction
DTV topbar (`.deck-editor__topbar`) uses a 3-column grid on wide viewports: leading (name + meta) | stats panel | actions. When the main column is narrow (`@container deck-editor-main (max-width: 1700px)`, desktop only), it switches to a **two-row** layout in [`DeckEditorPage.css`](frontend/src/features/deck-editor/DeckEditorPage.css):

| Row | Content |
|---|---|
| Row 1 | Leading (back + name + meta chips on one line) \| actions (right-aligned) |
| Row 2 | Full-width stats panel (threat, character max, icon totals), centered, top border separator |

Row 1 keeps back, deck name, and meta chips (card count, legality, visibility) on a single line. Stat block labels stay visible on row 2 (short labels **Max** / **Total**, uppercase via CSS). Mobile `layout-mobile` unchanged.

**Header stat icons** (`.layout-desktop .deck-editor__header .stat-icon-badge--lg`): `StatIconBadge` `lg` scaled to **90%** (40px → 36px, value font 16px → 14.4px). Card-tile stat icons in the deck body remain full `lg` (40px).

**Stat tooltips** (concise, on hover):
- Threat: `Threat: {n}` (or `{n}/76` over cap) via `formatThreatTooltip`
- Max section: `Character max stats`; each icon: `Character max — {Stat}: {value}`
- Total section: `Deck icon totals`; each icon: `Icon total — {Stat}: {value}`

### Deck Editor — Simulate KO
| Element | Tokens / values |
|---|---|
| KO toggle (`.deck-editor__ko-btn`) | `--color-ko-soft` fill, `--color-ko` text, `--color-ko-border` border; `min-width: 36px`, `font-size-xs`, semibold |
| KO active (`.deck-editor__ko-btn.is-active`) | `--color-ko` fill, `--color-text-on-accent` label |
| KO-dimmed card (`.deck-editor__card--ko-dimmed .deck-editor__card-media`) | `filter: grayscale(0.7) brightness(0.55)` on art only — matches `CardTile` dimming; footer controls stay full contrast |

### Deck Editor — Pre-Placed
Owner-only toggle (eligible cards) that marks a card as placed at game start (`exclude_from_draw`). Full spec: [`DeckEditorPage.md`](frontend/src/features/deck-editor/DeckEditorPage.md#pre-placed). Eligibility: [`prePlaced.ts`](frontend/src/lib/decks/prePlaced.ts).

| Element | Tokens / values |
|---|---|
| Toggle button (`.card-detail__preplaced-btn`) | Pill (`--radius-pill`); `--color-accent-bright` border/text, transparent fill; hover `--color-accent-soft`; `font-size-xs`, semibold. In `CardDetailPanel` slide-out |
| Toggle active (`.card-detail__preplaced-btn.is-active`) | `--color-accent-bright` fill, `--color-text-on-accent` label |
| Hint (`.card-detail__preplaced-hint`) | `--font-size-xs`, `--color-text-muted` |
| Tile chip (`.deck-editor__preplaced-chip`) | Subtle — matches Reserve button: `--color-bg-scrim` fill, `--color-text-dim` text, `--color-border` border, `--radius-sm`, `height: 26px`, `font-size: 10px`, medium weight; **center-aligned** in footer |
| Footer layout (`.deck-editor__card-footer`) | `display: grid; grid-template-columns: 1fr auto 1fr` — spacer / centered chip / right-aligned `.deck-editor__card-controls` |

### Deck Editor — Draw Hand
Top slide-out overlay ([`DrawHandPanel.css`](frontend/src/features/deck-editor/DrawHandPanel.css)). Full spec: [`docs/current/DRAW_HAND_FEATURE.md`](docs/current/DRAW_HAND_FEATURE.md). After draw/redraw, cards sort by deck section order then within-type deck sort (manual drag reorder still allowed until next draw).

| Element | Tokens / values |
|---|---|
| Trigger active (`.deck-editor__actions .btn-ghost.is-active`) | `--color-accent-bright` text, `--color-border-accent` border, `rgba(0, 200, 232, 0.08)` background |
| Panel (`.draw-hand-slideout`) | `SlideOutPanel` `side="top"`; `max-height: 70vh` desktop, `55vh` mobile |
| Card slot width | `--deck-editor-portrait-col`: **210px** desktop, **165px** mobile (`DeckEditorPage.css`) |
| Portrait card art | Same progressive thumb → full-res as deck grid (`deckEditorCardImage.ts`; events excepted — rotated landscape in `.draw-hand__event-rotate`) |
| Row gap | `var(--space-4)` between slots |
| Event rotation | `.draw-hand__event-rotate` — landscape art `rotate(-90deg)` in portrait slot |
| Missing art label (`.draw-hand__missing-art`) | `--font-size-xs`, `--color-text-muted`, ellipsis |
| Redraw (`.draw-hand__redraw`) | Centered footer; `min-width: 140px` |
| KO-dimmed drawn card | Same `.deck-editor__card--ko-dimmed` art filter as main grid |

### Deck Editor — Card detail Printings (owners)
Shown in [`CardDetailPanel`](frontend/src/components/CardDetailPanel/CardDetailPanel.tsx) when a deck tile has **more than one** catalog printing. Section sits **above Details** (after Ability/stats).

| Element | Tokens / values |
|---|---|
| Section title (`.card-detail__section-title`) | `--font-size-sm`, uppercase, `--color-text-muted` |
| Row (`.card-detail__printing-row`) | flex space-between; `--space-2` vertical padding; `border-bottom: 1px solid var(--color-border)` |
| Meta (`.card-detail__printing-meta`) | `--font-size-sm`, `--color-text` — `{friendly set name} · #{set_number}` |
| Apply (`.card-detail__printing-apply`) | `--color-accent` border/text; `--radius-sm`; hover fills accent |
| Current / disabled (`.card-detail__printing-apply--current`) | `opacity: 0.45`; `--color-border` border; `--color-text-muted` text; `cursor: not-allowed` |

### Deck Editor — Add Cards quantity overlay
Top-right overlay on Add Cards catalog tiles ([`AddCardsQtyOverlay.css`](frontend/src/features/deck-editor/AddCardsQtyOverlay.css)). Positioned via `.card-tile__overlay`.

| State | Class | Visual |
|---|---|---|
| Zero in deck | `.add-cards__add` | `--color-bg-scrim` fill, `--color-accent-bright` `+`, `1px solid var(--color-border-accent)`, `--radius-full`, `--font-size-xs`, bold; `padding: 2px 8px` (mobile: `4px 10px`) |
| One or more | `.add-cards__qty` | `--color-bg-scrim` fill, `1px solid rgba(54, 211, 153, 0.5)`, `--radius-full`, inline-flex, `gap: 2px`, `padding: 2px 4px` |
| − / + buttons | `.add-cards__qty-btn` | 20×20 desktop, 28×28 mobile; transparent bg, `--color-text`; hover: `rgba(255,255,255,0.12)` + `--color-accent-bright`; disabled: `opacity: 0.35` |
| Count | `.add-cards__qty-value` | `--font-size-xs`, bold, `--color-text`, read-only (no input) |

Mobile swipe: `.add-cards__qty` and `.add-cards__add` are in `ADD_CARDS_SWIPE_BLOCK_SELECTOR` so tab swipes do not fire when adjusting quantity.

### Deck Editor — Instance tiles
Each physical copy is one deck tile (`instanceId` client-side). Owners remove via trash on every type; **Save** aggregates instances by `(type, cardId)` for the API.

| View | Control | Class |
|---|---|---|
| Card view | Trash in tile footer | `.deck-editor__card-remove` (26×26, scrim + border) |
| List view | Trash at row end | `.deck-editor__list-remove` (24×24 desktop, 44×44 mobile; icon-only default, danger tint on hover/focus) |

List rows aggregate duplicate `type + cardId` copies; each trash click removes one instance (last in `instanceIds`). Character list rows keep Reserve + KO left of trash.

### Deck Editor — Mobile bottom nav
On `.layout-mobile`, the deck editor renders the shared `MobileBottomNav` (`--bottom-nav-height: 66px`,
`--z-nav: 9999`). Nav is hidden during Add Cards, Draw Hand, and Card Detail slide-outs. Content
scroll area: `padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom) + var(--space-2))`.

### Deck Editor — Mobile card grids
On `.layout-mobile`, main deck body (`.deck-editor__cards`, `.deck-editor__cards--landscape`) and Add Cards grids (`.add-cards__grid--portrait`, `--landscape`, `--portrait-4`) use **one card per row**: `grid-template-columns: minmax(0, 1fr)`. Stacks tab character tile is full width. Draw Hand carousel is unchanged (horizontal snap). Add Cards pagination: **8** cards/page on mobile.

### Deck Editor — Mobile type tabs
Sticky `.deck-editor__type-tabs` below the header when the deck has **2+ types** on mobile. Chips use `.deck-editor__type` / `.deck-editor__type-count` (Add Cards pill style); labels are `shortLabel` from `CATALOG_TYPES`. Only types with cards in the deck appear. Swipe left/right on `.deck-editor__content` cycles types cyclically via native `touchstart`/`touchmove`/`touchend` listeners (`useHorizontalSwipe`); horizontal swipes work on card art; gestures starting on footer controls, tabs, or header are ignored. `touch-action: pan-y` on content preserves vertical scroll.

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
| Has Foil (`.dbv-filter-rail__foil-toggle`) | Shared `Checkbox` component; label `--color-text`; persists across tab switches; hidden when rail collapsed |
| Stat op/value (`.dbv-stat-cell__op`, `.dbv-stat-cell__value`) | `width: calc(2.75rem * 1.15)`, `min-height: calc(1.5rem * 1.15)`, `font-size: calc(var(--font-size-xs) * 1.15)`; mobile `min-height: calc(36px * 1.15)` |
| Collapse toggle (`.dbv-filter-rail__toggle`) | Left-edge chevron; `28×28px` desktop, `44×44px` mobile; `--color-text-muted`, hover `--color-bg-hover` |
| Collapsed rail (`.dbv-filter-rail.is-collapsed`) | Transparent, no border; keeps `--space-3` horizontal padding so the chevron stays aligned with expanded; chevron locked left in `.dbv-filter-rail__toggle-icon-wrap` (28px); `1px` rule (`.dbv-filter-rail__toggle-line`) extends right |

**Layout:** Controls scroll horizontally on narrow viewports; mobile icon/stat tap targets
are **44px** under `.layout-mobile`. Trailing chips + Clear sit at the rail end.

## Home Recent Updates

News/announcement tiles on `/home` (rail) and `/home/updates` (full list). Shared styles in
[`recentUpdates.css`](frontend/src/features/home/recentUpdates.css); components
[`RecentUpdateTile.tsx`](frontend/src/features/home/RecentUpdateTile.tsx),
[`RecentUpdatesList.tsx`](frontend/src/features/home/RecentUpdatesList.tsx).

| Element | Tokens / values |
|---|---|
| Section View All (`.home__view-all`) | `--color-accent-bright`, `--font-size-sm`, semibold; matches deck rails |
| Tile (`.home__news-item`) | `--color-bg-panel` fill, `--color-border` border, `--radius-lg`, `134px` height on desktop rail |
| Open tile (`.home__news-item--open`) | `flex-grow: 2.4` (horizontal expand on desktop rail) |
| Thumbnail (`.home__news-thumb`) | `72×72px`, `--radius-md`, `object-position: center 22%` |
| Type badge (`.home__news-tag`) | `10px` bold caps; default accent soft; `.home__news-tag--feature` uses `--color-info` |
| Summary clamped (`.home__news-summary--clamped`) | `-webkit-line-clamp: 2` |
| Summary expanded (`.home__news-summary--expanded`) | `-webkit-line-clamp: 6` |
| Date (`.home__news-date`) | `--font-size-xs`, `--color-text-dim`; displays `updatedAt` |
| Stacked list (`.recent-updates-list--stacked`) | Full-width column, `height: auto`, vertical expand — used on `/home/updates` and mobile home rail |
| Updates page shell (`.home-updates__inner`) | `--content-max-width`, `--space-6` padding; pagination in `.home-updates__pagination` with `--space-4` top margin |

**Home rail:** shows 3 newest tiles; View All appears when total count exceeds 3.
**Updates page:** 10 tiles per page via shared `Pagination`; no global nav entry.
