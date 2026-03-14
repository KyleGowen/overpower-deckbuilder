/**
 * Shared setup and teardown for deck-export unit tests that use the real
 * public/js/components/deck-export.js and jsdom. Use with deck-export-*.test.ts
 * to avoid duplicating DOM HTML, window mocks, and script bootstrap.
 */

/* eslint-disable @typescript-eslint/no-require-imports -- conditional TextEncoder polyfill */

import fs from 'fs';
import path from 'path';

// Polyfill for TextEncoder/TextDecoder if needed (used by deck-export and tests)
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    const g = global as unknown as Record<string, unknown>;
    g.TextEncoder = TextEncoder;
    g.TextDecoder = TextDecoder;
}

export const DECK_EXPORT_MINIMAL_HTML = `
    <div id="deckEditorModal">
        <h3>Test Deck Name</h3>
        <div class="deck-description">Test deck description</div>
    </div>
    <div id="exportJsonOverlay" style="display: none;">
        <div class="export-overlay-content">
            <div class="export-overlay-header">
                <h3>Deck Export</h3>
                <button class="export-close-btn">&times;</button>
            </div>
            <div class="export-overlay-body">
                <div class="json-container">
                    <div class="copy-button" title="Copy to clipboard"></div>
                    <pre id="exportJsonContent"></pre>
                </div>
            </div>
        </div>
    </div>
`;

export interface DeckExportMocks {
    mockShowNotification: jest.Mock;
    mockLoadAvailableCards: jest.Mock;
    mockValidateDeck: jest.Mock;
    mockShowExportOverlay: jest.Mock;
}

export interface DeckExportSetupResult {
    exportDeckAsJson: () => Promise<void>;
    getExportedJson: () => unknown;
    mocks: DeckExportMocks;
}

const MOCK_NAMES = [
    'currentUser',
    '_currentUser',
    'deckEditorCards',
    'availableCardsMap',
    'isDeckLimited',
    '_isDeckLimited',
    'currentDeckData',
    '_currentDeckData',
    'showNotification',
    'loadAvailableCards',
    'validateDeck',
    'showExportOverlay',
    'exportDeckAsJson',
    'closeExportOverlay',
    'copyJsonToClipboard'
] as const;

/**
 * Get exported JSON from the overlay dataset (set by the showExportOverlay spy).
 * Call after exportDeckAsJson() has completed.
 */
export function getExportedJsonFromDOM(): unknown {
    const overlay = document.getElementById('exportJsonOverlay');
    const jsonString = (overlay as HTMLElement)?.dataset?.jsonString;
    if (!jsonString) return null;
    return JSON.parse(jsonString);
}

/**
 * Set up DOM, window mocks, and execute deck-export.js. Returns exportDeckAsJson,
 * getExportedJson (wrapper around getExportedJsonFromDOM), and jest mocks for assertions.
 * Call in beforeEach; use teardownDeckExportMocks in afterEach.
 */
export function setupDeckExportBootstrap(): DeckExportSetupResult {
    document.body.innerHTML = DECK_EXPORT_MINIMAL_HTML;

    const mockShowNotification = jest.fn();
    const mockLoadAvailableCards = jest.fn().mockResolvedValue(undefined);
    const mockValidateDeck = jest.fn().mockReturnValue({ errors: [], warnings: [] });
    let mockShowExportOverlay = jest.fn();

    const mockCurrentUser = {
        role: 'ADMIN',
        name: 'Test Admin',
        username: 'testadmin'
    };

    const w = window as unknown as Record<string, unknown>;
    w._currentUser = mockCurrentUser;
    w._isDeckLimited = false;
    w._currentDeckData = null;
    w.currentUser = mockCurrentUser;
    w.deckEditorCards = [];
    w.availableCardsMap = new Map();
    w.isDeckLimited = false;
    w.currentDeckData = null;
    w.showNotification = mockShowNotification;
    w.loadAvailableCards = mockLoadAvailableCards;
    w.validateDeck = mockValidateDeck;

    const deckExportPath = path.join(__dirname, '../../public/js/components/deck-export.js');
    const deckExportCode = fs.readFileSync(deckExportPath, 'utf-8');

    const executeCode = new Function(
        'window',
        'document',
        'navigator',
        `
        Object.defineProperty(window, 'currentUser', {
            get: function() { return window._currentUser; },
            set: function(val) { window._currentUser = val; },
            configurable: true
        });
        window._currentUser = window.currentUser;
        const currentUser = new Proxy({}, {
            get: function(target, prop) {
                return window.currentUser ? window.currentUser[prop] : undefined;
            }
        });
        const showNotification = window.showNotification;
        const loadAvailableCards = window.loadAvailableCards;
        const validateDeck = window.validateDeck;
        Object.defineProperty(window, 'isDeckLimited', {
            get: function() { return window._isDeckLimited; },
            set: function(val) { window._isDeckLimited = val; },
            configurable: true
        });
        Object.defineProperty(window, 'currentDeckData', {
            get: function() { return window._currentDeckData; },
            set: function(val) { window._currentDeckData = val; },
            configurable: true
        });
        window._isDeckLimited = window.isDeckLimited;
        window._currentDeckData = window.currentDeckData;

        ${deckExportCode}
        `
    );

    executeCode(window, document, navigator);

    const win = window as unknown as Record<string, unknown>;
    Object.defineProperty(window, 'currentUser', {
        get: function() { return win._currentUser; },
        set: function(val) { win._currentUser = val; },
        configurable: true
    });
    Object.defineProperty(window, 'isDeckLimited', {
        get: function() { return win._isDeckLimited; },
        set: function(val) { win._isDeckLimited = val; },
        configurable: true
    });
    Object.defineProperty(window, 'currentDeckData', {
        get: function() { return win._currentDeckData; },
        set: function(val) { win._currentDeckData = val; },
        configurable: true
    });

    const exportDeckAsJson = win.exportDeckAsJson;
    if (typeof exportDeckAsJson !== 'function') {
        throw new Error('exportDeckAsJson function not found on window object');
    }

    const actualShowExportOverlay = win.showExportOverlay;
    if (typeof actualShowExportOverlay === 'function') {
        const showOverlay = actualShowExportOverlay as (jsonString: string) => void;
        mockShowExportOverlay = jest.fn((jsonString: string) => {
            const overlay = document.getElementById('exportJsonOverlay');
            if (overlay) {
                (overlay as HTMLElement).dataset.jsonString = jsonString;
            }
            showOverlay.call(window, jsonString);
        });
        win.showExportOverlay = mockShowExportOverlay;
    } else {
        mockShowExportOverlay = jest.fn((jsonString: string) => {
            const overlay = document.getElementById('exportJsonOverlay');
            if (overlay) {
                (overlay as HTMLElement).dataset.jsonString = jsonString;
            }
        });
        win.showExportOverlay = mockShowExportOverlay;
    }

    return {
        exportDeckAsJson: exportDeckAsJson as () => Promise<void>,
        getExportedJson: getExportedJsonFromDOM,
        mocks: {
            mockShowNotification,
            mockLoadAvailableCards,
            mockValidateDeck,
            mockShowExportOverlay
        }
    };
}

/**
 * Remove deck-export mocks from window and clear timers. Call in afterEach.
 */
export function teardownDeckExportMocks(win: Window & typeof globalThis): void {
    jest.runOnlyPendingTimers();
    jest.clearAllMocks();
    const w = win as unknown as Record<string, unknown>;
    for (const key of MOCK_NAMES) {
        delete w[key];
    }
}
