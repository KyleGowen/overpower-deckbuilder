/**
 * Shared setup and teardown for draw-hand KO dimming unit tests that use
 * the real public/js/components/simulate-ko.js and jsdom.
 */

import fs from 'fs';
import path from 'path';

// Polyfill for TextEncoder/TextDecoder if needed
if (typeof global.TextEncoder === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional polyfill
    const { TextEncoder, TextDecoder } = require('util');
    const g = global as unknown as Record<string, unknown>;
    g.TextEncoder = TextEncoder;
    g.TextDecoder = TextDecoder;
}

const MOCK_NAMES = ['SimulateKO', 'availableCardsMap', 'deckEditorCards', 'koCharacters'] as const;

export interface DrawHandKoDimmingSetupResult {
    mockAvailableCardsMap: Map<string, unknown>;
    /** Deck editor card entries used by simulate-ko (shape varies by test). */
    mockDeckEditorCards: unknown[];
}

/**
 * Load simulate-ko.js, set window globals, and call SimulateKO.init().
 * Call in beforeEach; use teardownDrawHandKoDimmingMocks in afterEach.
 */
export function setupDrawHandKoDimmingBootstrap(): DrawHandKoDimmingSetupResult {
    const simulateKOPath = path.join(__dirname, '../../public/js/components/simulate-ko.js');
    const simulateKOCode = fs.readFileSync(simulateKOPath, 'utf-8');
    new Function(simulateKOCode)();

    const mockAvailableCardsMap = new Map<string, unknown>();
    const mockDeckEditorCards: unknown[] = [];
    const w = window as unknown as Record<string, unknown>;
    w.availableCardsMap = mockAvailableCardsMap;
    w.deckEditorCards = mockDeckEditorCards;
    w.koCharacters = new Set<string>();

    if (w.SimulateKO && typeof (w.SimulateKO as { init?: () => void }).init === 'function') {
        (w.SimulateKO as { init: () => void }).init();
    }
    if (w.koCharacters instanceof Set) {
        (w.koCharacters as Set<string>).clear();
    }

    return { mockAvailableCardsMap, mockDeckEditorCards };
}

/**
 * Remove simulate-ko mocks from window. Call in afterEach.
 */
export function teardownDrawHandKoDimmingMocks(win: Window & typeof globalThis): void {
    const w = win as unknown as Record<string, unknown>;
    for (const key of MOCK_NAMES) {
        delete w[key];
    }
}
