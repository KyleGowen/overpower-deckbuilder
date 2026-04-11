/**
 * Shared setup, teardown, and utilities for card-hover-modal unit tests
 * that use the real public/js/card-hover-modal.js and jsdom.
 */

import fs from 'fs';
import path from 'path';

declare global {
    interface HTMLElement {
        _mouseMoveHandler?: ((e: MouseEvent) => void) | null;
    }
}

/**
 * Create a mock MouseEvent for positioning and showCardHoverModal tests.
 * Optional third argument is the event target (e.g. a button element).
 */
export function createMockMouseEvent(clientX: number, clientY: number, target?: HTMLElement): MouseEvent {
    const event = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY
    });

    Object.defineProperty(event, 'target', {
        value: target ?? document.body,
        writable: false
    });

    (window as unknown as { event?: MouseEvent }).event = event;
    try {
        (globalThis as unknown as { event?: MouseEvent }).event = event;
    } catch {
        /* ignore */
    }

    if (target) {
        (target as HTMLElement & { closest: (s: string) => Element | null }).closest = jest.fn((selector: string) => {
            if (selector.includes(target.className)) {
                return target;
            }
            return null;
        });
    }

    return event;
}

export interface CardHoverModalSetupResult {
    mockModal: HTMLElement;
    mockImage: HTMLImageElement;
    mockCaption: HTMLElement;
    mockWindow: Window & typeof globalThis;
    addEventListenerSpy: jest.SpyInstance;
    removeEventListenerSpy: jest.SpyInstance;
    clearTimeoutSpy: jest.SpyInstance;
    setTimeoutSpy: jest.SpyInstance;
}

const MOCK_NAMES = [
    'showCardHoverModal',
    'hideCardHoverModal',
    'hoverHideTimeout',
    'deckEditorCards',
    'availableCardsMap',
    'currentDeckData'
] as const;

/**
 * Set up DOM, window mocks, and execute card-hover-modal.js.
 * Call in beforeEach; use teardownCardHoverModalMocks in afterEach.
 */
export function setupCardHoverModalBootstrap(): CardHoverModalSetupResult {
    const cardHoverModalPath = path.join(__dirname, '../../public/js/card-hover-modal.js');
    const cardHoverModalCode = fs.readFileSync(cardHoverModalPath, 'utf-8');
    new Function(cardHoverModalCode)();

    const mockModal = document.createElement('div');
    mockModal.id = 'cardHoverModal';
    mockModal.style.display = 'none';
    mockModal.style.left = '0px';
    mockModal.style.top = '0px';
    document.body.appendChild(mockModal);

    const mockImage = document.createElement('img');
    mockImage.id = 'cardHoverImage';
    mockImage.src = '';
    mockModal.appendChild(mockImage);

    const mockCaption = document.createElement('div');
    mockCaption.id = 'cardHoverCaption';
    mockCaption.textContent = '';
    mockModal.appendChild(mockCaption);

    const mockWindow = window as Window & typeof globalThis;
    Object.defineProperty(mockWindow, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(mockWindow, 'innerHeight', { value: 1080, writable: true });
    const win = window as unknown as Record<string, unknown>;
    win.hoverHideTimeout = null;
    win.deckEditorCards = [];
    win.availableCardsMap = new Map();

    const g = global as unknown as Record<string, unknown>;
    g.getCurrentUser = jest.fn(() => ({
        id: 'test-admin-id',
        name: 'Test Admin',
        role: 'ADMIN'
    }));

    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');

    jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'cardHoverModal') return mockModal;
        if (id === 'cardHoverImage') return mockImage;
        if (id === 'cardHoverCaption') return mockCaption;
        if (id === 'cardHoverStats') {
            let stats = mockModal.querySelector('#cardHoverStats');
            if (!stats) {
                stats = document.createElement('div');
                stats.id = 'cardHoverStats';
                mockModal.appendChild(stats);
            }
            return stats as HTMLElement;
        }
        return null;
    });

    return {
        mockModal,
        mockImage,
        mockCaption,
        mockWindow,
        addEventListenerSpy,
        removeEventListenerSpy,
        clearTimeoutSpy,
        setTimeoutSpy
    };
}

/**
 * Remove card-hover-modal mocks and restore document. Call in afterEach.
 */
export function teardownCardHoverModalMocks(win: Window & typeof globalThis): void {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
    const w = win as unknown as Record<string, unknown>;
    for (const key of MOCK_NAMES) {
        delete w[key];
    }
    w.event = undefined;
    try {
        if (typeof globalThis !== 'undefined') {
            (globalThis as unknown as { event?: unknown }).event = undefined;
        }
    } catch {
        /* ignore */
    }
}
