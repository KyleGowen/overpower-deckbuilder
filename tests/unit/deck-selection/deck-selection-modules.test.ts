/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

function loadScriptIntoWindow(relativePathFromRepoRoot: string) {
  const absPath = path.resolve(__dirname, '../../../', relativePathFromRepoRoot);
  const code = fs.readFileSync(absPath, 'utf8');
  // eslint-disable-next-line no-eval
  window.eval(code);
}

function loadDeckSelectionModules() {
  // Load in dependency order
  loadScriptIntoWindow('public/js/deck-selection/deckTileImages.js');
  loadScriptIntoWindow('public/js/deck-selection/deckTileTimestamps.js');
  loadScriptIntoWindow('public/js/deck-selection/deckTileLazyLoader.js');
  loadScriptIntoWindow('public/js/deck-selection/deckTilesRenderer.js');
  loadScriptIntoWindow('public/js/deck-selection/deckTileMenu.js');
  loadScriptIntoWindow('public/js/deck-selection/index.js');
}

describe('deck selection modules (public/js/deck-selection/*)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="deck-list"></div>
    `;

    // Globals referenced by the deck tile HTML template / renderer
    (window as any).createNewDeck = jest.fn();
    (window as any).editDeck = jest.fn();
    (window as any).viewDeck = jest.fn();
    (window as any).deleteDeck = jest.fn();
    (window as any).isGuestUser = jest.fn(() => false);

    // Ensure a clean module namespace between tests
    (window as any).DeckSelection = undefined;
    (window as any).loadDecks = undefined;
    (window as any).displayDecks = undefined;
    (window as any).toggleDeckTileMenu = undefined;
    (window as any).closeAllDeckTileMenus = undefined;

    loadDeckSelectionModules();
  });

  test('exports expected globals (backward-compatible entrypoints)', () => {
    expect((window as any).DeckSelection).toBeTruthy();
    expect(typeof (window as any).DeckSelection.displayDecks).toBe('function');
    expect(typeof (window as any).DeckSelection.toggleDeckTileMenu).toBe('function');
    expect(typeof (window as any).DeckSelection.closeAllDeckTileMenus).toBe('function');
    expect(typeof (window as any).DeckSelection.formatDeckTimestamp).toBe('function');
    expect(typeof (window as any).DeckSelection.getDeckCardImagePath).toBe('function');

    expect(typeof (window as any).loadDecks).toBe('function');
    expect(typeof (window as any).displayDecks).toBe('function');
    expect(typeof (window as any).toggleDeckTileMenu).toBe('function');
    expect(typeof (window as any).closeAllDeckTileMenus).toBe('function');
  });

  test('formatDeckTimestamp: today -> time, other day -> date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-22T12:34:00.000Z'));

    const todayValue = '2026-01-22T08:15:00.000Z';
    const yesterdayValue = '2026-01-21T08:15:00.000Z';

    const expectedToday = new Date(todayValue).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const expectedYesterday = new Date(yesterdayValue).toLocaleDateString();

    expect((window as any).DeckSelection.formatDeckTimestamp(todayValue)).toBe(expectedToday);
    expect((window as any).DeckSelection.formatDeckTimestamp(yesterdayValue)).toBe(expectedYesterday);

    jest.useRealTimers();
  });

  test('displayDecks: renders background image class/style and legality + guest delete disabled', async () => {
    (window as any).isGuestUser = jest.fn(() => true);

    const decks = [
      {
        metadata: {
          id: 'deck-123',
          name: 'My Deck',
          is_limited: false,
          is_valid: true,
          threat: 10,
          cardCount: 55,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: "public/resources/images/backgrounds/bg's.webp",
        },
        cards: [
          { type: 'character', name: 'Wolverine', defaultImage: 'characters/wolverine.webp' },
          { type: 'location', name: 'Danger Room', defaultImage: 'locations/danger_room.webp' },
          { type: 'mission', name: 'Save The World', defaultImage: 'missions/save_the_world.webp' },
        ],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const tile = document.querySelector('.deck-card.deck-tile.deck-tile--compact') as HTMLElement;
    expect(tile).toBeTruthy();
    expect(tile.className).toContain('deck-tile--has-bg');
    expect(tile.getAttribute('style')).toContain("--deck-tile-bg: url('/public/resources/images/backgrounds/bg%27s.webp')");

    // Legality is inside the stats panel
    const legality = tile.querySelector('.deck-tile-side-legality') as HTMLElement;
    expect(legality).toBeTruthy();
    expect(legality.innerHTML).toContain('✅ Legal');

    // Guest delete disabled
    const menu = document.getElementById('deckTileMenu-deck-123') as HTMLElement;
    expect(menu).toBeTruthy();
    const dangerButton = menu.querySelector('.deck-tile-menu-item--danger') as HTMLButtonElement;
    expect(dangerButton).toBeTruthy();
    expect(dangerButton.disabled).toBe(true);
    expect(dangerButton.getAttribute('title')).toBe('Guests may not delete decks');
    expect(dangerButton.getAttribute('onclick')).toBe(null);
  });

  test('displayDecks: character image paths use thumbnails for faster load', async () => {
    const decks = [
      {
        metadata: {
          id: 'deck-thumb',
          name: 'Thumbnail Test Deck',
          is_limited: false,
          is_valid: true,
          threat: 12,
          cardCount: 55,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [
          { type: 'character', name: 'Tarzan', defaultImage: 'characters/tarzan.webp' },
          { type: 'character', name: 'Jane', defaultImage: 'characters/alternate/jane_porter.webp' },
          { type: 'location', name: 'Danger Room', defaultImage: 'danger_room.webp' },
          { type: 'mission', name: 'Save The World', defaultImage: 'save_the_world.webp' },
        ],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const deckListHtml = document.getElementById('deck-list')?.innerHTML ?? '';
    // Character, location, and mission paths use thumbnails for faster production load
    expect(deckListHtml).toContain('/thumb/');
    expect(deckListHtml).toContain('characters/thumb/tarzan.webp');
    expect(deckListHtml).toContain('characters/thumb/alternate/jane_porter.webp');
    expect(deckListHtml).toContain('locations/thumb/danger_room.webp');
    expect(deckListHtml).toContain('missions/thumb/save_the_world.webp');
  });

  test('displayDecks: shows sample deck first, then "Create your first deck" tile when only sample decks exist', async () => {
    const decks = [
      {
        metadata: {
          id: 'sample-deck-1',
          name: 'Sample: Time Detectives',
          is_limited: true,
          is_valid: true,
          threat: 10,
          cardCount: 55,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const deckList = document.getElementById('deck-list');
    expect(deckList).toBeTruthy();
    const deckCards = deckList!.querySelectorAll('.deck-card');
    expect(deckCards.length).toBe(2); // Sample deck first, then "Create your first deck" tile
    // First should be the sample deck (has deck-tile class and title)
    expect(deckCards[0].classList.contains('deck-tile')).toBe(true);
    expect(deckCards[0].querySelector('.deck-tile-title')?.textContent).toBe('Sample: Time Detectives');
    // Second should be the "Create your first deck" tile
    const createTile = deckCards[1];
    const h4 = createTile.querySelector('h4');
    expect(h4!.textContent).toBe('Create your first deck.');
  });

  test('displayDecks: hides "Create your first deck" tile when user has their own deck', async () => {
    const decks = [
      {
        metadata: {
          id: 'user-deck-1',
          name: 'My Custom Deck',
          is_limited: false,
          is_valid: true,
          threat: 12,
          cardCount: 55,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const deckList = document.getElementById('deck-list');
    expect(deckList).toBeTruthy();
    const firstDeckTile = deckList!.querySelector('.deck-card');
    expect(firstDeckTile).toBeTruthy();
    const h4 = firstDeckTile!.querySelector('h4');
    // The tile's h4 should be the deck title, not "Create your first deck"
    expect(h4!.textContent).toBe('My Custom Deck');
    expect(h4!.textContent).not.toBe('Create your first deck.');
  });

  test('displayDecks: hides tile when user has both sample and own deck', async () => {
    const decks = [
      {
        metadata: {
          id: 'sample-deck',
          name: 'Sample: Horror Menagerie',
          is_limited: true,
          is_valid: true,
          threat: 10,
          cardCount: 55,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [],
      },
      {
        metadata: {
          id: 'user-deck',
          name: 'My Own Deck',
          is_limited: false,
          is_valid: true,
          threat: 12,
          cardCount: 55,
          created: '2026-01-21T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const deckList = document.getElementById('deck-list');
    expect(deckList).toBeTruthy();
    // Should NOT show the first deck tile (user has their own deck)
    const allCards = deckList!.querySelectorAll('.deck-card');
    const firstCard = allCards[0];
    const h4 = firstCard?.querySelector('h4');
    expect(h4!.textContent).not.toBe('Create your first deck.');
  });

  test('menu behavior: toggle open/close + outside click + escape', async () => {
    const decks = [
      {
        metadata: {
          id: 'deck-abc',
          name: 'Menu Deck',
          is_limited: false,
          is_valid: true,
          threat: 0,
          cardCount: 0,
          created: '2026-01-20T00:00:00.000Z',
          lastModified: '2026-01-22T00:00:00.000Z',
          background_image_path: null,
        },
        cards: [],
      },
    ];

    await (window as any).DeckSelection.displayDecks(decks);

    const button = document.querySelector('.deck-tile-menu-button') as HTMLButtonElement;
    const menu = document.getElementById('deckTileMenu-deck-abc') as HTMLElement;
    expect(button).toBeTruthy();
    expect(menu).toBeTruthy();

    const eventStub: any = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      currentTarget: button,
    };

    // Open
    (window as any).DeckSelection.toggleDeckTileMenu(eventStub, 'deck-abc');
    expect(menu.classList.contains('show')).toBe(true);
    expect(button.classList.contains('open')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    // Toggle again closes
    (window as any).DeckSelection.toggleDeckTileMenu(eventStub, 'deck-abc');
    expect(menu.classList.contains('show')).toBe(false);
    expect(button.classList.contains('open')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    // Re-open
    (window as any).DeckSelection.toggleDeckTileMenu(eventStub, 'deck-abc');
    expect(menu.classList.contains('show')).toBe(true);

    // Outside click closes
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(menu.classList.contains('show')).toBe(false);

    // Re-open
    (window as any).DeckSelection.toggleDeckTileMenu(eventStub, 'deck-abc');
    expect(menu.classList.contains('show')).toBe(true);

    // Escape closes
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menu.classList.contains('show')).toBe(false);
  });
});

