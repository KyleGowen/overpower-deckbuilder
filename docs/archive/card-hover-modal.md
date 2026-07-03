# Card Hover Modal Documentation

## Overview

The Card Hover Modal is an interactive feature that displays an enlarged preview of a card when the user hovers their mouse over it. This feature is used throughout the deck editor interface, collection view, and card browser to provide users with detailed card information without requiring a click.

## Table of Contents

1. [API Reference](#api-reference)
2. [Positioning Algorithm](#positioning-algorithm)
3. [Button Avoidance Logic](#button-avoidance-logic)
4. [Usage Examples](#usage-examples)
5. [Implementation Details](#implementation-details)
6. [CSS Styling](#css-styling)

## API Reference

### `showCardHoverModal(imagePath, cardName)`

Displays the card hover modal with the specified card image and name.

**Parameters:**
- `imagePath` (string): The path to the card image file. Can be a relative path (e.g., `'characters/hercules.webp'`) or absolute path (e.g., `'/src/resources/cards/images/characters/hercules.webp'`).
- `cardName` (string): The display name of the card to show in the caption. This is currently set but not displayed (caption is cleared).

**Behavior:**
- Clears any existing hide timeout to prevent flickering
- Sets the modal image source to the provided `imagePath`
- Clears the caption text (legacy support)
- Positions the modal based on mouse position using the positioning algorithm
- Adds a `mousemove` event listener to track mouse movement
- Displays the modal immediately

**Returns:** `undefined`

**Example:**
```javascript
showCardHoverModal('characters/hercules.webp', 'Hercules');
```

### `hideCardHoverModal()`

Hides the card hover modal with a small delay to prevent rapid show/hide cycles.

**Parameters:** None

**Behavior:**
- Clears any existing hide timeout
- Sets a 100ms timeout before hiding the modal (prevents flickering on rapid mouse movements)
- Removes the `mousemove` event listener if it exists
- Hides the modal by setting `display: none`

**Returns:** `undefined`

**Example:**
```javascript
hideCardHoverModal();
```

## Positioning Algorithm

The positioning algorithm ensures the modal appears near the mouse cursor while avoiding UI elements and staying within the viewport.

### Initial Positioning

1. **Base Offset**: Modal is positioned at `mouseX + 80px` and `mouseY + 80px` to avoid the cursor area
2. **Modal Dimensions**: Assumes modal width of 320px and height of 450px

### Mouse Tracking

- A `mousemove` event listener is attached to the document when the modal is shown
- The modal position is recalculated on every mouse movement
- The listener is stored in `modal._mouseMoveHandler` for cleanup

### Viewport Boundary Checks

The algorithm ensures the modal never goes off-screen:

1. **Left Edge**: If `x < 10`, set `x = 10`
2. **Top Edge**: If `y < 10`, set `y = 10`
3. **Right Edge**: If `x + modalWidth > window.innerWidth - 10`, set `x = window.innerWidth - modalWidth - 10`
4. **Bottom Edge**: If `y + modalHeight > window.innerHeight - 10`, set `y = window.innerHeight - modalHeight - 10`

### Minimum Distance from Cursor

- Enforces a minimum distance of 100px from the cursor in both X and Y directions
- If the modal would be too close, it's repositioned to maintain the minimum distance

## Button Avoidance Logic

The positioning algorithm includes sophisticated logic to avoid overlapping with interactive buttons on cards.

### Detection Zones

Different buffer zones are used for different button types:

- **Deck Editor Cards**: 120px buffer zone for `.quantity-btn`, `.remove-all-btn`, `.reserve-btn`
- **Collection Cards**: 120px buffer zone for `.collection-quantity-btn`
- **Available Cards**: 60px buffer zone for `.card-item-plus` buttons

### Priority Order

When a button is detected near the mouse cursor, the algorithm tries positioning in this order:

1. **Left of Button**: `x = buttonRect.left - modalWidth - 80`
2. **Below Button**: `x = buttonRect.right + 80`, `y = buttonRect.top - modalHeight / 2`
3. **Above Button**: `y = buttonRect.top - modalHeight - 80`
4. **Right of Button**: `x = buttonRect.left - modalWidth - 80`, `y = buttonRect.bottom + 80`

Each position is checked against viewport boundaries before being applied.

### Card Type Handling

#### Deck Editor Cards (`.deck-card-editor-item`)

- Detects buttons: `.quantity-btn`, `.remove-all-btn`, `.reserve-btn`
- Uses 120px detection buffer
- Checks for button overlap even when mouse isn't directly over button
- Repositions if modal would overlap with button area

#### Collection Cards (`.collection-card-item`)

- Checks for `.collection-card-actions` or `.collection-quantity-control` containers first
- Then checks individual `.collection-quantity-btn` elements
- Uses 120px detection buffer
- Handles actions container positioning separately

#### Available Cards (`.card-item`)

- Specifically checks for `.card-item-plus` buttons
- Uses 60px detection buffer (smaller because plus buttons are smaller)
- Simpler positioning logic focused on avoiding the plus button area

### Overlap Detection

After initial positioning, the algorithm checks if the modal would overlap with any buttons:

- Calculates button bounding rectangles
- Checks if modal rectangle intersects with button rectangle (with 20px buffer)
- If overlap detected, repositions modal using the priority order

## Usage Examples

### Basic HTML Usage

The most common usage is in HTML templates where cards are rendered:

```html
<div class="deck-card-editor-item" 
     onmouseenter="showCardHoverModal('characters/hercules.webp', 'Hercules')"
     onmouseleave="hideCardHoverModal()">
    <!-- Card content -->
</div>
```

### JavaScript Usage

When dynamically creating card elements:

```javascript
const cardElement = document.createElement('div');
cardElement.className = 'card-item';
cardElement.setAttribute('onmouseenter', `showCardHoverModal('${imagePath}', '${cardName}')`);
cardElement.setAttribute('onmouseleave', 'hideCardHoverModal()');
```

### Different Card Contexts

#### Deck Editor Cards
```javascript
onmouseenter="showCardHoverModal('${getCardImagePath(availableCard, card.type)}', '${cardDisplayName}')"
onmouseleave="hideCardHoverModal()"
```

#### Collection View Cards
```javascript
onmouseenter="showCardHoverModal('${escapedImagePath}', '${displayName}')"
onmouseleave="hideCardHoverModal()"
```

#### Available Cards (Card Selector)
```javascript
onmouseenter="showCardHoverModal('/src/resources/cards/images/characters/hercules.webp', 'Hercules')"
onmouseleave="hideCardHoverModal()"
```

## Implementation Details

### Modal HTML Structure

The modal is defined once in the HTML:

```html
<div id="cardHoverModal" class="card-hover-modal">
    <div class="card-hover-content">
        <img id="cardHoverImage" src="" alt="Card" class="card-hover-image">
        <div id="cardHoverCaption" class="card-hover-caption"></div>
    </div>
</div>
```

### Event Listener Management

- The `mousemove` listener is stored on the modal element as `modal._mouseMoveHandler`
- This allows proper cleanup when hiding the modal
- Prevents memory leaks from orphaned event listeners

### Timeout Mechanism

- Uses `window.hoverHideTimeout` to store the timeout ID
- 100ms delay prevents rapid show/hide cycles when mouse moves quickly
- Timeout is cleared if `showCardHoverModal()` is called again before hide completes

### Image Loading and Two-Layer Progressive Load

- For character/location/mission, the modal uses a **two-layer** setup: a base `#cardHoverImage` (thumbnail) and an optional `.card-hover-image-full` layer (full-res) that fades in when loaded. Paths come from `toThumbnailPath` / `toThumbnailPathForType` in `card-image-utils.js`.
- **Location thumbnails** are generated with **`contain`** (not `cover`) in `generateCardThumbnails.ts` so the thumb bitmap is not vertically cropped before full-res loads—promo location art is often taller than the 500×320 thumb canvas.
- **Clearing layers on each show**: The modal reuses a single shared `<img>` (and one full-res layer). Changing `img.src` to a new URL does **not** clear the current paint—the browser keeps showing the previous image until the new resource loads. That caused the "thumbnail locked to first hovered card" bug in collection view (e.g. FOIL section). **Fix:** at the start of every `showCardHoverModal` call, we clear the base image (`image.src = ''`) and the full-res layer (`fullResLayer.src = ''`, remove `card-hover-image-full--loaded`) before setting the new thumbnail/full-res. That way the modal never displays the previous card while the new one is loading.
- Request ordering is guarded by `window._hoverModalRequestId`: when a full-res load completes, we only apply it if `thisRequestId === _hoverModalRequestId`, so an older load never overwrites a newer hover.
- Error and load handlers are attached on the base image; the full-res layer stays hidden on error so the thumbnail remains visible.

## CSS Styling

### Modal Container (`.card-hover-modal`)

- `position: fixed` - Positioned relative to viewport
- `z-index: 2000` - Appears above most content
- `pointer-events: none` - Doesn't interfere with mouse events
- `background: rgba(0, 0, 0, 0.8)` - Dark semi-transparent background
- `border-radius: 8px` - Rounded corners
- `padding: 10px` - Internal spacing
- `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6)` - Drop shadow
- `backdrop-filter: blur(10px)` - Blur effect behind modal

### Image (`.card-hover-image`)

- Default: `max-width: 345px`, `max-height: 483px`
- **`data-card-type="location"`** and **`"event"`**: `max-width: 480px` (wider landscape footprint); `max-height` stays `483px`
- `width: auto` / `height: auto` - Maintains aspect ratio
- `object-fit: contain` - Fits image within bounds
- `border-radius: 6px` - Rounded corners
- `border: 2px solid rgba(78, 205, 196, 0.3)` - Teal border

### Caption (`.card-hover-caption`)

- `color: #ffffff` - White text
- `font-size: 0.9rem` - Slightly smaller text
- `font-weight: 500` - Medium weight
- `text-align: center` - Centered text

## Related Documentation

- [Card View Documentation](./current/CARD_VIEW_DOCUMENTATION.md) - Overview of card view system
- [Style Guide](./current/STYLE_GUIDE.md) - General styling guidelines

## See Also

- Main implementation: `public/index.html` (lines 9112-9386)
- CSS styling: `public/css/index.css` (lines 673-707)
- Modal HTML: `public/index.html` (lines 1439-1445)

