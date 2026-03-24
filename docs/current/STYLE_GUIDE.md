# Overpower Deckbuilder Style Guide

## Table of Contents
1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [UI Components](#ui-components)
5. [Screen-Specific Styling](#screen-specific-styling)
6. [Images and Assets](#images-and-assets)
7. [Layout and Spacing](#layout-and-spacing)
8. [Deck Editor Layout Specifications (2025)](#deck-editor-layout-specifications-2025)
9. [Interactive States](#interactive-states)
10. [Responsive Design](#responsive-design)
11. [Global Navigation](#global-navigation)
12. [View Transitions and Modal Fade](#view-transitions-and-modal-fade)
13. [Import/Export Button Styling](#importexport-button-styling)
14. [One Per Deck Card Dimming](#one-per-deck-card-dimming)
15. [Cataclysm Card Dimming](#cataclysm-card-dimming)
16. [Assist Card Dimming](#assist-card-dimming)
17. [Ambush Card Dimming](#ambush-card-dimming)
18. [Fortification Card Dimming](#fortification-card-dimming)
19. [Pre-Placed Button Styling (Spartan Training Ground)](#pre-placed-button-styling-spartan-training-ground)
20. [Deck Editor Card View Styling](#deck-editor-card-view-styling)
21. [Deck Editor List View Styling](#deck-editor-list-view-styling)
22. [Export Modal Styling](#export-modal-styling)
23. [Import Modal Styling](#import-modal-styling)
24. [Google Sign-In Button Styling](#google-sign-in-button-styling)
25. [Sign Up and Account Creation Styling](#sign-up-and-account-creation-styling)
26. [Create Your First Deck Tile and Sample Decks](#create-your-first-deck-tile-and-sample-decks)
27. [Foil Card Shimmer Effect](#foil-card-shimmer-effect)
28. [Reserve Button Styling](#reserve-button-styling)
29. [Deck Editor Available Cards Character Stacks](#deck-editor-available-cards-character-stacks)

## Overview

The Overpower Deckbuilder follows a dark, modern design aesthetic with a focus on card game theming. The design uses a consistent color palette of teals, golds, and dark backgrounds to create an immersive gaming experience.

## Color Palette

### Primary Colors

#### Background Colors
- **Primary Background**: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`
  - Used for: Main page backgrounds across all screens
  - Hex equivalent: `#1a1a2e` to `#16213e`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #1a1a2e; border: 1px solid #ccc; vertical-align: middle; margin-right: 4px;"></span><span style="display: inline-block; width: 20px; height: 20px; background-color: #16213e; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Secondary Background**: `rgba(255, 255, 255, 0.1)`
  - Used for: Card containers, modal backgrounds, section backgrounds
  - Provides subtle transparency over main background
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle; margin-right: 4px;"></span> (10% opacity)

- **Card Background**: `rgba(52, 73, 94, 0.8)`
  - Used for: Deck editor cards, database cards, modal content
  - Hex equivalent: `#34495e` with 80% opacity
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #34495e; border: 1px solid #ccc; vertical-align: middle;"></span>

#### Accent Colors

- **Primary Teal**: `#4ecdc4`
  - Used for: Primary buttons, active states, highlights, text accents
  - Gradient: `linear-gradient(135deg, #4ecdc4, #2cb1a6)`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #4ecdc4; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Secondary Teal**: `#2cb1a6`
  - Used for: Hover states, gradient combinations
  - Often paired with primary teal in gradients
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #2cb1a6; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Gold/Yellow**: `#ffd700`
  - Used for: Section titles, stat values, important text
  - Gradient: `linear-gradient(45deg, #ffd700, #ffed4e)`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffd700; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Red Accent**: `#ff6b6b`
  - Used for: Danger states, threat indicators, error messages
  - Gradient: `linear-gradient(45deg, #ff6b6b, #4ecdc4)`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ff6b6b; border: 1px solid #ccc; vertical-align: middle;"></span>

#### Text Colors

- **Primary Text**: `#ffffff`
  - Used for: Main body text, headings, labels
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Secondary Text**: `#bdc3c7`
  - Used for: Subtext, descriptions, secondary information
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #bdc3c7; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Muted Text**: `rgba(255, 255, 255, 0.6)`
  - Used for: Placeholders, disabled states, subtle text
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> (60% opacity)

- **Dark Text**: `#1a1a2e`
  - Used for: Text on light backgrounds (buttons, cards)
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #1a1a2e; border: 1px solid #ccc; vertical-align: middle;"></span>

#### Status Colors

- **Success Green**: `#27ae60`
  - Used for: Success states, positive actions
  - Gradient: `linear-gradient(135deg, #27ae60, #2ecc71)`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #27ae60; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Danger Red**: `#e74c3c`
  - Used for: Error states, delete actions, warnings
  - Gradient: `linear-gradient(135deg, #e74c3c, #c0392b)`
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #e74c3c; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Warning Yellow**: `#feca57`
  - Used for: Warning states, medium threat levels
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #feca57; border: 1px solid #ccc; vertical-align: middle;"></span>

- **Info Blue**: `#48dbfb`
  - Used for: Information states, low threat levels
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #48dbfb; border: 1px solid #ccc; vertical-align: middle;"></span>

#### Border Colors

- **Primary Border**: `rgba(255, 255, 255, 0.2)`
  - Used for: Card borders, input borders, general borders
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> (20% opacity)

- **Accent Border**: `rgba(78, 205, 196, 0.3)`
  - Used for: Active states, focused elements, teal accents
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #4ecdc4; border: 1px solid #ccc; vertical-align: middle;"></span> (30% opacity)

- **Gold Border**: `rgba(255, 215, 0, 0.3)`
  - Used for: Section dividers, important borders
  - <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffd700; border: 1px solid #ccc; vertical-align: middle;"></span> (30% opacity)

## Typography

### Font Family
- **Primary**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Used consistently across all screens and components

### Font Sizes
- **Large Headings**: `2.5rem` (40px)
- **Section Headings**: `1.8rem` (28.8px)
- **Subsection Headings**: `1.5rem` (24px)
- **Body Text**: `1rem` (16px)
- **Small Text**: `0.9rem` (14.4px)
- **Tiny Text**: `0.8rem` (12.8px)

### Font Weights
- **Bold**: `700` - Used for headings, important text
- **Semi-bold**: `600` - Used for buttons, labels
- **Medium**: `500` - Used for secondary headings
- **Regular**: `400` - Used for body text

## UI Components

### Buttons

#### Primary Button
- **Background**: `linear-gradient(135deg, #4ecdc4, #2cb1a6)`
- **Text Color**: `#1a1a2e`
- **Border**: `1px solid #4ecdc4`
- **Padding**: `8px 16px`
- **Border Radius**: `6px`
- **Hover**: Lighter gradient with `translateY(-1px)` transform
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #4ecdc4; border: 1px solid #ccc; vertical-align: middle; margin-right: 4px;"></span> → <span style="display: inline-block; width: 20px; height: 20px; background-color: #2cb1a6; border: 1px solid #ccc; vertical-align: middle;"></span>

#### Secondary Button
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Text Color**: `#ffffff`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Hover**: `rgba(255, 255, 255, 0.2)`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> (10% opacity)

#### Danger Button
- **Background**: `linear-gradient(135deg, #e74c3c, #c0392b)`
- **Text Color**: `#ffffff`
- **Border**: `1px solid #e74c3c`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #e74c3c; border: 1px solid #ccc; vertical-align: middle; margin-right: 4px;"></span> → <span style="display: inline-block; width: 20px; height: 20px; background-color: #c0392b; border: 1px solid #ccc; vertical-align: middle;"></span>

### Login Modal — Contact Section

- **Purpose**: Provide a clear contact path for questions/account creation from the login tile.
- **Container**: `.login-contact`
  - **Spacing**: `margin-top: 18px; padding-top: 20px`
  - **Divider**: `border-top: 1px solid rgba(255, 255, 255, 0.14)`
  - **Text**: `color: rgba(255, 255, 255, 0.7)`; `font-size: 0.95rem`; `line-height: 1.35`
- **Email link**: `.login-contact-link`
  - **Color**: `#4ecdc4`
  - **Weight**: `400`
  - **Hover**: underline
- **Discord links**: `.login-contact-link`
  - Server invite: `https://discord.com/invite/overpowerlives`
  - Profile: `https://discord.com/users/414971289267339274`

#### Deck Editor Utility Buttons (Draw Hand / List View)
- **Class**: `.remove-all-btn`
- **Background**: `rgba(78, 205, 196, 0.2)`
- **Text Color**: `#4ecdc4`
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Height**: `auto` with `min-height: 24px` (matches Save/Cancel buttons)
- **Min-Height**: `24px`
- **Min-Width**: `80px`
- **Padding**: `4px 8px`
- **Display**: `inline-flex`; `align-items: center`; `justify-content: center`
- **Text Wrapping**: `white-space: nowrap` (prevents multi-line labels)
- **Border Radius**: `4px`
- **Font**: `0.8rem`, `500`
- **Hover**: `background: rgba(78, 205, 196, 0.3)`; `border-color: rgba(78, 205, 196, 0.4)`
- These specs keep Draw Hand and List View visually identical and match the size of Save/Cancel buttons.

### Cards

#### Main Card Container
- **Background**: `rgba(52, 73, 94, 0.8)`
- **Border Radius**: `10px`
- **Padding**: `1.5rem`
- **Box Shadow**: `0 8px 32px rgba(0, 0, 0, 0.3)`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #34495e; border: 1px solid #ccc; vertical-align: middle;"></span> (80% opacity)

#### Card Item
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Border**: `1px solid rgba(255, 215, 0, 0.3)`
- **Border Radius**: `8px`
- **Padding**: `1rem`
- **Hover**: `rgba(255, 215, 0, 0.2)` background with `#ffd700` border
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle; margin-right: 4px;"></span> (10% opacity) + <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffd700; border: 1px solid #ccc; vertical-align: middle;"></span> border

### Modals

#### Modal Overlay
- **Background**: `rgba(0, 0, 0, 0.8)`
- **Z-index**: `1000`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #000000; border: 1px solid #ccc; vertical-align: middle;"></span> (80% opacity)

#### Modal Content
- **Background**: `rgba(52, 73, 94, 0.95)`
- **Border Radius**: `10px`
- **Padding**: `2rem`
- **Box Shadow**: `0 8px 32px rgba(0, 0, 0, 0.5)`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #34495e; border: 1px solid #ccc; vertical-align: middle;"></span> (95% opacity)

#### Select Art modal (deck editor — alternate art picker)
- **CSS**: `public/css/index.css` — `.alternate-art-modal .art-option span` (caption under each thumbnail)
- **Caption text** (built in `public/js/alternate-art-modal.js`): friendly set name from `translateSet` / `/api/sets`, then optional ` - {set_number}` when the card row has a non-empty checklist `#`, then optional ` ({rarity})` only when `rarity` is non-empty (omit parentheses entirely if rarity is null/empty). `data-all-cards` on deck tiles includes `set_number` and `rarity` when present so labels work before `availableCardsMap` hydration. **ERB Promos** (`set` code `ERBP`, friendly name “…World Legends - Promos”) keep **`rarity` NULL** in the database so promos never show a checklist-derived rarity suffix.
- **Option order**: thumbnails are sorted by **set code** (A→Z), then by **checklist / `set_number`** (numeric, with non-foil before foil for the same number, e.g. `519` then `519F`), then by `imagePath` for ties. Same logic for “add from deck builder” and “change art on card in deck.”
- **ERB + ERBP character grouping**: Characters with **`set = 'ERBP'`** (promos / con exclusives) are **grouped with the same-named ERB hero** for deck-editor tiles (`data-all-cards`) and for **Change Art** (`characterSetsAlignForAlternateArts` in `alternate-art-modal.js`). DB rows keep real `set` codes so captions still show “…Promos” where appropriate; only the picker/grouping key treats `ERBP` as part of the ERB-world hero. Deck builder: `groupCardsForDeckBuilder` uses `set` as fallback when `universe` is missing and normalizes **ERBP → ERB** for character keys.
- **Font size**: `0.9rem`
- **Font weight**: `500`
- **Color**: `#e6e6e6` (~10% darker than `#ffffff` for captions on dark tiles)

### Input Fields

#### Text Input
- **Background**: `rgba(255, 255, 255, 0.9)`
- **Text Color**: `#1a1a2e`
- **Border**: `none`
- **Border Radius**: `5px`
- **Padding**: `0.75rem`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> (90% opacity)

#### Select Dropdown
- **Background**: `rgba(255, 255, 255, 0.9)`
- **Text Color**: `#1a1a2e`
- **Border**: `none`
- **Border Radius**: `5px`
- **Padding**: `0.75rem`
- <span style="display: inline-block; width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> (90% opacity)

## Screen-Specific Styling

### Main Dashboard (index.html)
- **Background**: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`
- **Header**: Unified header with logo, navigation tabs, and user menu
- **Deck Cards**: Grid layout with teal accents and gold highlights
- **Statistics**: Gold text for values, teal for labels
- **Deck Builder tab (deck list previews)**:
  - **Full redesign notes**: See `docs/DECK_SELECTION_PAGE_REDESIGN.md` for the complete feature-by-feature implementation details.
  - **Tile layout (compact modern)**: `.deck-card.deck-tile.deck-tile--compact`
    - **Structure**:
      - Left column: `.deck-tile-main` containing header + unified preview accordion
      - Right column: `.deck-tile-side` containing ellipsis + stats block
      - Header: `.deck-tile-header` with `.deck-tile-title`
      - Preview strip: `.deck-tile-previews` (characters stack + location + first mission)
    - **Deck tile background (selected background)**:
      - If `metadata.background_image_path` is set, the tile gets `.deck-tile--has-bg` and uses `--deck-tile-bg` for the image URL
      - Image is rendered via `::before` and shaded via `::after` using `rgba(0, 0, 0, 0.432)` to match deck editor overlay
    - **Deck title styling**:
      - `.deck-tile-title` uses **Info Blue** at ~90% opacity (`rgba(72, 219, 251, 0.9)`) and a retro-futuristic system font stack (`"Trebuchet MS"`, `"Avenir Next"`, `"Segoe UI"`, `system-ui`)
    - **Preview sizing**:
      - Characters stack: `.deck-character-card-display` (`190px × 140px`, overlap via `margin-left: -38px`)
      - Location preview: `.deck-tile-preview-card.deck-tile-location-preview` (`250px × 160px`, border `rgba(254, 202, 87, 0.45)`). Thumbnails are **`contain`**-fitted into the 500×320 source canvas (2× retina) with dark letterboxing so tall promo / alternate location art is not cropped (see `IMAGE_PIPELINE.md`).
      - Mission preview: `.deck-tile-preview-card.deck-tile-mission-preview` (`140px × 200px`)
      - Empty preview state (no selection): `.deck-tile-preview-card--empty`
        - **Goal**: empty **Location** and **Mission** slots should match empty **Character** slots
        - **Unified empty styling** (matches `.deck-character-card-display.empty`):
          - **Border**: `1px dashed rgba(78, 205, 196, 0.2)`
          - **Background**: `rgba(255, 255, 255, 0.05)`
          - **Text**: centered “Empty” label, `color: rgba(78, 205, 196, 0.5)`, `font-size: 0.6rem`
        - **Implementation note**: Location/Mission placeholders render as empty divs; the “Empty” label is provided via `::after` on `.deck-tile-preview-card--empty`
    - **Preview alignment**:
      - Compact tiles add `padding-left: 26px` on `.deck-card.deck-tile--compact .deck-character-cards-row` to keep the character accordion from overlapping the tile border
    - **Right-side stats**:
      - Container: `.deck-tile-side-meta` (subtle glass panel, `background: rgba(0, 0, 0, 0.44)`)
      - Rows: `.deck-tile-side-item` with `.deck-tile-side-label` and `.deck-tile-side-value` (value uses `#4ecdc4`)
      - Icons:
        - Threat uses `public/resources/images/icons/threat.png` via `.deck-tile-side-icon-img`
        - Cards uses `public/resources/images/icons/cards.svg`
        - Updated uses `public/resources/images/icons/updated.svg`
        - Created uses `public/resources/images/icons/created.svg`
      - Timestamps: if Created/Updated is today (local), show time (`h:mm`); otherwise show date (`M/D/YYYY`)
      - Legality banner: `.deck-tile-side-legality` (contains `.deck-validation-badge`)
    - **Actions menu**:
      - **Trigger**: `.deck-tile-menu-button` (ellipsis)
      - **Dropdown**: `.deck-tile-menu-dropdown` with `z-index: 9999` to ensure it layers above tile content
      - **Items**: `.deck-tile-menu-item` (danger variant: `.deck-tile-menu-item--danger`)
    - **Preview hover behavior (location + mission)**:
      - `.deck-tile-preview-card:hover`: lift/scale to match the character-accordion “focus” feel (`translateY(-10px) scale(1.08)`)
      - `.deck-tile-previews:hover .deck-tile-preview-card:not(:hover)`: non-hovered previews recede (`translateY(8px) scale(0.94)`) with slight desaturation
      - **Hover glow accents**:
        - Characters: teal glow (character stack hover)
        - Location: yellow glow (`.deck-tile-location-preview:hover`)
        - Mission: green glow (`.deck-tile-mission-preview:hover`)

#### Create Your First Deck Tile and Sample Decks
  - **"Create your first deck" tile (empty state)**:
    - **When it appears**: The tile is shown when the user has no user-created decks. This includes:
      - Zero decks at all (original behavior)
      - Only sample decks (decks whose names start with `"Sample: "`)
    - **When it is hidden**: Once the user saves their own first deck (any deck whose name does NOT start with `"Sample: "`), the tile no longer appears.
    - **Sample decks**: New users receive a copy of a random GUEST account deck on signup or Google Sign-In. The copy is prefixed with `"Sample: "` (e.g. `"Sample: Time Detectives"`). Sample decks are exact copies including all cards and metadata.
    - **Layout**: When visible with sample decks, the sample deck(s) appear first in the deck list, followed by the "Create your first deck" tile below. The tile matches the height of normal deck tiles (`min-height: 200px`, `height: 200px` via `.deck-tile--create-first`). Styling: centered text "Create your first deck.", color `#34495e`, `onclick="createNewDeck()"`.

  - **Mission tile preview selection (“Display” button)**:
    - **Goal**: choose **one** mission in the deck to be used for the deck selection tile’s mission preview.
    - **Where it appears**: deck editor mission cards (Tile View / List View), next to other per-card action buttons.
    - **Button text**: `Display`
    - **Styling**:
      - Uses `.reserve-btn` sizing/layout, plus `.display-mission-btn` to match the teal color scheme of the `-` action button.
    - **Behavior**:
      - If **no mission cards in deck**: no `Display` buttons appear.
      - If **no mission selected**: `Display` appears on each mission card.
      - If **a mission is selected**: `Display` appears only on the selected mission (active state); clicking again clears selection and restores buttons on all missions.
      - If the saved selection becomes invalid (mission removed): deck selection tile falls back to the first mission card.
    - **Persistence**:
      - Stored in `currentDeckData.metadata.display_mission_card_id`.
      - Persisted to the backend when the user clicks **Save**.

### Database View (database.html)
- **Default Tab**: Characters tab is the default landing tab when opening the database view
- **Character Cards**: Teal borders with gold text for character names
- **Stat Cards**: `rgba(255, 255, 255, 0.1)` background with teal numbers
- **Tab Navigation**: Teal active states with white inactive states
- **+Deck and +Collection Buttons**: Styled to match unselected tab (all DB View tabs)
  - **Background**: `rgba(255, 255, 255, 0.1)`
  - **Border**: `1px solid rgba(255, 255, 255, 0.2)`
  - **Text Color**: `#ffffff`
  - **Border Radius**: `8px`
  - **Hover**: `background: rgba(255, 255, 255, 0.2)`; `border-color: rgba(255, 255, 255, 0.3)`
  - **Active**: `background: rgba(255, 255, 255, 0.15)`
  - **CSS Classes**: `.add-to-deck-btn`, `.add-to-collection-btn`, `.remove-from-collection-btn` (in `database-view.css`). -Collection is disabled when the card variant is not in the collection (`opacity: 0.5`, `cursor: not-allowed`).
  - **Collection table sort** (`public/js/collection-view.js`): sort by **#** uses `data-card-set-code` (raw `ERB` / `ERBP` / `SKY`, …) as the **primary** key, then foil vs non-foil, then numeric `data-set-number` (checklist # with trailing `F` stripped for the numeric tier). Do **not** sort on translated set display names — that split ERB rows and hid prize-pack hero #s (536–544) out of sequence.
- **Search Results**: Gold highlights for matching text
- **Search Bar Styling**: 
  - **Advanced Universe Card Effect Search**: 480px width with centered alignment
  - **Locations Special Ability Search**: 480px width with centered alignment
  - **Events Game Effect Search**: 320px width with centered alignment
  - **Aspects Search Bars**: 300px width with centered alignment (Name, Location, Card Effect)
  - **Aspects Table Layout**: Fixed table layout with percentage-based column widths
    - Image: 15% | Add to Deck: 8% | Card Name: 18% | Location: 12% | Card Effect: 25% | Fortifications: 10% | One Per Deck: 12%
  - **CSS Implementation**: `width: 300px !important; max-width: 300px !important; margin: 0 auto; display: block; box-sizing: border-box;`
  - **Table Layout**: `table-layout: fixed !important; width: 100% !important;`
  - **Specificity**: Inline styles in `index.html` for highest CSS specificity override
  - **Responsive**: Maintains consistent width across different screen sizes
- **Special Cards Table Columns**:
  - **Column order**: Image | Add to Deck | Name | Character | Card Effect | **Icon** | Value | Function
  - **Width layout** (`#special-cards-table`): `14% | 9% | 15% | 13% | 21% | 8% | 8% | 12%`
  - **Icon column** (power type icons from the `icons TEXT[]` DB column):
    - Cell container: `.special-power-icons-cell` (`display: grid`, `grid-template-columns: repeat(2, 20px)`, centered, `gap: 4px`)
    - Cell icon selector: `.special-power-type-icon` — fixed `20px × 20px`, `object-fit: contain`
    - Empty state: `.special-function-icons-empty` (muted dash, same as Function column)
    - Text fallback: `.special-icon-text-fallback` — used when no PNG is available (e.g. Multi-Power → "MP")
    - Source images: `src/resources/images/icons/` — `energy.png`, `combat.png`, `brute_force.png`, `intelligence.png`, `any-power.png`
  - **Icon header filter**:
    - Outer container: `.icon-filter-container` (flex column, centered, `gap: 6px`)
    - Toggle grid selector: `.special-power-filter-toggles` — `display: grid; grid-template-columns: repeat(2, 36px); gap: 6px`
    - Toggle button selector: `.power-type-filter-toggle` — same `36px` square style as `.function-filter-toggle`
    - Toggle icons: `<img>` at `20px × 20px` inside each button
    - Active state: `.is-active` (teal highlight + slight lift) toggled on click
    - Disabled state: `.is-disabled` + `button.disabled = true` (opacity 0.35, no pointer) when `No Icon` is active
    - "No Icon" toggle: `#special-no-icon-toggle` checkbox + `.special-no-icon-toggle-label` (same style as `.special-no-value-toggle-label`)
  - **Icon filter behavior**:
    - No active toggles → no filter (all cards shown)
    - One or more power type toggles active → OR logic: card must have at least one matching entry in its `icons` array
    - **Multi-Power toggle** is special: matches any card with `icons.length >= 2` (two or more icons), regardless of which types
    - When `No Icon` is checked: power type toggles are disabled and only cards with `null` or empty `icons` array match
    - Combining icon type filter with other filters uses AND logic overall
  - **Function icon render** (unchanged):
    - Container: `.special-function-icons-cell` (`display: flex`, wrapped, centered, `gap: 6px`)
    - Icon selector: `.special-function-icon`
    - Exact size: fixed `32px x 32px` (min/max locked)
    - Empty state: `.special-function-icons-empty` (muted dash placeholder)
  - **Function header filters** (unchanged):
    - Group selector: `.special-function-filter-toggles` (2-column grid of icon toggles)
    - Toggle selector: `.function-filter-toggle`
    - Visible toggle set: Offensive Action, Defensive Action, Remainder of Battle, Remainder of Game, Attach to a Character, Astral Plane
    - Toggle icon size: `.function-filter-toggle img` is fixed at `24px x 24px`
    - Default: `36px` square, translucent background, subtle white border
    - Hover: brighter background/border
    - Active: `.is-active` with teal-highlighted background/border and slight lift
    - Accessibility: `aria-pressed` state and focus ring via `:focus-visible`
  - **Full filter behavior**:
    - Text filters (Name, Character, Card Effect): substring match, AND with each other
    - Value filters: `=` / `Min` / `Max` numeric inputs; `No value` toggle for NULL-only rows (disables numeric inputs)
    - Icon power type toggles: OR logic within selected types; Multi-Power = 2+ icons; `No Icon` = null/empty icons
    - Function icon toggles: OR logic across selected function icons
    - Combined: `text AND value AND icon-type AND function-icons`
    - `Clear All Filters` resets all of the above
    - Power type icons and function icons do **not** open the global image modal on click

### Deck Builder (deck-builder.html)
- **Two-Column Layout**: Card browser and deck viewer side by side
- **Card Categories**: Collapsible sections with gold headers
- **Deck Statistics**: Gold text for values, teal for labels
- **Drag and Drop**: Teal borders for drop zones

### Deck Editor Modal Layout (Latest Design - 2025)
- **Single Row Header Layout**: All elements in one horizontal row
- **Left Section**: Deck title and description
- **Center Section**: Summary statistics (perfectly centered in window width)
- **Right Section**: Action buttons (Save/Cancel stacked vertically)
- **Search Bar**: Replaces "Available Cards" text above card list
- **Default Divider Position**: 67% deck pane / 33% available cards pane
- **Minimal Spacing**: Reduced padding and margins for compact layout

### Database Management (database-view.html)
- **Admin Interface**: Similar to database view with additional controls
- **User Management**: Red accents for danger actions
- **Data Tables**: Alternating row colors for readability

## Images and Assets

### Logo
- **Primary Logo**: `/src/resources/images/logo/logo5.png`
- **Usage**: Header navigation, login modals, main branding
- **Sizing**: Max-width 300px for main display, 120px for header

### Icons
- **Threat Icon**: `/resources/images/icons/threat.png`
- **Stat Icons**: 
  - Brute Force: `/src/resources/images/icons/brute_force.png`
  - Combat: `/src/resources/images/icons/combat.png`
  - Energy: `/src/resources/images/icons/energy.png`
  - Intelligence: `/src/resources/images/icons/intelligence.png`

### Card Images
- **Character Cards**: `/src/resources/cards/images/characters/[character_name].webp`
- **Mission Cards**: `/src/resources/cards/images/missions/[mission_name]/[card_name].webp`
- **Power Cards**: `/src/resources/cards/images/power-cards/[card_name].webp`
- **Special Cards**: `/src/resources/cards/images/specials/[card_name].webp`
- **Placeholder**: `/src/resources/cards/images/placeholder.webp`

### Image Usage by Screen

#### Main Dashboard
- Logo in header navigation
- Character card images in deck displays
- Threat icons in deck statistics

#### Database View
- Logo in header
- Character card images in search results
- Stat icons in character details

#### Deck Builder
- Character card images in card browser
- Deck card images in deck viewer
- Placeholder images for missing cards

## Layout and Spacing

### Grid Systems
- **Main Container**: Max-width 1400px, centered
- **Card Grids**: `repeat(auto-fill, minmax(150px, 1fr))`
- **Deck Builder**: Two-column layout with `1fr 1fr`

### Spacing Scale
- **Extra Small**: `0.25rem` (4px)
- **Small**: `0.5rem` (8px)
- **Medium**: `1rem` (16px)
- **Large**: `1.5rem` (24px)
- **Extra Large**: `2rem` (32px)

### Padding and Margins
- **Card Padding**: `1rem` to `1.5rem`
- **Section Margins**: `1rem` to `2rem`
- **Button Padding**: `6px 12px` to `8px 16px`

## Deck Editor Layout Specifications (2025)

### Modal Header Layout
- **Container**: `.modal-header` with `display: flex`, `flex-direction: column`
- **Top Row**: `.deck-editor-top-row` with `display: flex`, `justify-content: space-between`
- **Padding**: `12px 20px 5px 20px` (reduced bottom padding for compact layout)
- **Background**: Header uses a subtle translucent overlay (`rgba(0, 0, 0, 0.06)` + `backdrop-filter: blur(3px)`) so the selected deck background remains visible and the header remains readable without looking darker than the content panes.
- **Seam handling**: Header shading extends slightly below the header to avoid a bright strip between the header and deck contents.
- **Margin Bottom**: `4px` (minimal spacing below header)
- **Gap**: `15px` between header elements
- **Border Bottom**: `1px solid rgba(255, 255, 255, 0.2)` (horizontal divider)

### Three-Section Layout
#### Left Section - Deck Title & Description
- **Container**: `.deck-editor-title-section`
- **Flex Properties**: `flex: 0 0 auto` (fixed width, no growing)
- **Margin Right**: `20px`
- **Min Width**: `200px` (ensures adequate space for title)
- **Content**: Deck title with validation badges, description text

#### Center Section - Summary Statistics
- **Container**: `.deck-summary-section`
- **Positioning**: `position: absolute`, `left: 50%`, `transform: translateX(-50%)`
- **Purpose**: Perfect centering in window width regardless of left/right content
- **Content**: Deck statistics (centered)
- **Layout**: `.deck-summary-content` with `display: flex`, `justify-content: center`, `gap: 30px`

#### Right Section - Action Buttons
- **Container**: `.deck-editor-right-controls` containing:
  - Utility buttons: `.deck-editor-utility-actions` (`#drawHandBtn`, `#listViewBtn`, `#previewBtn`, `#screenshotViewBtn`, and admin-only `#backgroundBtn`)
  - Divider: `.deck-editor-controls-divider` (vertical separator)
  - Actions grid: `.deck-editor-actions` (Export/Import/Save/Cancel)
- **Flex Properties**: `flex: 0 0 auto`, `margin-left: auto` (pushes to right)

- **Utility button grid placement**:
  - Upper-left: `#backgroundBtn`
  - Upper-right: `#previewBtn`
  - Lower-left: `#drawHandBtn`
  - Lower-right: `#listViewBtn`
  - (Optional) `#screenshotViewBtn` appears on a third row spanning both columns when enabled.
- **Layout**: `display: flex`, `align-items: center`, with a vertical separator between utility and actions

- **Preview mode**:
  - Button: `#previewBtn` (`Preview` ↔ `Edit`)
  - Behavior: toggles the deck editor into read-only mode in-place (no reload)
  - Hidden when the deck is forced read-only (non-owner or `?readonly=true`)

- **Button grid stability**:
  - Utility buttons (`.deck-editor-utility-actions`) use fixed row height (`24px`) so the grid does not stretch when the Draw Hand section is opened.
  - The actions grid (`.deck-editor-actions`) uses `grid-template-rows: auto auto` to prevent vertical stretching.

### Button Specifications
#### Action Buttons (Save/Cancel)
- **Base Class**: `.action-btn`
- **Height**: `auto` with `min-height: 24px`
- **Padding**: `4px 8px`
- **Box Sizing**: `border-box`
- **Width**: `100%` of container
- **Text Align**: `center`

#### Save Button Styling
- **Class**: `.action-btn.save-btn`
- **Background**: `rgba(78, 205, 196, 0.2)` (teal/cyan)
- **Color**: `#4ecdc4`
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Hover**: `rgba(78, 205, 196, 0.3)` background, `rgba(78, 205, 196, 0.4)` border

#### Cancel Button Styling
- **Class**: `.action-btn.cancel-btn`
- **Background**: `rgba(255, 255, 255, 0.1)` (black and white look)
- **Color**: `#ffffff`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)`
- **Hover**: `rgba(255, 255, 255, 0.2)` background, `rgba(255, 255, 255, 0.3)` border

### Search Bar Integration
- **Location**: Inside `.card-selector-pane`, replaces "Available Cards" heading

### Deck Editor Tile View — Action Button Placement

- **Goal**: In **Tile View**, per-tile action buttons (e.g. **Change Art**, **KO**, **Reserve**, **-1/+1**) must be **bottom-right aligned** within the tile (not vertically centered).
- **Why**: Keeps actions visually consistent and prevents regressions where buttons drift to mid-right due to layout/cascade changes.
- **Selectors**:
  - **Actions container**: `.deck-card-editor-actions`
  - **Tile View scope** (do not affect List/Card views): `.deck-cards-editor:not(.list-view):not(.card-view) .deck-card-editor-item.preview-view .deck-card-editor-actions`
- **Positioning**:
  - **position**: `absolute`
  - **right**: `8px`
  - **bottom**: `8px`
  - **top/left**: `auto` (explicitly)
  - **transform**: `none` (explicitly)
- **Shade bump (subtle)**:
  - Tile View buttons sit on top of card art, so we apply a **small opacity increase** (not the heavy dark overlay) for readability.
  - **Target**: Reduce transparency by **~1/3** from the previous bump (equivalently, opacity scaled by **4/3**).
  - **White buttons** (`.quantity-btn`, `.remove-one-btn`, `.add-one-btn`, `.reserve-btn`): background `0.10 → 0.20` (hover `0.20 → 0.33`), border `0.20 → 0.33`
  - **Teal** (`.alternate-art-btn`): background `0.20 → 0.33` (hover `0.30 → 0.47`), border `0.30 → 0.47`
  - **Red** (`.ko-btn`): background `0.20 → 0.33` (hover `0.30 → 0.47`), border `0.30 → 0.47`
- **Tile background darkening**:
  - Deck Editor Tile View shows card art as a background image with a black dimming overlay (pseudo-element).
  - **Overlay opacity**: `rgba(0, 0, 0, 0.55)` (was `0.50`) — ~10% darker for readability/contrast.
  - **Selectors**: `.deck-card-editor-item.<type>-card::after` (characters, power, location, special, mission, event, aspect, teamwork, ally/basic/advanced universe, training).

```css
.deck-cards-editor:not(.list-view):not(.card-view) .deck-card-editor-item.preview-view .deck-card-editor-actions {
  position: absolute !important;
  right: 8px !important;
  bottom: 8px !important;
  top: auto !important;
  left: auto !important;
  transform: none !important;
}
```
- **Container**: `.deck-editor-search-container`
- **Margins**: `margin-top: 7px`, `margin-bottom: 0px` (minimal spacing)
- **Flex Properties**: `flex-shrink: 0`

### Divider Configuration
- **Default Position**: 67% deck pane / 33% available cards pane
- **CSS Flex Values**: `.deck-pane` = `flex: 2`, `.card-selector-pane` = `flex: 1`
- **Draggable**: Resizable divider with security checks for ownership
- **Min Width**: Card selector pane has `min-width: 0` and `overflow: hidden`

### Read-Only Mode Badges
- **Layout**: Badges are **left-aligned on a second line** under the deck title to keep the title width stable when toggling read-only mode.
- **Badges**:
  - **Limited/Legality badge**: `#deckTitleValidationBadge`
  - **Read-Only badge**: `#readOnlyBadge`
- **Container**: `.deck-title-with-validation` uses `flex-direction: column` and left alignment
- **Badges row**: `.deck-title-badges` with `display: flex`, `gap: 10px`, `flex-wrap: nowrap`
- **Badge Styling**: Content-based width (no fixed min-width)

- **Two-pane layout stability**:
  - Preview mode hides the Available Cards pane without changing deck padding (`body.preview-read-only-mode`).
  - True read-only mode (non-owner / `?readonly=true`) uses the same full-width layout (`body.forced-read-only-mode`).

### CSS Specificity Requirements
- **High Specificity**: Use `.modal-header .deck-editor-actions .action-btn.save-btn` for Save button
- **Important Declarations**: All button styling uses `!important` for proper override
- **Consistent Heights**: Both Save and Cancel buttons must have identical computed heights
- **Responsive Properties**: Maintain layout integrity across different screen sizes

## Interactive States

### Hover States
- **Cards**: Background change to `rgba(255, 215, 0, 0.2)` with gold border
- **Buttons**: Lighter gradient with `translateY(-1px)` transform
- **Links**: Color change to teal accent

### Focus States
- **Inputs**: Teal border with glow effect
- **Buttons**: Enhanced shadow and border
- **Cards**: Teal border with `rgba(78, 205, 196, 0.4)` glow

### Active States
- **Navigation**: Teal background with dark text
- **Buttons**: Pressed state with `translateY(0)`
- **Tabs**: Teal background with gold text

### Disabled States
- **Opacity**: `0.5` for disabled elements
- **Cursor**: `not-allowed` for disabled buttons
- **Colors**: Muted versions of normal states

## Responsive Design

**Authoritative mobile roadmap and architecture:** [`/MOBILE_DESIGN.md`](/MOBILE_DESIGN.md) (repo root). **Agent-oriented implementation notes** for the current global header (2×2 grid, dropdown width, logo column) and DBV **All** tab live in **MOBILE_DESIGN §10**.

### Breakpoints
- **Client layout mode (authoritative):** **`max-width: 900px`** → `<html>` gets **`layout-mobile`** (stacked shell, `mobile-layout.css`); **`min-width: 901px`** → **`layout-desktop`**. This matches the former “tablet” upper bound so **769–900px** does not use the wide desktop header (which overlapped DB tabs and nav actions).
- **Legacy / misc `@media`:** Some older rules still use **`768px`** or other values; prefer **`--layout-mobile-max`** / `LAYOUT_MOBILE_MAX_PX` for anything tied to the **same** shell as `layout-mode.js`.

### Mobile layout mode (`layout-mobile` / `layout-desktop`)

- **Mechanism:** [`public/js/layout-mode.js`](/public/js/layout-mode.js) runs early in [`public/index.html`](/public/index.html) and sets **`layout-mobile`** or **`layout-desktop`** on `<html>` using **`window.matchMedia('(max-width: 900px)')`**, not User-Agent sniffing.
- **Override:** `localStorage.setItem('preferDesktopLayout','1')` forces desktop layout on narrow viewports; remove the key to restore breakpoint behavior. API: `window.setPreferDesktopLayout(true|false)`.
- **Styles:** [`public/css/mobile-layout.css`](/public/css/mobile-layout.css) — rules are scoped under **`.layout-mobile`** so desktop layout is unchanged.
- **CSS token:** `:root { --layout-mobile-max: 900px; }` in `mobile-layout.css` (keep in sync with `LAYOUT_MOBILE_MAX_PX` in JS).

### Mobile Adaptations (current direction)

- **Deck editor:** Under `.layout-mobile`, deck panes **stack vertically**; resizable divider hidden; list view **stacks** the two deck columns (single-column reading flow). Full parity with STYLE_GUIDE “single column deck builder” is **incremental** — see `MOBILE_DESIGN.md` milestones.
- **Stacked Navigation (M1):** Under `.layout-mobile`, **[`.header-nav-cluster`](/public/components/globalNav.html)** groups **`.header-center`** (2×2 button grid) and **`.header-right`** (welcome / account row). **`.user-menu-toggle`** uses **`justify-content: flex-end`** so the greeting and ▶ sit on the **right**, aligned with the **Collection** / **+ Deck** column. **`.unified-header`** is a **horizontal** flex row: **logo** on the **left** (~**30.4%** width, capped **134px**, ~**20%** smaller than the prior **168px** cap), cluster **fills the rest**. **`.header-app-actions`** uses **`display: grid`** **`1fr 1fr`** × **`minmax(44px,1fr)`** twice; **`.app-tabs`** uses **`display: contents`** so **Card Database** | **Collection** sit on **row 1**, **Deck Builder** | **+ Deck** on **row 2** (explicit **`#databaseViewBtn`** / **`#collectionViewBtn`** / **`#deckBuilderBtn`** / **`#newDeckBtn`** placement). **`.app-tab-button`** and **`.new-deck-btn`** share the same **min-height**, **padding**, and **font-size** so all four cells match. Logged-out users: [`syncHeaderCollectionLayout`](/public/components/globalNav.js) adds **`.collection-tab-hidden`** so **Card Database** spans the top row when Collection is hidden. Implemented in [`public/css/mobile-layout.css`](/public/css/mobile-layout.css). Desktop: **`.header-nav-cluster`** is **`display: contents`** in [`public/components/globalNav.css`](/public/components/globalNav.css) so the existing centered-tabs + **`.header-right`** layout is unchanged. Legacy **`@media (max-width: 900px)`** in `globalNav.css` still applies when **`layout-desktop`** is active at narrow widths.
- **Touch Targets:** Minimum **44px** for interactive controls; utility **`.touch-target-min`** in `mobile-layout.css` (apply where controls are still small).
- **Card database (M2c, `.layout-mobile`):** Rules live in [`public/css/mobile-layout.css`](/public/css/mobile-layout.css) under the **Card database** and **Characters tab — card rows** sections.
  - **Shell:** `#database-view.database-section` uses tighter horizontal padding; **`.stats`** is a two-column grid; **`.tab-container`** is **`max-width: 732px`** centered (`margin: auto`) so database tab buttons do not grow wider between **769–900px** than they would at a **768px** viewport (same inner width after shell padding). Under `.layout-mobile`, **`.tab-container`** uses **`align-items: stretch`** (overriding desktop **`center`**) so both **`.tab-row`** bands share the same full width—otherwise each row shrink-wraps and paired buttons misalign between rows. **`.tab-row`** is **`width: 100%`** with **`justify-content: flex-start`**. **`.tab-button`** is at least **44px** tall, `flex: 1 1 calc(50% - 4px)` for a two-up wrap inside that cap. The **All** tab (**`[data-tab="all-cards"]`**) uses **`flex: 0 0 100%`** so it spans the full row; other tabs stay two per row.
  - **All tab (card tiles):** **`#all-cards-grid-container`** has **no** inline grid column count in [`public/index.html`](/public/index.html) (column layout comes from [`public/css/database-view.css`](/public/css/database-view.css) breakpoints). At **`max-width: 900px`**, the grid is a **single column** (`minmax(0, 1fr)`). Under **`.layout-mobile`** on wider viewports, **`mobile-layout.css`** keeps the same **one card per row** for the All tab. Inside each **`.all-cards-cell`**, **`.card-content-bottom`** is a **two-column CSS grid**: **+Deck** spans the first action row; **-Collection** and **+Collection** share the second row (left and right), matching the requested order despite DOM order in [`public/js/all-cards-display.js`](/public/js/all-cards-display.js).
  - **Controls:** `.search-input`, `.header-filter`, `.filter-input`, `.clear-filters-btn`, `.add-to-deck-btn` / collection buttons, `.power-type-filter-toggle` / `.function-filter-toggle`, and inherent-ability `.ability-toggle` / `.toggle-label` meet or approach **44px** touch targets.
  - **Wide filters:** Advanced Universe `card_effect`, Locations `special_ability`, and Events `game_effect` header filters use **width/max-width 100%** under `.layout-mobile` (overrides `card-tables.css` fixed widths).
  - **Missions / Special:** `#missions-table` mission-set and game-effect cells and `#missions-table .checkbox-group` min-widths are relaxed; `#special-cards-table` column 2 `min-width` cleared for scroll.
  - **Characters table:** `thead` first row is **visually hidden** (screen-reader clipping); **`.filter-row`** stacks full-width; **`tbody tr`** are card blocks (`background`, `border-radius` ~10px). Each **`td`** has **`data-label`** (set in `displayCharacters` in `card-display.js`) for mobile **::before** labels; image cell has no label pseudo-element; **Deck & collection** column stacks full-width buttons. **Desktop** row height locks in `card-display.js` are skipped when `isLayoutMobile()`; **`layout-mode-change`** clears or refreshes locks.
  - **Collection (unchanged here):** Existing `.layout-mobile` collection checkbox scaling remains separate from DBV.

### Tablet Adaptations
- **Flexible Grids**: Auto-fit columns with minimum widths
- **Adjusted Spacing**: Reduced padding and margins
- **Responsive Images**: Max-width constraints

## Accessibility

### Color Contrast
- **Text on Dark**: White text on dark backgrounds meets WCAG AA standards
- **Text on Light**: Dark text on light backgrounds for readability
- **Focus Indicators**: High contrast teal borders for keyboard navigation

### Interactive Elements
- **Minimum Touch Targets**: 44px minimum for mobile
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper alt text and ARIA labels

## Implementation Notes

### CSS Custom Properties
Consider implementing CSS custom properties for easier theme management:

```css
:root {
  --primary-teal: #4ecdc4;        /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #4ecdc4; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --secondary-teal: #2cb1a6;      /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #2cb1a6; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --gold: #ffd700;                /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #ffd700; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --red-accent: #ff6b6b;          /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #ff6b6b; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --dark-bg: #1a1a2e;             /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #1a1a2e; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --card-bg: rgba(52, 73, 94, 0.8); /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #34495e; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --text-primary: #ffffff;        /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #ffffff; border: 1px solid #ccc; vertical-align: middle;"></span> */
  --text-secondary: #bdc3c7;      /* <span style="display: inline-block; width: 16px; height: 16px; background-color: #bdc3c7; border: 1px solid #ccc; vertical-align: middle;"></span> */
}
```

### Z-Index Management
- **Global Navigation**: `9999`
- **Modals**: `1000`
- **Header**: `100`
- **Cards**: `10`

### Animation Guidelines
- **Transitions**: `0.2s ease` for most interactions
- **Hover Effects**: `translateY(-1px)` for lift effect
- **Loading States**: Smooth opacity transitions
- **Modal Animations**: `slideIn` keyframes for notifications

---

*This style guide should be updated as the application evolves and new components are added.*

## Global Navigation

### Structure
- **Components**: Logo (left), navigation links/tabs (center/left), user menu and status (right)
- **Z-Index**: `9999` to ensure nav, dropdowns, and tooltips always render above page content
- **Stacking Context**: Create a new stacking context on the nav container to avoid overlap issues with modals/content

### Layout
- **Container**: Full-width bar pinned to the top
- **Height**: 56–64px depending on content
- **Padding**: `0 16px`
- **Display**: `flex`; `align-items: center`; `justify-content: space-between`

### Mobile layout mode (`.layout-mobile`, max-width 900px)
- **Location**: [`public/css/mobile-layout.css`](/public/css/mobile-layout.css) — selectors prefixed with `.layout-mobile .unified-header`, `.header-center`, `.app-tabs`, `.user-menu`, etc.
- **Header**: **`unified-header`** is a **row** (logo left, **`.header-nav-cluster`** right); **`height: auto`** so the bar can grow with the 2×2 grid and welcome row.
- **Tab bar**: `.header-center` is **`position: static`** (overrides desktop absolute centering) so the grid does not overlap the logo or the right cluster.
- **Primary controls**: `.app-tab-button`, `.new-deck-btn`, and `.user-menu-toggle` use **`min-height: 44px`** (and tab **`min-width: 44px`**) with slightly increased padding; **`.user-menu-toggle`** is **`justify-content: flex-end`** (right-aligned under the 2×2 grid).
- **User menu dropdown**: **`width` / `max-width: 50%`**, **`left: auto; right: 0`** (right-aligned under the toggle, half the **`.user-menu`** width; overrides desktop **`min-width: 260px`** via **`min-width: 0`**).
- **Logo**: `.header-left` caps at **`max-width: 134px`** (**~20%** smaller than the previous **168px**); **`align-items: flex-start`** so the mark is not vertically centered in the tall column (which looked like padding above the logo). **`.unified-header`** uses **`padding-top: 0`**. `.header-logo` uses **`width: 100%`** / **`max-width: 100%`** (**`margin-top: 0`**).

### Colors
- **Background**: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`
- **Borders/Dividers**: `1px solid rgba(255, 255, 255, 0.2)` at bottom edge
- **Primary Accent (active/hover)**: `#4ecdc4`
- **Inactive Link**: `#bdc3c7`
- **Notification/Badge**: Limited badge color `#d2b48c` on dark base

### Links & Tabs
- **Default**: `color: #bdc3c7`
- **Active**: `color: #4ecdc4`; underline or bottom border with `rgba(78, 205, 196, 0.4)`
- **Hover**: Lighter teal text with subtle glow `text-shadow: 0 0 4px rgba(78, 205, 196, 0.35)`

### Dropdowns & Tooltips
- **Z-Index**: `9999` (must be above main content)
- **Background**: `rgba(0,0,0,0.9)` or nav gradient
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Shadow**: `0 10px 24px rgba(0, 0, 0, 0.45)`
- **Spacing**: Minimum 8px from trigger; pointer caret optional

### Buttons in Global Nav
- **Style**: Match page buttons (primary teal treatment) or limited-badge style for special actions
- **Sizing**: `28px` min-height; `white-space: nowrap`
- **Interaction**: Hover teal brighten; active press state with reduced translateY

### Accessibility
- **Contrast**: All nav text must meet WCAG AA on dark gradient
- **Focus**: Visible teal focus ring `0 0 0 2px rgba(78, 205, 196, 0.5)`
- **Hit Area**: Minimum 44px height for interactive items

## View Transitions and Modal Fade

### Overview
View switches and modal open/close use smooth opacity transitions to eliminate visible flash when moving between deck selection, deck editor, and database views.

### Deck Editor Modal Fade
- **Location**: `#deckEditorModal` in [public/css/deck-background.css](public/css/deck-background.css)
- **Transition**: `opacity 150ms ease-out`, `visibility 150ms`
- **Classes**: `.modal-visible` (opacity 1), `.modal-opening` (visibility visible, opacity 0 during fade-in setup)
- **JS**: Add `modal-visible` after setting `display: flex`; remove `modal-visible` to fade out; on `transitionend` set `display: none`

### View Switch Crossfade (Database / Deck Builder)
- **Location**: [public/css/index.css](public/css/index.css), [public/components/globalNav.js](public/components/globalNav.js)
- **Layout**: `#mainContainer` uses CSS Grid (`grid-template-rows: auto 1fr`) so `#database-view`, `#collection-view`, and `#deck-builder` overlap in row 2
- **Transition**: `opacity 100ms ease-out` on `#database-view` and `#deck-builder`
- **Classes**:
  - `.view-hidden`: opacity 0, pointer-events none (fading or hidden)
  - `.view-removed`: display none (fully removed from layout after transition)
- **Crossfade flow**: Both views kept in DOM during transition; outgoing gets `.view-hidden`, incoming gets `.view-hidden` removed via `requestAnimationFrame`; on `transitionend`, outgoing gets `.view-removed`

### CSS Selectors
```css
#database-view.view-hidden, #deck-builder.view-hidden, #collection-view.view-hidden {
    opacity: 0;
    pointer-events: none;
}
#database-view.view-removed, #deck-builder.view-removed, #collection-view.view-removed {
    display: none !important;
}
```

## Import/Export Button Styling

### Overview
Import and Export buttons are utility buttons in the deck editor available to all users (GUEST, USER, ADMIN) that share identical styling for visual consistency.

### Grid Layout
- **Container**: `.deck-editor-actions` with `display: grid`
- **Grid Template**: `grid-template-columns: 88px 88px`, `grid-template-rows: 24.5px 24.5px`
- **Gap**: `8px 6px` between grid items
- **Export Button**: `grid-column: 1`, `grid-row: 1` (top-left)
- **Import Button**: `grid-column: 1`, `grid-row: 2` (bottom-left)

### Shared Styling
Both buttons use identical visual styling:

#### Base Properties
- **Background**: `rgba(78, 205, 196, 0.2)` (teal with 20% opacity - matches Draw Hand/List View)
- **Text Color**: `#4ecdc4` (bright teal - matches Draw Hand/List View)
- **Border**: `1px solid rgba(78, 205, 196, 0.3)` (teal border with 30% opacity - matches Draw Hand/List View)
- **Height**: `auto` with `min-height: 24px`
- **Padding**: `4px 8px`
- **Width**: `100%` of grid cell
- **Box Sizing**: `border-box`
- **Border Radius**: `4px`
- **Font**: `12px`, `500` weight
- **Cursor**: `pointer`

#### Visual Effects
- **Transition**: `background-color 0.2s ease, border-color 0.2s ease`

#### Hover States
- **Background**: `rgba(78, 205, 196, 0.3)` (teal with 30% opacity - matches Draw Hand/List View hover)
- **Border**: `rgba(78, 205, 196, 0.4)` (teal border with 40% opacity - matches Draw Hand/List View hover)

### CSS Selectors
```css
/* Export Button */
.deck-editor-actions #exportBtn {
    grid-column: 1 !important;
    grid-row: 1 !important;
    background: rgba(78, 205, 196, 0.2) !important; /* teal - matches Draw Hand/List View */
    color: #4ecdc4 !important; /* bright teal - matches Draw Hand/List View */
    border: 1px solid rgba(78, 205, 196, 0.3) !important; /* teal border - matches Draw Hand/List View */
    /* ... other properties ... */
}

/* Import Button */
.deck-editor-actions #importBtn {
    grid-column: 1 !important;
    grid-row: 2 !important;
    background: rgba(78, 205, 196, 0.2) !important; /* teal - matches Draw Hand/List View */
    color: #4ecdc4 !important; /* bright teal - matches Draw Hand/List View */
    border: 1px solid rgba(78, 205, 196, 0.3) !important; /* teal border - matches Draw Hand/List View */
    /* ... other properties ... */
}
```

### Visibility Control
- **All Users**: Both buttons are hidden by default (`display: none`)
- **Show Logic**: JavaScript shows buttons for all users (GUEST, USER, ADMIN) when the deck editor is opened
- **Display**: Set to `inline-block` when visible

## One Per Deck Card Dimming

### Overview
Cards marked with `one_per_deck=TRUE` in the database receive visual dimming when added to a deck, preventing multiple copies from being selected.

### Visual Dimming System
When a "One Per Deck" card is added to the deck, all available cards of that type with `one_per_deck=TRUE` are visually dimmed to indicate they cannot be selected again.

#### Dimmed State Styling
- **CSS Class**: `.disabled` applied to card elements
- **Opacity**: `0.5` (50% transparency)
- **Cursor**: `not-allowed` (indicates non-interactive)
- **Draggable**: Set to `false` (prevents drag operations)
- **Tooltip**: Shows "One Per Deck - already in deck" or "One Per Deck - limit reached"

#### Implementation Details
- **Function**: `updateOnePerDeckLimitStatus()` in `public/index.html`

## One Per Deck Text Formatting

### Overview
The "One Per Deck" label in card effect text must be consistently formatted across all card types with bold styling and proper line breaks.

### Consistent Styling Rules
- **Bold Text**: "One Per Deck" must be displayed in **bold** using `<strong>` tags
- **Line Placement**: Must appear on its own line below the main card effect text
- **Spacing**: Two line breaks (`<br><br>`) separate the main effect from the "One Per Deck" label
- **HTML Encoding**: Properly decode HTML entities in card effect text

### Implementation by Card Type

#### Special Cards
- **Function**: `formatSpecialCardEffect()` in `public/js/card-display.js`
- **Keywords**: Handles multiple keywords including **Fortifications!**, **Cataclysm!**, **Assist!**, **Ambush!**, and **One Per Deck**
- **Order**: "One Per Deck" appears last in the keyword list

#### Advanced Universe Cards
- **Function**: `formatAdvancedUniverseCardEffect()` in `public/js/card-display-functions.js`
- **Keywords**: Handles **One Per Deck** keyword
- **Auto-detection**: Automatically adds "One Per Deck" label if `cardData.is_one_per_deck === true`

#### Formatting Process
1. **HTML Entity Decoding**: Convert HTML entities to proper characters
2. **Keyword Detection**: Find special keywords in the text
3. **Text Separation**: Remove keywords from main text
4. **Keyword Formatting**: Convert `**keyword**` to `<strong>keyword</strong>`
5. **Final Assembly**: Combine main text + line breaks + formatted keywords

#### Example Output
```html
Main card effect text here.<br><br><strong>One Per Deck</strong>
```
- **Trigger**: Called after adding/removing cards and when displaying deck
- **Scope**: Affects all card types (characters, specials, powers, events, etc.)
- **Database Field**: Uses `one_per_deck` boolean column from card tables

### Card Type Coverage
The dimming system applies to ALL card types that have `one_per_deck=TRUE`:

#### Character Cards
- **Selector**: `.card-item[data-type="character"][data-id]`
- **Logic**: Dims when character limit (3) is reached OR when specific character is already in deck
- **Special Case**: Character cards also dim when deck has reached the 3-character limit

#### Special Cards
- **Selector**: `.card-item[data-type="special"][data-id]`
- **Logic**: Dims when the specific card is already in deck
- **Examples**: Grim Reaper, Universe: Advanced, Training, Teamwork

#### Power Cards
- **Selector**: `.card-item[data-type="power"][data-id]`
- **Logic**: Dims when the specific power card is already in deck
- **Examples**: Any-Power power cards, Universe power cards

#### Event Cards
- **Selector**: `.card-item[data-type="event"][data-id]`
- **Logic**: Dims when the specific event card is already in deck

#### Mission Cards
- **Selector**: `.card-item[data-type="mission"][data-id]`
- **Logic**: Dims when the specific mission card is already in deck

#### Location Cards
- **Selector**: `.card-item.location-card[data-type="location"][data-id]`
- **Logic**: Dims when location limit (1) is reached OR when this location (any alternate art) is already in deck
- **Data Attributes**: `data-location-ids` (comma-separated IDs for all alternate arts), `data-all-cards` (JSON for art modal)
- **Alternate Art UX**: Locations with multiple art variants display as a single table row (`groupCardsByVariant` with `mergeAcrossSets: true` in `card-display.js`): core **ERB** and promo **ERBP** alternate rows (same name, e.g. `alternate/…`) merge into one row with ‹ › art navigation; clicking + or the card opens the alternate art selection modal (same pattern as Characters)

### Visual State Management
#### Adding Cards
1. Card is added to `window.deckEditorCards` array
2. `updateOnePerDeckLimitStatus()` is called
3. All matching cards in available section are dimmed
4. Tooltips are updated to show limit status

#### Removing Cards
1. Card is removed from `window.deckEditorCards` array
2. `updateOnePerDeckLimitStatus()` is called
3. Previously dimmed cards are re-enabled
4. Tooltips are cleared or updated

#### Deck Display
1. `displayDeckCardsForEditing()` is called
2. `updateOnePerDeckLimitStatus()` is called at the end
3. Ensures dimming state is consistent with current deck contents

### CSS Implementation
```css
.card-item.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.card-item.disabled:hover {
    /* Maintain dimmed appearance on hover */
    opacity: 0.5 !important;
}
```

### JavaScript Integration
```javascript
function updateOnePerDeckLimitStatus() {
    // Get all one-per-deck cards currently in deck
    const onePerDeckCardsInDeck = new Set();
    window.deckEditorCards.forEach(card => {
        const cardData = window.availableCardsMap.get(card.cardId);
        if (cardData && cardData.one_per_deck === true) {
            onePerDeckCardsInDeck.add(card.cardId);
        }
    });

    // Update all card types for one-per-deck dimming
    const cardTypes = ['character', 'special', 'power', 'event', 'mission'];
    cardTypes.forEach(cardType => {
        const cardItems = document.querySelectorAll(`.card-item[data-type="${cardType}"][data-id]`);
        cardItems.forEach(cardElement => {
            const cardId = cardElement.getAttribute('data-id');
            if (cardId) {
                const cardData = window.availableCardsMap.get(cardId);
                const isOnePerDeck = cardData && cardData.one_per_deck === true;
                const isInDeck = onePerDeckCardsInDeck.has(cardId);

                if (isOnePerDeck && isInDeck) {
                    cardElement.classList.add('disabled');
                    cardElement.setAttribute('draggable', 'false');
                    cardElement.title = 'One Per Deck - already in deck';
                } else if (isOnePerDeck && !isInDeck) {
                    cardElement.classList.remove('disabled');
                    cardElement.setAttribute('draggable', 'true');
                    cardElement.title = '';
                }
            }
        });
    });
}
```

### User Experience
- **Immediate Feedback**: Cards dim instantly when added to deck
- **Clear Indication**: Dimmed cards are visually distinct and non-interactive
- **Informative Tooltips**: Hover text explains why card cannot be selected
- **Consistent Behavior**: Same dimming pattern across all card types
- **Reversible**: Cards become available again when removed from deck

### Integration Points
- **Backend Validation**: API prevents adding multiple one-per-deck cards
- **Frontend Validation**: UI prevents selection of dimmed cards
- **Toast Notifications**: Error messages when attempting to add duplicates
- **Deck Statistics**: One-per-deck cards count toward deck limits appropriately

## Cataclysm Card Dimming

### Overview
Special cards marked with `cataclysm=TRUE` in the database receive visual dimming when added to a deck, enforcing the "one cataclysm per deck" rule.

### Visual Dimming System
When a "Cataclysm" card is added to the deck, all available special cards with `cataclysm=TRUE` are visually dimmed to indicate they cannot be selected again.

#### Dimmed State Styling
- **CSS Class**: `.disabled` applied to card elements
- **Opacity**: `0.5` (50% transparency)
- **Cursor**: `not-allowed` (indicates non-interactive)
- **Draggable**: Set to `false` (prevents drag operations)
- **Tooltip**: Shows "Cataclysm - already in deck" or "Cataclysm - another cataclysm already selected"

#### Implementation Details
- **Function**: `updateCataclysmLimitStatus()` in `public/index.html`
- **Trigger**: Called after adding/removing cards and when displaying deck
- **Scope**: Affects only special cards with `cataclysm=TRUE`
- **Database Field**: Uses `cataclysm` boolean column from special_cards table

### Cataclysm Card Examples
The following special cards are marked as cataclysm cards:
- **Heimdall**: Any Character may avoid 1 attack made with a Special card
- **Lady of the Lake**: Draw three cards, discard duplicates
- **Robin Hood: Master Thief**: Discard one Special card to draw and reveal 4 cards
- **Tunupa: Mountain God**: Acts as level 10 MultiPower attack
- **Fairy Protection**: Any Character may avoid 1 attack, may not be attacked for remainder of battle
- **Loki**: Opponent is -3 to Venture Total, must reveal hand and play open handed

### Visual State Management
#### Adding Cards
1. Card is added to `window.deckEditorCards` array
2. `updateCataclysmLimitStatus()` is called
3. All cataclysm cards in available section are dimmed
4. Tooltips are updated to show limit status

#### Removing Cards
1. Card is removed from `window.deckEditorCards` array
2. `updateCataclysmLimitStatus()` is called
3. Previously dimmed cataclysm cards are re-enabled
4. Tooltips are cleared or updated

#### Deck Display
1. `displayDeckCardsForEditing()` is called
2. `updateCataclysmLimitStatus()` is called at the end
3. Ensures dimming state is consistent with current deck contents

### CSS Implementation
```css
.card-item.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.card-item.disabled:hover {
    /* Maintain dimmed appearance on hover */
    opacity: 0.5 !important;
}
```

### JavaScript Integration
```javascript
function updateCataclysmLimitStatus() {
    // Get all Cataclysm cards currently in the deck
    const cataclysmCardsInDeck = new Set();
    window.deckEditorCards.forEach(card => {
        const cardData = window.availableCardsMap.get(card.cardId);
        if (cardData && cardData.is_cataclysm === true) {
            cataclysmCardsInDeck.add(card.cardId);
        }
    });
    
    // Update all special card items for cataclysm dimming
    const specialCardItems = document.querySelectorAll('.card-item[data-type="special"][data-id]');
    specialCardItems.forEach(cardElement => {
        const cardId = cardElement.getAttribute('data-id');
        
        if (cardId) {
            const cardData = window.availableCardsMap.get(cardId);
            const isCataclysm = cardData && cardData.is_cataclysm === true;
            const isInDeck = cataclysmCardsInDeck.has(cardId);
            const hasOtherCataclysm = cataclysmCardsInDeck.size > 0;
            
            if (isCataclysm && (isInDeck || hasOtherCataclysm)) {
                // This is a Cataclysm card and either it's in the deck or another cataclysm is in the deck - dim it
                cardElement.classList.add('disabled');
                cardElement.setAttribute('draggable', 'false');
                if (isInDeck) {
                    cardElement.title = 'Cataclysm - already in deck';
                } else {
                    cardElement.title = 'Cataclysm - another cataclysm already selected';
                }
            } else if (isCataclysm && !hasOtherCataclysm) {
                // This is a Cataclysm card but no cataclysm is in the deck - enable it
                cardElement.classList.remove('disabled');
                cardElement.setAttribute('draggable', 'true');
                cardElement.title = '';
            }
        }
    });
}
```

### Backend Validation
- **API Endpoint**: `/api/decks/:id/cards` (POST)
- **Validation Function**: `checkIfCardIsCataclysm()` in `src/index.ts`
- **Error Message**: "Cannot add more than 1 Cataclysm to a deck"
- **Database Query**: Checks `cataclysm` column in `special_cards` table

### Integration Points
- **Card Addition**: Called after `addCardToEditor()`
- **Card Removal**: Called after `removeCardFromEditor()`
- **Deck Display**: Called after `displayDeckCardsForEditing()`
- **Filter Updates**: Called after `updateSpecialCardsFilter()`

### Testing Coverage
- **Unit Tests**: `tests/unit/cataclysm-validation.test.ts`
- **Integration Tests**: `tests/unit/cataclysm-integration.test.ts`
- **Test Scenarios**: Adding/removing cataclysm cards, multiple cataclysm handling, visual state consistency

## Assist Card Dimming

### Overview
Special cards marked with `assist=TRUE` in the database receive visual dimming when added to a deck, enforcing the "one assist per deck" rule.

### Visual Dimming System
When an "Assist" card is added to the deck, all available special cards with `assist=TRUE` are visually dimmed to indicate they cannot be selected again.

#### Dimmed State Styling
- **CSS Class**: `.disabled` applied to card elements
- **Opacity**: `0.5` (50% transparency)
- **Cursor**: `not-allowed` (indicates non-interactive)
- **Draggable**: Set to `false` (prevents drag operations)
- **Tooltip**: Shows "Assist - already in deck" or "Assist - another assist already selected"

#### Implementation Details
- **Function**: `updateAssistLimitStatus()` in `public/index.html`
- **Trigger**: Called after adding/removing cards and when displaying deck
- **Scope**: Affects only special cards with `assist=TRUE`
- **Database Field**: Uses `assist` boolean column from special_cards table

### Assist Card Examples
The following special cards are marked as assist cards:
- **Teamwork**: Any Character may assist another Character in battle
- **Alliance**: Characters may share abilities and work together
- **Support**: Provides assistance to any Character in the deck
- **Cooperation**: Enables Character collaboration and mutual support
- **Unity**: Strengthens Character bonds and teamwork abilities

### Visual State Management
#### Adding Cards
1. Card is added to `window.deckEditorCards` array
2. `updateAssistLimitStatus()` is called
3. All assist cards in available section are dimmed
4. Tooltips are updated to show limit status

#### Removing Cards
1. Card is removed from `window.deckEditorCards` array
2. `updateAssistLimitStatus()` is called
3. Previously dimmed assist cards are re-enabled
4. Tooltips are cleared or updated

#### Deck Display
1. `displayDeckCardsForEditing()` is called
2. `updateAssistLimitStatus()` is called at the end
3. Ensures dimming state is consistent with current deck contents

### CSS Implementation
```css
.card-item.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.card-item.disabled:hover {
    /* Maintain dimmed appearance on hover */
    opacity: 0.5 !important;
}
```

### JavaScript Integration
```javascript
function updateAssistLimitStatus() {
    // Get all Assist cards currently in the deck
    const assistCardsInDeck = new Set();
    window.deckEditorCards.forEach(card => {
        const cardData = window.availableCardsMap.get(card.cardId);
        if (cardData && cardData.is_assist === true) {
            assistCardsInDeck.add(card.cardId);
        }
    });

    // Update all special card items for assist dimming
    const specialCardItems = document.querySelectorAll('.card-item[data-type="special"][data-id]');
    specialCardItems.forEach(cardElement => {
        const cardId = cardElement.getAttribute('data-id');

        if (cardId) {
            const cardData = window.availableCardsMap.get(cardId);
            const isAssist = cardData && cardData.is_assist === true;
            const isInDeck = assistCardsInDeck.has(cardId);
            const hasOtherAssist = assistCardsInDeck.size > 0;

            if (isAssist && (isInDeck || hasOtherAssist)) {
                // This is an Assist card and either it's in the deck or another assist is in the deck - dim it
                cardElement.classList.add('disabled');
                cardElement.setAttribute('draggable', 'false');
                if (isInDeck) {
                    cardElement.title = 'Assist - already in deck';
                } else {
                    cardElement.title = 'Assist - another assist already selected';
                }
            } else if (isAssist && !hasOtherAssist) {
                // This is an Assist card but no assist is in the deck - enable it
                cardElement.classList.remove('disabled');
                cardElement.setAttribute('draggable', 'true');
                cardElement.title = '';
            }
        }
    });
}
```

### Backend Validation
- **API Endpoint**: `/api/decks/:id/cards` (POST)
- **Validation Function**: `checkIfCardIsAssist()` in `src/index.ts`
- **Error Message**: "Cannot add more than 1 Assist to a deck"
- **Database Query**: Checks `assist` column in `special_cards` table

### Integration Points
- **Card Addition**: Called after `addCardToEditor()`
- **Card Removal**: Called after `removeCardFromEditor()`
- **Deck Display**: Called after `displayDeckCardsForEditing()`
- **Filter Updates**: Called after `updateSpecialCardsFilter()`

### Testing Coverage
- **Unit Tests**: `tests/unit/assist-backend-validation.test.ts`
- **Integration Tests**: `tests/integration/assist-api-validation.test.ts`
- **Database Tests**: `tests/integration/assist-database-integration.test.ts`
- **Test Scenarios**: Adding/removing assist cards, multiple assist handling, visual state consistency

## Ambush Card Dimming

### Overview
Special cards marked with `ambush=TRUE` in the database receive visual dimming when added to a deck, enforcing the "one ambush per deck" rule.

### Visual Dimming System
When an "Ambush" card is added to the deck, all available special cards with `ambush=TRUE` are visually dimmed to indicate they cannot be selected again.

#### Dimmed State Styling
- **CSS Class**: `.disabled` applied to card elements
- **Opacity**: `0.5` (50% transparency)
- **Cursor**: `not-allowed` (indicates non-interactive)
- **Draggable**: Set to `false` (prevents drag operations)
- **Tooltip**: Shows "Ambush - already in deck" or "Ambush - another ambush already selected"

#### Implementation Details
- **Function**: `updateAmbushLimitStatus()` in `public/index.html`
- **Trigger**: Called after adding/removing cards and when displaying deck
- **Scope**: Affects only special cards with `ambush=TRUE`
- **Database Field**: Uses `ambush` boolean column from special_cards table

### Ambush Card Examples
The following special cards are marked as ambush cards:
- **Wrath of Ra**: Devastating attack that can be used as an ambush
- **Valkyrie Skeggjold**: Norse warrior ambush tactics
- **Oni and Succubus**: Demonic ambush combination
- **Bodhisattva: Enlightened One**: Spiritual ambush capabilities

### Visual State Management
#### Adding Cards
1. Card is added to `window.deckEditorCards` array
2. `updateAmbushLimitStatus()` is called
3. All ambush cards in available section are dimmed
4. Tooltips are updated to show limit status

#### Removing Cards
1. Card is removed from `window.deckEditorCards` array
2. `updateAmbushLimitStatus()` is called
3. Previously dimmed ambush cards are re-enabled
4. Tooltips are cleared or updated

#### Deck Display
1. `displayDeckCardsForEditing()` is called
2. `updateAmbushLimitStatus()` is called at the end
3. Ensures dimming state is consistent with current deck contents

### CSS Implementation
```css
.card-item.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.card-item.disabled:hover {
    /* Maintain dimmed appearance on hover */
    opacity: 0.5 !important;
}
```

### JavaScript Integration
```javascript
function updateAmbushLimitStatus() {
    // Get all Ambush cards currently in the deck
    const ambushCardsInDeck = new Set();
    window.deckEditorCards.forEach(card => {
        const cardData = window.availableCardsMap.get(card.cardId);
        if (cardData && cardData.is_ambush === true) {
            ambushCardsInDeck.add(card.cardId);
        }
    });
    
    // Update all special card items for ambush dimming
    const specialCardItems = document.querySelectorAll('.card-item[data-type="special"][data-id]');
    specialCardItems.forEach(cardElement => {
        const cardId = cardElement.getAttribute('data-id');
        
        if (cardId) {
            const cardData = window.availableCardsMap.get(cardId);
            const isAmbush = cardData && cardData.is_ambush === true;
            const isInDeck = ambushCardsInDeck.has(cardId);
            const hasOtherAmbush = ambushCardsInDeck.size > 0;
            
            if (isAmbush && (isInDeck || hasOtherAmbush)) {
                // This is an Ambush card and either it's in the deck or another ambush is in the deck - dim it
                cardElement.classList.add('disabled');
                cardElement.setAttribute('draggable', 'false');
                if (isInDeck) {
                    cardElement.title = 'Ambush - already in deck';
                } else {
                    cardElement.title = 'Ambush - another ambush already selected';
                }
            } else if (isAmbush && !hasOtherAmbush) {
                // This is an Ambush card but no ambush is in the deck - enable it
                cardElement.classList.remove('disabled');
                cardElement.setAttribute('draggable', 'true');
                cardElement.title = '';
            }
        }
    });
}
```

### Backend Validation
- **API Endpoint**: `/api/decks/:id/cards` (POST)
- **Validation Function**: `checkIfCardIsAmbush()` in `src/index.ts`
- **Error Message**: "Cannot add more than 1 Ambush to a deck"
- **Database Query**: Checks `ambush` column in `special_cards` table

### Integration Points
- **Card Addition**: Called after `addCardToEditor()`
- **Card Removal**: Called after `removeCardFromEditor()`
- **Deck Display**: Called after `displayDeckCardsForEditing()`
- **Filter Updates**: Called after `updateSpecialCardsFilter()`

### Testing Coverage
- **Unit Tests**: `tests/unit/ambush-backend-validation.test.ts`
- **Frontend Tests**: `tests/unit/ambush-frontend-validation.test.ts`
- **Test Scenarios**: Adding/removing ambush cards, multiple ambush handling, visual state consistency
```

## Fortification Card Dimming

### Overview
Aspect cards marked with `fortifications=TRUE` in the database receive visual dimming when added to a deck, enforcing the "one fortification per deck" rule.

### Visual Dimming System
When a "Fortification" card is added to the deck, all available aspect cards with `fortifications=TRUE` are visually dimmed to indicate they cannot be selected again.

#### Dimmed State Styling
- **CSS Class**: `.disabled` applied to card elements
- **Opacity**: `0.5` (50% transparency)
- **Cursor**: `not-allowed` (indicates non-interactive)
- **Draggable**: Set to `false` (prevents drag operations)
- **Tooltip**: Shows "Fortification - already in deck" or "Fortification - another fortification already selected"

#### Implementation Details
- **Function**: `updateFortificationLimitStatus()` in `public/index.html`
- **Trigger**: Called after adding/removing cards and when displaying deck
- **Scope**: Affects only aspect cards with `fortifications=TRUE`
- **Database Field**: Uses `fortifications` boolean column from aspects table

### Fortification Card Examples
The following aspect cards are marked as fortification cards:
- **Amaru: Dragon Legend**: Legendary dragon fortification
- **Mallku**: Ancient fortification guardian
- **Supay**: Underworld fortification spirit
- **Cheshire Cat**: Mystical fortification entity
- **Isis**: Divine fortification goddess

### Visual State Management
#### Adding Cards
1. Card is added to `window.deckEditorCards` array
2. `updateFortificationLimitStatus()` is called
3. All fortification cards in available section are dimmed
4. Tooltips are updated to show limit status

#### Removing Cards
1. Card is removed from `window.deckEditorCards` array
2. `updateFortificationLimitStatus()` is called
3. Previously dimmed fortification cards are re-enabled
4. Tooltips are cleared or updated

#### Deck Display
1. `displayDeckCardsForEditing()` is called
2. `updateFortificationLimitStatus()` is called at the end
3. Ensures dimming state is consistent with current deck contents

### CSS Implementation
```css
.card-item.disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
    pointer-events: none !important;
}

.card-item.disabled:hover {
    /* Maintain dimmed appearance on hover */
    opacity: 0.5 !important;
}
```

### JavaScript Integration
```javascript
function updateFortificationLimitStatus() {
    // Get all Fortification cards currently in the deck
    const fortificationCardsInDeck = new Set();
    window.deckEditorCards.forEach(card => {
        const cardData = window.availableCardsMap.get(card.cardId);
        if (cardData && cardData.is_fortification === true) {
            fortificationCardsInDeck.add(card.cardId);
        }
    });
    
    // Update all aspect card items for fortification dimming
    const aspectCardItems = document.querySelectorAll('.card-item[data-type="aspect"][data-id]');
    if (aspectCardItems && aspectCardItems.forEach) {
        aspectCardItems.forEach(cardElement => {
            const cardId = cardElement.getAttribute('data-id');
            
            if (cardId) {
                const cardData = window.availableCardsMap.get(cardId);
                const isFortification = cardData && cardData.is_fortification === true;
                const isInDeck = fortificationCardsInDeck.has(cardId);
                const hasOtherFortification = fortificationCardsInDeck.size > 0;
                
                if (isFortification && (isInDeck || hasOtherFortification)) {
                    // This is a Fortification card and either it's in the deck or another fortification is in the deck - dim it
                    cardElement.classList.add('disabled');
                    cardElement.setAttribute('draggable', 'false');
                    if (isInDeck) {
                        cardElement.title = 'Fortification - already in deck';
                    } else {
                        cardElement.title = 'Fortification - another fortification already selected';
                    }
                } else if (isFortification && !hasOtherFortification) {
                    // This is a Fortification card but no fortification is in the deck - enable it
                    cardElement.classList.remove('disabled');
                    cardElement.setAttribute('draggable', 'true');
                    cardElement.title = '';
                }
            }
        });
    }
}
```

### Backend Validation
- **API Endpoint**: `/api/decks/:id/cards` (POST)
- **Validation Function**: `checkIfCardIsFortification()` in `src/index.ts`
- **Error Message**: "Cannot add more than 1 Fortification to a deck"
- **Database Query**: Checks `fortifications` column in `aspects` table

### Integration Points
- **Card Addition**: Called after `addCardToEditor()`
- **Card Removal**: Called after `removeCardFromEditor()`
- **Deck Display**: Called after `displayDeckCardsForEditing()`
- **Filter Updates**: Called after `updateAspectCardsFilter()`

### Testing Coverage
- **Unit Tests**: `tests/unit/fortification-backend-validation.test.ts`
- **Frontend Tests**: `tests/unit/fortification-frontend-validation.test.ts`
- **Test Scenarios**: Adding/removing fortification cards, multiple fortification handling, visual state consistency

## Pre-Placed Button Styling (Spartan Training Ground)

### Overview
The "Pre-Placed" button appears below Training cards in Card View when the "Spartan Training Ground" location is selected in the deck. It allows users to mark Training cards as excluded from the Draw Hand feature, representing cards that are pre-placed under Spartan Training Ground at game start.

### Button Appearance
- **Text**: "Pre-Placed"
- **Color Scheme**: Info Blue (#48dbfb) - matches the application's info/status color palette
- **Location**: Below Training cards in Card View, alongside quantity buttons (-1, +1)

### Base Styling (`.draw-training-btn`)
- **Background**: `rgba(72, 219, 251, 0.2)` (Info Blue with 20% opacity)
- **Text Color**: `#48dbfb` (Info Blue)
- **Border**: `1px solid rgba(72, 219, 251, 0.3)` (Info Blue with 30% opacity)
- **Border Radius**: `3.3px`
- **Padding**: `3.3px 6.6px`
- **Font Size**: `11px`
- **Font Family**: `monospace` (matches quantity buttons)
- **Font Weight**: `normal` (400)
- **Cursor**: `pointer`
- **Transition**: `all 0.3s ease`
- **Text Align**: `center`
- **Box Sizing**: `border-box`
- **Line Height**: `1`

### Hover State
- **Background**: `rgba(72, 219, 251, 0.3)` (Info Blue with 30% opacity)
- **Border Color**: `rgba(72, 219, 251, 0.5)` (Info Blue with 50% opacity)

### Active State (`.draw-training-btn.active`)
When a Training card is marked as Pre-Placed (excluded from Draw Hand), the button shows a dimmed appearance similar to KO and reserve buttons:

- **Background**: `rgba(72, 219, 251, 0.15)` (Info Blue with 15% opacity - dimmed)
- **Border Color**: `rgba(72, 219, 251, 0.25)` (Info Blue with 25% opacity - dimmed)
- **Text Color**: `rgba(72, 219, 251, 0.6)` (Info Blue with 60% opacity - dimmed)
- **Opacity**: `0.7` (overall dimming effect)
- **Visual Effect**: Muted, dimmed appearance indicating the card is excluded

### Active Hover State
- **Background**: `rgba(72, 219, 251, 0.2)` (slightly brighter but still dimmed)
- **Border Color**: `rgba(72, 219, 251, 0.3)` (slightly brighter but still dimmed)
- **Text Color**: `rgba(72, 219, 251, 0.7)` (slightly brighter but still dimmed)

### CSS Implementation
```css
/* Draw Training button styling - Blue button for Spartan Training Ground */
.draw-training-btn {
    background: rgba(72, 219, 251, 0.2);
    color: #48dbfb;
    border: 1px solid rgba(72, 219, 251, 0.3);
    border-radius: 3.3px;
    padding: 3.3px 6.6px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-family: monospace;
    box-sizing: border-box;
    line-height: 1;
}

.draw-training-btn:hover {
    background: rgba(72, 219, 251, 0.3);
    border-color: rgba(72, 219, 251, 0.5);
}

/* Dimmed state when Pre-Placed is active (similar to KO and reserve buttons) */
.draw-training-btn.active {
    background: rgba(72, 219, 251, 0.15);
    border-color: rgba(72, 219, 251, 0.25);
    color: rgba(72, 219, 251, 0.6);
    opacity: 0.7;
}

.draw-training-btn.active:hover {
    background: rgba(72, 219, 251, 0.2);
    border-color: rgba(72, 219, 251, 0.3);
    color: rgba(72, 219, 251, 0.7);
}
```

### Visual Consistency
- **Matches Quantity Buttons**: Same font family (monospace), similar sizing and padding
- **Matches Active States**: Dimmed appearance similar to `.ko-btn.active` and `.reserve-btn.active`
- **Color Consistency**: Uses Info Blue (#48dbfb) from the application's status color palette
- **Interaction Pattern**: Toggle behavior similar to other deck editor buttons

### Usage Context
- **Conditional Display**: Only appears when:
  - Card type is "training"
  - "Spartan Training Ground" location is in the deck
  - View mode is Card View
- **Functionality**: Toggles `exclude_from_draw` flag on the card
- **Persistence**: Flag is saved to database and persists across sessions
- **Effect**: Excluded cards are not included in Draw Hand random selection

## Deck Editor Card View Styling

### Overview
The Card View is a deck visualization mode available to all users that displays cards in a unique card-centric layout with actual card images as the primary interface elements.

### Container Styling
- **Main Container**: `.deck-cards-editor.card-view`
- **Background**: `rgba(255, 255, 255, 0.05)` (standard secondary background)
- **Padding**: `20px`
- **Layout**: `display: flex !important` with `flex-direction: column !important`
- **Width**: `100%` with `min-width: 100%`
- **Box Sizing**: `border-box` for all child elements

### Card Item Styling
#### Portrait Cards (Default)
- **Container**: `.deck-card-card-view-item`
- **Dimensions**: `175px × 250px` (7:10 aspect ratio)
- **Background**: `rgba(255, 255, 255, 0.1)`
- **Border**: `1px solid rgba(255, 255, 255, 0.2)` (standard primary border)
- **Border Radius**: `8px`
- **Layout**: `display: flex`, `flex-direction: column`, `align-items: center`
- **Transition**: `all 0.2s ease`
- **Position**: `relative` (for absolute positioning of buttons)

#### Landscape Cards (only character, location, event) — reusable layout
- **Target Types**: `[data-type="character"]`, `[data-type="location"]`, `[data-type="event"]` (also `data-orientation="landscape"` set by JS). Same CSS pattern for all three; only wrap height differs.
- **Orientation rule**: Character, location, and event are the only landscape types; all other card types are portrait. Do not add new landscape types without updating this rule.
- **Dimensions**: Character `250px × 184px`, location `250px × 160px`, event `250px × 160px` (wrap height 184px / 160px / 160px).
- **No visible frame:** Card item and `.card-foil-img-wrap` use `border: none`, `background: transparent`, `outline: none`, `box-shadow: none` so only the image and buttons are visible. Do not add border or background to landscape item or wrap.
- **Image fills frame, bevelled corners:** Images have `width/height 100%`, `margin/padding/border 0`, `border-radius: 8px` so the art fills the wrap and corners are rounded. `.card-foil-img-wrap` has `border-radius: 8px`, `overflow: hidden`.
- **Buttons below:** `.card-view-actions` in flow with `padding: 8px`. Hover: teal glow on wrap only (`box-shadow`), no border/background on item.
- **Reference:** Full pattern and "do not regress" notes: [DECK_EDITOR_CARD_VIEW_LAYOUT.md](DECK_EDITOR_CARD_VIEW_LAYOUT.md).

### Hover Effects
- **Background**: `rgba(78, 205, 196, 0.2)` (teal highlight)
- **Border**: `#4ecdc4` (solid teal)
- **Transform**: `translateY(-2px)` (lift effect)
- **Box Shadow**: `0 4px 12px rgba(0, 0, 0, 0.3)` (depth shadow)

### Card Images
#### Progressive image load (two-layer, no flash)
For character, location, and mission we show a thumbnail first, then fade in full-res over it so there is no visible flash. Two layers: `.card-view-image-thumb` (thumbnail, `src` never changed) and `.card-view-image-full` (opacity 0 → 1 via `.card-view-image-full--loaded` when full-res loads). Implemented in `deck-editor-rendering.js` and `deck-editor-card-view.css`; see [DECK_EDITOR_IMAGE_LOADING.md](DECK_EDITOR_IMAGE_LOADING.md). Card view uses the same aspect ratio per type as the thumb config so thumb and full-res share the same crop box (no shift). **Location** thumbnails are generated with **`contain`** (see `generateCardThumbnails.ts`) so the thumb layer is not pre-cropped before full-res loads. The **card hover modal** (`.card-hover-modal`) uses `object-fit: contain` on images; for `data-card-type="location"` and `"event"`, `.card-hover-image` allows **`max-width: 480px`** (vs `345px` default) so wide landscape art uses the horizontal modal footprint better.

#### Portrait Image Styling
- **Class**: `.card-view-image` (portrait cards)
- **Width**: `115%` (15% larger than container)
- **Height**: `100%` (fills entire frame)
- **Margins**: `-7.5%` left/right (centers larger image)
- **Object Fit**: `cover`
- **Object Position**: `center top`
- **Border Radius**: `6px`

#### Landscape Image Styling
- **Fill and bevelled corners:** `width: 100%`, `height: 100%`, `margin: 0`, `padding: 0`, `border: none`, `border-radius: 8px` so the image fills the wrap edge-to-edge with rounded corners (no inner frame).
- **Object fit:** Character: `object-fit: cover`, `object-position: center top`. Location and event: `object-fit: contain`, `object-position: center center` so the full card (including bottom text) is visible and not clipped.
- **Actions**: In a row below the image; `.card-view-actions` has `padding: 8px`. Card item and wrap have no border/background.

### Action Buttons
#### Button Container
- **Class**: `.card-view-actions`
- **Layout**: `display: flex`, `flex-direction: row`
- **Gap**: `6px` between buttons
- **Alignment**: `justify-content: center`
- **Margin Top**: `auto` (pushes to bottom)

#### Portrait Card Button Positioning
- **Position**: `absolute`
- **Bottom**: `-27px` (outside card frame)
- **Left**: `50%` with `transform: translateX(-50%)` (centered)

#### Button Styling
- **Base Class**: `.card-view-btn`
- **Background**: `rgba(78, 205, 196, 0.2)` (teal)
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Color**: `#4ecdc4` (teal text)
- **Font Size**: `10px`
- **Padding**: `3px 6px`
- **Min Width**: `32px`
- **Height**: `20px`
- **Border Radius**: `3px`
- **Transition**: `all 0.2s ease`

#### Button Hover Effects
- **Background**: `rgba(78, 205, 196, 0.3)`
- **Border**: `rgba(78, 205, 196, 0.4)`
- **Transform**: `translateY(-1px)`

#### Specialized Button Types
- **Alternate Art Button**: `.alternate-art-btn`
  - Font Size: `9px`
  - Padding: `2px 4px`
  - Min Width: `28px`
  - Height: `18px`
- **Quantity Buttons**: `.remove-one-btn`, `.add-one-btn`, `.quantity-btn`
  - Font Size: `11px`
  - Font Weight: `bold`
  - Min Width: `24px`
  - Height: `18px`

### Category Sections
#### Category Container
- **Class**: `.card-view-category-section`
- **Width**: `100%`
- **Margin Bottom**: `30px`
- **Display**: `block`
- **Clear**: `both`

#### Category Header
- **Class**: `.card-view-category-header`
- **Background**: `rgba(78, 205, 196, 0.1)` (teal tint)
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Border Radius**: `6px`
- **Padding**: `12px 16px`
- **Margin Bottom**: `12px`
- **Layout**: `display: flex`, `justify-content: space-between`, `align-items: center`
- **Cursor**: `pointer` (clickable for collapse/expand)
- **Hover**: `rgba(78, 205, 196, 0.15)` background, `rgba(78, 205, 196, 0.4)` border
- **Transition**: `all 0.2s ease`

#### Category Name
- **Class**: `.card-view-category-name`
- **Color**: `#4ecdc4` (primary teal)
- **Font Weight**: `600`
- **Font Size**: `1.2rem`

#### Category Controls
- **Container**: `.card-view-category-controls`
- **Layout**: `display: flex`, `align-items: center`, `gap: 12px`

#### Category Count
- **Class**: `.card-view-category-count`
- **Color**: `#bdc3c7` (light gray)
- **Font Size**: `1rem`

#### Category Toggle Button
- **Class**: `.card-view-category-toggle`
- **Color**: `#4ecdc4` (primary teal)
- **Font Size**: `0.9rem`
- **Font Weight**: `bold`
- **Symbol**: `▼` (down arrow)
- **Transition**: `transform 0.2s ease`
- **User Select**: `none`
- **Collapsed State**: `transform: rotate(-90deg)` (rotates to `▶`)

#### Category Cards Container
- **Class**: `.card-view-category-cards`
- **Layout**: `display: flex`, `flex-wrap: wrap`
- **Gap**: `45px 15px` (vertical: 45px, horizontal: 15px)
- **Width**: `100%`
- **Transition**: `all 0.3s ease`
- **Overflow**: `hidden`
- **Collapsed State**: `max-height: 0`, `margin-bottom: 0`, `opacity: 0`

### Responsive Design
#### Breakpoint System (75% Scaling)
- **Desktop (Default)**: portrait 175×250; character 250×184, location 250×160, event 250×160 (landscape).
- **Large Tablet (≤1200px)**: portrait 160×229; character 225×166, location 225×144, event 225×144
- **Tablet (≤1000px)**: portrait 146×208; character 203×149, location 203×130, event 203×130
- **Small Tablet (≤800px)**: portrait 131×188; character 183×135, location 183×117, event 183×117
- **Mobile (≤600px)**: portrait 116×167; character 161×118, location 161×103, event 161×103

### CSS Implementation
```css
/* Card View Container */
.deck-cards-editor.card-view {
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    width: 100%;
    min-width: 100%;
    box-sizing: border-box;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
}

/* Individual Card View Item */
.deck-card-card-view-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 175px;
    height: 250px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    box-sizing: border-box;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
}

/* Landscape Cards (type-specific aspect ratios; shared layout) */
.deck-card-card-view-item[data-type="character"],
.deck-card-card-view-item[data-type="location"],
.deck-card-card-view-item[data-type="event"] {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}
.deck-card-card-view-item[data-type="character"] {
    width: 250px;
    height: 184px;
}
.deck-card-card-view-item[data-type="location"] {
    width: 250px;
    height: 160px;
}
.deck-card-card-view-item[data-type="event"] {
    width: 140px;
    height: 200px;
}

/* Card View Buttons */
.card-view-btn {
    font-size: 10px;
    padding: 3px 6px;
    min-width: 32px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid rgba(78, 205, 196, 0.3);
    background: rgba(78, 205, 196, 0.2);
    color: #4ecdc4;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Collapsible Categories
- **Toggle Function**: `toggleCardViewCategory(categoryType)` handles collapse/expand
- **Click Target**: Entire category header is clickable
- **Visual Feedback**: Arrow rotates from `▼` to `▶` when collapsed
- **Smooth Animation**: 0.3s ease transition for collapsing/expanding
- **State Management**: Uses CSS classes `.collapsed` for state tracking
- **Accessibility**: Clear visual indicators and smooth transitions

### Integration with View System
- **View Manager**: Integrates with ViewManager for view switching
- **Access Control**: Admin-only access with role validation
- **Data Dependencies**: Uses `window.deckEditorCards` and `window.availableCardsMap`
- **Event Handling**: Supports hover, click, and drag interactions

## Deck Editor List View Styling

### Overview
The List View displays deck cards in a vertical list format with quantity controls. This section documents the styling and layout fixes that prevent visual jumps when updating card quantities.

### List View Item Layout
- **Container**: `.deck-list-item`
- **Layout**: `display: flex`, `flex-direction: row`, `align-items: center`
- **Width**: `100%`
- **Flex Wrap**: `nowrap` (prevents wrapping)

### Quantity Element Styling (Critical Fix - 2025)
The quantity element was causing text to jump when quantities changed from single to double digits. This has been fixed with a fixed-width approach.

#### Problem
- Single-digit quantities (1, 3) caused the quantity element width to change when updated
- This caused all white text on screen to shift right then back left
- Double-digit quantities (13, 24, 32) remained stable because they already had sufficient width

#### Solution
Fixed width applied to quantity element to prevent layout shifts:

- **Class**: `.deck-list-item-quantity`
- **Fixed Width**: `40px` (accommodates 2-3 digits)
- **Min Width**: `40px`
- **Text Alignment**: `right` (numbers align consistently)
- **Flex Properties**: `flex: 0 0 40px` (prevents flex resizing)
- **Box Sizing**: `border-box`
- **Color**: `#4ecdc4` (primary teal)
- **Font Weight**: `600`
- **Margin Right**: `12px`

#### CSS Implementation
```css
.deck-list-item-quantity {
    font-weight: 600;
    color: #4ecdc4;
    margin-right: 12px;
    min-width: 40px;
    width: 40px;
    text-align: right;
    flex: 0 0 40px;
    box-sizing: border-box;
}
```

#### JavaScript Enforcement
The `enforceListViewHorizontalLayout()` function ensures fixed widths are applied:
- Sets `min-width: 40px` with `!important`
- Sets `width: 40px` with `!important`
- Sets `text-align: right` with `!important`
- Sets `flex: 0 0 40px` with `!important`
- Applied immediately after `replaceChildren()` in list view updates

#### Layout Preservation During Updates
- Column widths are locked before DOM updates to prevent flex recalculation
- Quantity element widths are enforced synchronously after `replaceChildren()`
- This prevents the "bouncing text" issue when clicking +/- buttons

### List View Item Components
- **Quantity**: Fixed 40px width, right-aligned, teal color
- **Card Name**: Flexible width (`flex: 1`), white text
- **Actions**: Fixed width buttons container with +/- quantity controls

### Debug Logging
Debug logging tracks quantity element widths during updates:
- Logs first 5 quantity elements after `replaceChildren()`
- Shows text content, `offsetWidth`, and computed `width`
- Helps verify fixed widths are properly applied

## Export Modal Styling

### Overview
The Export Modal displays exported deck JSON in a full-screen overlay with a dark theme and teal accents. It's designed for viewing and copying exported deck data.

### Modal Overlay Container
- **Class**: `.export-overlay`
- **Position**: `fixed`, `top: 0`, `left: 0`
- **Dimensions**: `width: 100%`, `height: 100%` (full viewport)
- **Background**: `rgba(0, 0, 0, 0.8)` (80% black overlay)
- **Z-Index**: `10000` (above all other content)
- **Layout**: `display: flex`, `align-items: center`, `justify-content: center`
- **Click-to-Close**: Clicking outside the content closes the modal

### Modal Content Container
- **Class**: `.export-overlay-content`
- **Background**: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)` (matches main app background)
- **Border**: `1px solid #4ecdc4` (primary teal)
- **Border Radius**: `12px`
- **Dimensions**: `width: 90%`, `max-width: 1200px`, `height: 80%`, `max-height: 900px`
- **Layout**: `display: flex`, `flex-direction: column`
- **Box Shadow**: `0 0 30px rgba(78, 205, 196, 0.4)` (teal glow)

### Modal Header
- **Class**: `.export-overlay-header`
- **Layout**: `display: flex`, `justify-content: space-between`, `align-items: center`
- **Padding**: `20px 24px`
- **Border Bottom**: `1px solid rgba(78, 205, 196, 0.3)` (teal divider)
- **Background**: `rgba(0, 0, 0, 0.2)` (subtle dark overlay)

#### Header Title
- **Element**: `h3` inside `.export-overlay-header`
- **Color**: `#4ecdc4` (primary teal)
- **Font Size**: `1.4rem`
- **Font Weight**: `600`
- **Margin**: `0`

#### Close Button
- **Class**: `.export-close-btn`
- **Background**: `none`
- **Border**: `none`
- **Color**: `#4ecdc4` (primary teal)
- **Font Size**: `28px`
- **Dimensions**: `32px × 32px`
- **Layout**: `display: flex`, `align-items: center`, `justify-content: center`
- **Border Radius**: `4px`
- **Cursor**: `pointer`
- **Hover**: `background: rgba(78, 205, 196, 0.2)` (teal tint)

### Modal Body
- **Class**: `.export-overlay-body`
- **Flex**: `1` (takes remaining space)
- **Padding**: `0`
- **Overflow**: `hidden`
- **Layout**: `display: flex`, `flex-direction: column`

### JSON Container
- **Class**: `.json-container`
- **Position**: `relative`
- **Flex**: `1` (fills body space)
- **Overflow**: `auto` (scrollable content)
- **Padding**: `20px`

#### Copy Button (Export Only)
- **Class**: `.copy-button`
- **Position**: `absolute`, `top: 20px`, `right: 20px`
- **Background**: `rgba(78, 205, 196, 0.2)` (teal)
- **Border**: `1px solid rgba(78, 205, 196, 0.4)`
- **Border Radius**: `6px`
- **Padding**: `8px 12px`
- **Cursor**: `pointer`
- **Z-Index**: `10`
- **Transition**: `all 0.2s ease`
- **Hover**: `background: rgba(78, 205, 196, 0.3)`, `border-color: rgba(78, 205, 196, 0.6)`

#### JSON Content Display (Export)
- **Element**: `#exportJsonContent` (`<pre>` tag)
- **Font**: `'Courier New', monospace`
- **Font Size**: `13px`
- **Line Height**: `1.5`
- **Color**: `#ffffff` (white text)
- **Background**: `rgba(0, 0, 0, 0.3)` (dark overlay)
- **Padding**: `20px`
- **Border Radius**: `6px`
- **Margin**: `0`
- **White Space**: `pre-wrap` (preserves formatting)
- **Word Wrap**: `break-word`
- **Overflow**: `auto`

### CSS Implementation
```css
.export-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.export-overlay-content {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid #4ecdc4;
    border-radius: 12px;
    width: 90%;
    max-width: 1200px;
    height: 80%;
    max-height: 900px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 30px rgba(78, 205, 196, 0.4);
}

.export-overlay-header h3 {
    margin: 0;
    color: #4ecdc4;
    font-size: 1.4rem;
    font-weight: 600;
}

.export-close-btn {
    background: none;
    border: none;
    color: #4ecdc4;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.export-close-btn:hover {
    background: rgba(78, 205, 196, 0.2);
}
```

## Import Modal Styling

### Overview
The Import Modal provides a textarea for pasting JSON and displays error messages when import fails. It shares the same overlay structure as the Export Modal but with different body content.

### Shared Overlay Styling
The Import Modal uses the same `.export-overlay` class and overlay structure as the Export Modal:
- Same overlay container, content wrapper, header, and close button
- Same dimensions, positioning, and z-index
- Only the body content differs

### Import Body Content

#### JSON Textarea
- **Element**: `#importJsonContent`
- **Class**: `.import-json-textarea`
- **Flex**: `1` (fills available space)
- **Background**: `rgba(0, 0, 0, 0.4)` (dark overlay)
- **Color**: `#ffffff` (white text)
- **Padding**: `20px`
- **Font**: `'Courier New', monospace`
- **Font Size**: `13px`
- **Line Height**: `1.5`
- **Border**: `none`
- **Outline**: `none`
- **Resize**: `vertical` (allows height adjustment)
- **Placeholder Color**: `rgba(255, 255, 255, 0.4)` (muted white)
- **Placeholder Text**: "Paste exported deck JSON here..."

#### Error Messages Container
- **Element**: `#importErrorMessages`
- **Class**: `.import-error-messages`
- **Display**: `none` (hidden by default, shown on errors)
- **Margin**: `20px`
- **Padding**: `15px`
- **Background**: `rgba(231, 76, 60, 0.2)` (red tint)
- **Border**: `1px solid rgba(231, 76, 60, 0.5)` (red border)
- **Border Radius**: `8px`
- **Color**: `#e74c3c` (danger red)
- **Font**: `'Courier New', monospace`
- **Font Size**: `13px`
- **Line Height**: `1.5`
- **Max Height**: `200px`
- **Overflow**: `auto` (scrollable if content is long)

##### Error List
- **Element**: `<ul>` inside error messages
- **Margin**: `0`
- **Padding Left**: `20px`

##### Error List Items
- **Element**: `<li>` inside error list
- **Margin**: `8px 0`

#### Import Actions Container
- **Class**: `.import-actions`
- **Padding**: `20px`
- **Border Top**: `1px solid rgba(78, 205, 196, 0.3)` (teal divider)
- **Layout**: `display: flex`, `justify-content: flex-end`
- **Gap**: `12px`

#### Import Button
- **Element**: `#importJsonButton`
- **Class**: `.import-button`
- **Background**: `rgba(78, 205, 196, 0.2)` (teal)
- **Border**: `1px solid rgba(78, 205, 196, 0.4)`
- **Border Radius**: `6px`
- **Padding**: `12px 24px`
- **Color**: `#4ecdc4` (primary teal)
- **Font Size**: `14px`
- **Font Weight**: `600`
- **Cursor**: `pointer`
- **Transition**: `all 0.2s ease`
- **Hover**: `background: rgba(78, 205, 196, 0.3)`, `border-color: rgba(78, 205, 196, 0.6)`
- **Disabled State**: `opacity: 0.5`, `cursor: not-allowed`
- **Text**: "Import Cards"

### CSS Implementation
```css
.import-json-textarea {
    flex: 1;
    background: rgba(0, 0, 0, 0.4);
    color: #ffffff;
    padding: 20px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    border: none;
    outline: none;
    resize: vertical;
}

.import-json-textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
}

.import-error-messages {
    margin: 20px;
    padding: 15px;
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid rgba(231, 76, 60, 0.5);
    border-radius: 8px;
    color: #e74c3c;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    max-height: 200px;
    overflow: auto;
}

.import-actions {
    padding: 20px;
    border-top: 1px solid rgba(78, 205, 196, 0.3);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.import-button {
    background: rgba(78, 205, 196, 0.2);
    border: 1px solid rgba(78, 205, 196, 0.4);
    border-radius: 6px;
    padding: 12px 24px;
    color: #4ecdc4;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.import-button:hover:not(:disabled) {
    background: rgba(78, 205, 196, 0.3);
    border-color: rgba(78, 205, 196, 0.6);
}

.import-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
```

### Shared Components
Both Export and Import modals use the same base structure:
- **Overlay**: `.export-overlay` (shared class name)
- **Content Container**: `.export-overlay-content`
- **Header**: `.export-overlay-header` with title and close button
- **Body**: `.export-overlay-body` with content-specific elements

This shared structure ensures visual consistency between export and import workflows.

### Responsive Design
- **Desktop**: Full-size modal (90% width, 80% height, max 1200px × 900px)
- **Tablet**: Maintains same proportions, adjusts to viewport
- **Mobile**: Modal fills most of screen (90% width), content scrolls internally

## Google Sign-In Button Styling

### Overview
The "Sign in with Google" button appears in the login modal between the Log In button and "Continue as Guest." It uses Google's standard blue branding for instant recognition.

### CSS Class
- **Element**: Button with class `.google-btn`
- **Location**: [public/components/login/login.css](public/components/login/login.css)

### Base Styling
- **Background**: `#4285f4` (Google blue)
- **Color**: `white`
- **Border**: `none`
- **Padding**: `12px 24px`
- **Border Radius**: `8px`
- **Font Size**: `1.1rem`
- **Font Weight**: `500`
- **Cursor**: `pointer`
- **Transition**: `background 0.2s ease`
- **Margin Top**: `15px`
- **Width**: `100%`

### Hover State
- **Background**: `#357ae8` (darker Google blue)

### Position
Part of the login buttons 2x2 grid (see Login Buttons Grid below).

### Login Buttons Layout
- **Container**: `.login-buttons-grid`
- **Layout**: CSS Grid with three rows
  - **Row 1**: Log In (full width, `grid-column: 1 / -1`)
  - **Row 2**: Sign in with Google (full width, `grid-column: 1 / -1`)
  - **Row 3**: Continue as Guest | Sign Up (two columns, `1fr 1fr`)
- **Gap**: `8px` row, `10px` column
- **Margin Top**: `12px`
- **Button sizing**: `padding: 8px 14px`, `font-size: 0.9rem`, `border-radius: 6px`, `white-space: nowrap`

## Sign Up and Account Creation Styling

### Overview
The login modal supports two views: Login and Sign Up. The Sign Up button toggles to the account creation form. Sign Up uses the same outline/teal secondary style as "Continue as Guest" for visual consistency.

### Sign Up Button
- **Element**: Button with class `.signup-btn`
- **Location**: [public/components/login/login.css](public/components/login/login.css)
- **Styling**: Reuses `.guest-btn` pattern — outline teal, secondary action
- **Background**: `rgba(78, 205, 196, 0.2)`
- **Color**: `#4ecdc4`
- **Border**: `1px solid rgba(78, 205, 196, 0.3)`
- **Padding**: `12px 24px`
- **Border Radius**: `8px`
- **Font Size**: `1.1rem`
- **Hover**: `background: rgba(78, 205, 196, 0.3)`; `border-color: rgba(78, 205, 196, 0.4)`
- **Position**: Bottom-right cell of the login buttons 2x2 grid (Log In top-left, Google top-right, Guest bottom-left, Sign Up bottom-right)

### Signup Form
- **Container**: `#signupView` with class `.signup-view`
- **Form**: `#signupForm` with classes `.signup-form` and `.login-form`
- **Heading**: `.signup-heading` — "Create Account" — color `#4ecdc4`, font-size `1.5rem`, font-weight `600`
- **Input Fields**: Uses same `.form-group` and `.form-group input` styling as login form (teal labels, dark inputs with `rgba(255,255,255,0.1)` background)
- **Create Account Button**: Uses `.login-btn` (primary teal gradient)

### Back to Log In Link
- **Element**: Anchor with id `signupBackLink` and class `.signup-back-link`
- **Color**: `#4ecdc4`
- **Text**: "Already have an account? Log in"
- **Hover**: underline
- **Display**: `block`, margin-top `15px`

---

## Foil Card Shimmer Effect

### Overview

FOIL cards are special versions of existing cards with a metallic sheen overlaid on the original card image. The effect is **CSS-only and fully encapsulated** in [`public/css/foil-effect.css`](../../public/css/foil-effect.css) — no separate image files are needed. The JavaScript driver lives in [`public/js/foil-animation.js`](../../public/js/foil-animation.js).

The shimmer is a diagonal light band that sweeps across the card image once, then settles in a randomised resting position. The animation is intentionally brief (~0.3–0.9 s) so it feels like a physical card catch of the light rather than a looping cartoon effect.

---

### Source Files

| File | Responsibility |
|------|---------------|
| `public/css/foil-effect.css` | **Single source of truth** for all foil visuals: shimmer gradient, animation keyframes, CSS custom properties, Foil button states |
| `public/js/foil-animation.js` | Randomises CSS custom properties per hover; adds/removes `.foil-active` on mouse events; skips hover listeners for deck-editor static elements |
| `public/js/deck-editor-rendering.js` | Calls `initDeckEditorFoilElements()` after each deck re-render to handle the one-shot animation for card-view and tile-view foil elements |
| `public/js/card-hover-modal.js` | Explicitly triggers `.foil-active` on the hover modal's image wrapper via `requestAnimationFrame` so the shimmer plays when the modal appears |

---

### CSS Custom Properties

All visual knobs are controlled by CSS custom properties set on the `.foil-shimmer` wrapper element. JavaScript sets these before each animation trigger so every instance looks distinct.

| Property | Default | Range | Description |
|----------|---------|-------|-------------|
| `--foil-duration` | `0.9s` | `0.25 – 1.15s` | How long the sweep takes to cross the card |
| `--foil-translate-end` | `0%` | `-5% – +5%` | Where the shimmer band rests after the sweep (horizontal offset as % of element width) |
| `--foil-opacity` | `1` | `0.55 – 1.0` | Overall brightness of the shimmer band |
| `--foil-angle` | `115deg` | `90 – 150deg` | Diagonal angle of the gradient sweep |
| `--foil-anim-delay` | `0s` | `0s` or `-100s` | Internal deck-editor flag: `-100s` snaps the one-shot animation to its end state (used by `initDeckEditorFoilElements` for cards that were already foil before a re-render) |

> **Custom properties cascade into `::after` pseudo-elements**, which is the mechanism that lets JS changes on the wrapper element control the animation on its pseudo-element child.

---

### Shimmer Gradient

```css
background: linear-gradient(
    var(--foil-angle),       /* randomised diagonal, default 115deg */
    transparent 20%,
    rgba(255, 255, 255, 0.30) 38%,
    rgba(200, 160, 255, 0.45) 50%,   /* soft purple highlight */
    rgba(255, 210, 100, 0.30) 62%,   /* warm gold highlight  */
    transparent 80%
);
```

- The band occupies **~60% of the element width** (20%–80%), with fully transparent zones on both edges — this prevents any hard clipping edge at the card border.
- `--foil-opacity` is applied as `opacity` on the `::after` element, letting the brightness vary independently of the gradient stops.

---

### Oversized Pseudo-Element (`inset: -50% -20%`)

The `::after` element that carries the gradient is intentionally larger than the card:

- **Horizontal**: extends 20% beyond each side (element = 140% of card width)
- **Vertical**: extends 50% beyond each side (element = 200% of card height)

**Why**: The gradient runs diagonally (`--foil-angle` ≈ 90–150°). If the `::after` were card-sized, the diagonal band would intersect the element's own corners, producing a hard visible line where the shimmer gets clipped by `overflow: hidden`. By extending the element well beyond the card and clamping `--foil-translate-end` to ±5%, the card edges always land in the gradient's fully-transparent zones (0–20% and 80–100%), guaranteeing soft fade-outs on all sides.

`overflow: hidden` on the `.foil-shimmer` wrapper clips the excess invisibly.

---

### Animation Modes

There are two distinct animation modes depending on context.

#### 1. Interactive (Hover-Triggered) — Collection View, Database View, Hover Modal

Used for foil cards viewed in read-only contexts. The shimmer triggers on each hover and re-triggers every time the user moves off the card and back.

**Mechanism**: JavaScript class toggle driven by `mouseenter` / `mouseleave` in `foil-animation.js`.

```css
/* Resting state — shimmer parked off-screen right, snap-back is instant */
.foil-shimmer::after {
    transform: translateX(110%);
    transition: none;
}

/* Active state — shimmer sweeps to resting position */
.foil-shimmer.foil-active::after {
    transform: translateX(var(--foil-translate-end));
    transition: transform var(--foil-duration) ease-out;
}
```

- `transition: none` on the base rule means removing `.foil-active` snaps the element back to off-screen **instantly**, so the next hover always starts from a clean state.
- `foil-animation.js` calls `randomiseFoilVars(el)` on every `mouseenter`, giving each hover a fresh randomised look.
- Elements with `.foil-once` class are **skipped** by `foil-animation.js` (deck-editor cards should not respond to hover).

#### 2. One-Shot Static (Deck Editor) — Card View and Tile View

Used in the deck editor when a card is selected as foil. The shimmer plays once on render and then **remains frozen** in place; it does not reset on hover.

**Card-view** (`.foil-shimmer.foil-once`):

```css
@keyframes foil-once-sweep {
    from { transform: translateX(110%); }
    to   { transform: translateX(0%); }
}

.foil-shimmer.foil-once::after {
    animation: foil-once-sweep var(--foil-duration) ease-out
               var(--foil-anim-delay, 0s) forwards;
    opacity: 0.85;
}
```

**Tile-view** (`.tile-foil-shimmer`):

The character tile already uses `::before` (card image) and `::after` (dark overlay), so the shimmer cannot use a pseudo-element. Instead it is a standalone `<div class="tile-foil-shimmer">` that animates its own `background-position`:

```css
@keyframes tile-foil-sweep {
    from { background-position: 250% center; }
    to   { background-position: 0% center; }
}

.tile-foil-shimmer {
    position: absolute !important;  /* overrides .character-card > * rule */
    inset: 0 !important;
    animation: tile-foil-sweep var(--foil-duration, 0.7s) ease-out
               var(--foil-anim-delay, 0s) forwards;
}
```

> `!important` is required because `.character-card > *` sets `position: relative; z-index: 1` on all children, which would override `position: absolute` and cause the shimmer to bleed outside the tile.

---

### Applying the Effect

Add `.foil-shimmer` to the **immediate wrapper element** of a card image — never to the `<img>` itself, since `::after` requires a positioned parent.

```html
<!-- Correct -->
<div class="card-foil-img-wrap foil-shimmer">
  <img src="..." class="card-view-image">
</div>

<!-- Wrong — ::after will not render on replaced elements -->
<img class="foil-shimmer" src="...">
```

At runtime, `card.is_foil === true` on the API response is what triggers the class. No other logic is needed.

For the deck-editor card view, also add `.foil-once` to enable the one-shot static mode:

```html
<div class="card-foil-img-wrap foil-shimmer foil-once">
  <img src="..." class="card-view-image">
</div>
```

For the deck-editor tile view, inject the standalone shimmer div as the **first child** of the tile (before info/action divs so text renders on top at the same z-index):

```html
<div class="deck-card-editor-item ...">
  <div class="tile-foil-shimmer" aria-hidden="true"></div>
  <div class="deck-card-editor-info">...</div>
  <div class="deck-card-editor-actions">...</div>
</div>
```

---

### Wrapper Containment (`overflow: hidden`)

The shimmer effect's oversized `::after` must be clipped to the card image. Every element that carries `.foil-shimmer` must have `overflow: hidden`. This is guaranteed by:

- `.foil-shimmer` base rule: `overflow: hidden`
- `.card-foil-img-wrap` in both `foil-effect.css` and `deck-editor-card-view.css`: `overflow: hidden`
- `.tile-foil-shimmer` uses `background-image` directly (no pseudo-element), so no overflow clipping is needed

If you ever see shimmer bleeding outside a card boundary, check that `overflow: hidden` has not been overridden by a more-specific rule on the wrapper.

---

### Randomisation Logic (`foil-animation.js`)

```js
const FOIL_STOP_SECONDS  = 0.7;   // target sweep duration
const FOIL_VARIANCE_SEC  = 0.2;   // ± variance
const FOIL_MIN_SEC       = 0.25;  // floor

const FOIL_END_MIN       = -5;    // min translateX stop (%)
const FOIL_END_MAX       =  5;    // max translateX stop (%)
const FOIL_OPACITY_MIN   = 0.55;
const FOIL_OPACITY_MAX   = 1.0;
const FOIL_ANGLE_MIN     = 90;    // deg
const FOIL_ANGLE_MAX     = 150;   // deg
```

`randomiseFoilVars(el)` is called:
- On every `mouseenter` for interactive elements
- On every deck re-render for newly-foiled deck-editor elements (via `initDeckEditorFoilElements`)
- In `showCardHoverModal` (via `window.randomiseFoilVars`) before the modal is shown

`--foil-translate-end` is clamped to ±5% so the opaque gradient band never reaches the card's left or right edge (which would create a hard clip line against `overflow: hidden`).

---

### Deck Editor Re-Render Stability (`initDeckEditorFoilElements`)

Every foil toggle re-renders the entire deck editor via `innerHTML` replacement, creating brand-new DOM elements for all cards. Without special handling, every foil card — not just the newly-toggled one — would replay its sweep animation.

**Solution**: `_foilAnimatedInstances` (a module-level `Set` in `deck-editor-rendering.js`) tracks which card instances have already played their animation, keyed by `"shimmer::<cardId>::<instanceIndex>"` or `"tile::<cardId>::<instanceIndex>"`.

On each re-render:
- **Key already in set** (card was foil before the re-render): CSS vars are left unchanged and `--foil-anim-delay: -100s` snaps the animation to its end state immediately. No visual change occurs.
- **Key not in set** (newly-foiled card): CSS vars are randomised, `--foil-anim-delay: 0s`, animation plays normally. Key is added to the set.
- **Stale keys** (card was de-foiled): pruned at the end of each render cycle, so if the user re-selects foil later, the animation plays fresh again.

---

### Foil Toggle Button

The Foil button in the deck editor always reads **"Foil"**. Its pressed/unpressed state communicates whether foil is currently active — consistent with the KO button pattern.

| State | Class | Background | Text Color | Border |
|-------|-------|-----------|------------|--------|
| Unpressed | `.foil-btn` | `rgba(78, 205, 196, 0.2)` | `#4ecdc4` | `rgba(78, 205, 196, 0.3)` |
| Pressed | `.foil-btn.foil-btn--active` | `#4ecdc4` (solid) | `rgba(26, 26, 46, 0.9)` (dark) | `#4ecdc4` |
| Hover (unpressed) | `.foil-btn:hover` | `rgba(78, 205, 196, 0.3)` | — | `rgba(78, 205, 196, 0.4)` |
| Hover (pressed) | `.foil-btn--active:hover` | `#3bbdb4` | — | `#3bbdb4` |

Card-view variant adds `!important` overrides via `.card-view-btn.foil-btn--active` to beat the card-view button base specificity.

All button states are defined in `foil-effect.css` alongside the shimmer, so all foil visuals stay in one place.

---

### Editing the Effect

**To change the shimmer look** — edit only `public/css/foil-effect.css`:
- Gradient colours / stop positions: modify the `linear-gradient()` inside `.foil-shimmer::after`
- Band width: adjust the stop percentages (currently 20%–80%)
- Animation feel: adjust `ease-out` on the `foil-once-sweep` / `foil-active` transition
- Extend/contract the oversized area: change `inset: -50% -20%` (keep negative values)

**To change timing/randomisation** — edit constants at the top of `public/js/foil-animation.js`:
- `FOIL_STOP_SECONDS` — target duration
- `FOIL_VARIANCE_SEC` — how much the duration can vary
- `FOIL_END_MIN/MAX` — how far left/right the shimmer can stop (keep within ±20% to avoid hard edges)
- `FOIL_OPACITY_MIN/MAX` — brightness range
- `FOIL_ANGLE_MIN/MAX` — sweep angle range

**No other files need to change** to modify the visual effect.

---

## Reserve Button Styling

### Overview

The **Reserve** button appears on character cards in the deck editor. It allows the user to select which character serves as the reserve. The button label is **"Reserve"** (not "Select Reserve") to keep it compact and aligned with other action buttons (Change Art, Foil, KO).

### Sizing and Layout

When the Foil button is present on character cards with foil variants, the action row can become crowded. To prevent the Reserve button from being mis-sized (vertically elongated or horizontally compressed):

- **Class**: `.reserve-btn`
- **min-width**: `52px` — ensures consistent width regardless of button count
- **flex-shrink**: `0` — prevents the button from shrinking in a flex row
- **white-space**: `nowrap` — prevents text wrapping

These properties are defined in `public/css/index.css` alongside `.ko-btn` and `.alternate-art-btn`. The `.foil-btn` in `foil-effect.css` also uses `flex-shrink: 0` so all action buttons maintain consistent sizing.

### Button States

When selected, the Reserve button darkens (grey tone) with a pressed-in inset shadow so it is clearly distinct from the unselected state.

| State | Class | Appearance |
|------|-------|------------|
| Unselected | `.reserve-btn` | `rgba(255, 255, 255, 0.1)` background, white text |
| Selected | `.reserve-btn.active` | `rgba(100, 100, 100, 0.6)` background, white text, `box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6)` |
| Selected hover | `.reserve-btn.active:hover` | Slightly brighter grey (`rgba(120, 120, 120, 0.65)`), same inset shadow |
| Read-only (selected) | `.reserve-btn.active:disabled` | Same darkened pressed-in look but non-interactive |

### Location

- **Tile View**: Bottom-right of character card, in `.deck-card-editor-actions`
- **Card View**: In the card action row
- **List View**: `.deck-list-item .reserve-btn` with reduced font-size (10px) and padding

## Deck Editor Available Cards Character Stacks

### Overview

The Available Cards pane in the deck editor now includes a new top-level category named **Character Stacks**. It appears as the first category above **Characters** and uses the same grouped subcategory pattern as existing grouped categories (for example, Power Cards groups).

### Category and Group Structure

- **Top-level category**: `Character Stacks` (`.card-category`, `.card-category-header`, `.card-category-content`)
- **Group container**: `.character-group`
- **Group header**: `.character-group-header`
- **Group body**: `.character-group-content`
- **Controls container**: `.mission-set-controls`
- **Add All button**: `.add-all-btn`
- **Subdivision search input**: `.character-stack-name-search`
- **Subdivision labels**: character name only (no per-subdivision card count suffix)

Each group is one character and contains cards in this order:
1. Original art character card (non-foil)
2. One of each special card for that character (non-foil, original-art preference)
3. One of each Universe: Advanced card for that character (non-foil, original-art preference)

`Any Character` cards are intentionally excluded from Character Stacks.

### Visual Styling (Reused Existing Tokens)

Character Stacks intentionally reuses existing Available Cards styling to match current functionality:

- **Category header background**: `rgba(78, 205, 196, 0.2)` via `.card-category-header`
- **Group header background**: `rgba(78, 205, 196, 0.1)` via `.character-group-header`
- **Group hover background**: `rgba(78, 205, 196, 0.2)` via `.character-group-header:hover`
- **Group border**: `1px solid rgba(255, 255, 255, 0.1)` via `.character-group`
- **Search input styling** (shared with Characters search):
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border: `1px solid rgba(78, 205, 196, 0.3)`
  - Border radius: `4px`
  - Font size: `0.8rem`
  - Width: `150px`
  - Margin-left: `12px`
- **Add All button**:
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border: `1px solid rgba(255, 255, 255, 0.2)`
  - Padding: `4px 8px`
  - Radius: `4px`
  - Font size: `0.8rem`

### Interaction Behavior

- Groups are collapsed by default and expand/collapse using the existing `toggleCharacterGroup(...)` behavior.
- Each group’s **Add All** adds one non-foil copy of each stack card to the current deck.
- Add behavior routes through existing deck editor add rules, so limits and OPD constraints stay consistent with the rest of the editor.
- Search input filters subdivisions by character name (group header text), matching the Characters category search interaction pattern.

### Responsive Behavior

Character Stacks uses the same responsive behavior as other Available Cards categories because it reuses existing card category and group classes; no additional breakpoints are introduced.
