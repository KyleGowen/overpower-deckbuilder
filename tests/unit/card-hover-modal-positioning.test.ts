/** @jest-environment jsdom */

/**
 * Card Hover Modal - Positioning algorithm
 * Part of comprehensive card-hover-modal tests; uses cardHoverModalTestHelpers.
 */

declare global {
    interface Window {
        showCardHoverModal?: (imagePath: string, cardName: string, cardId?: string, cardType?: string) => void;
    }
}

import {
    setupCardHoverModalBootstrap,
    teardownCardHoverModalMocks,
    createMockMouseEvent
} from '../helpers/cardHoverModalTestHelpers';

/** MouseEvent with target; native closest() so collection rows resolve in jsdom. */
function collectionHoverMouseEvent(clientX: number, clientY: number, target: HTMLElement): MouseEvent {
    const e = new MouseEvent('mousemove', { bubbles: true, clientX, clientY });
    Object.defineProperty(e, 'target', { value: target, writable: false });
    (window as unknown as { event: MouseEvent }).event = e;
    (globalThis as unknown as { event: MouseEvent }).event = e;
    return e;
}

describe('Card Hover Modal - Positioning', () => {
    let mockModal: HTMLElement;
    let mockWindow: Window & typeof globalThis;

    beforeEach(() => {
        const setup = setupCardHoverModalBootstrap();
        mockModal = setup.mockModal;
        mockWindow = setup.mockWindow;
    });

    afterEach(() => {
        teardownCardHoverModalMocks(window);
    });

    describe('Positioning Algorithm - Basic Positioning', () => {
        it('should position modal at mouse + 80px offset', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            // Modal should be positioned at approximately 100 + 80 = 180px
            const left = parseInt(mockModal.style.left);
            const top = parseInt(mockModal.style.top);
            expect(left).toBeGreaterThanOrEqual(100);
            expect(top).toBeGreaterThanOrEqual(100);
        });

        it('should maintain minimum 100px distance from cursor', () => {
            const mockEvent = createMockMouseEvent(50, 50);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const left = parseInt(mockModal.style.left);
            const top = parseInt(mockModal.style.top);
            
            // Should be at least 100px away
            expect(Math.abs(left - 50)).toBeGreaterThanOrEqual(100);
            expect(Math.abs(top - 50)).toBeGreaterThanOrEqual(100);
        });
    });

    describe('Positioning Algorithm - Viewport Constraints', () => {
        it('should constrain modal to viewport left edge', () => {
            Object.defineProperty(mockWindow, 'innerWidth', { value: 1920, writable: true });
            const mockEvent = createMockMouseEvent(10, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const left = parseInt(mockModal.style.left);
            expect(left).toBeGreaterThanOrEqual(10);
        });

        it('should constrain modal to viewport top edge', () => {
            mockWindow.innerHeight = 1080;
            const mockEvent = createMockMouseEvent(100, 10);
            window.event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const top = parseInt(mockModal.style.top);
            expect(top).toBeGreaterThanOrEqual(10);
        });

        it('should constrain modal to viewport right edge', () => {
            mockWindow.innerWidth = 500; // Small viewport
            const mockEvent = createMockMouseEvent(400, 100);
            window.event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const left = parseInt(mockModal.style.left);
            const modalWidth = 320;
            expect(left + modalWidth).toBeLessThanOrEqual(500);
        });

        it('should constrain modal to viewport bottom edge', () => {
            Object.defineProperty(mockWindow, 'innerHeight', { value: 500, writable: true });
            const mockEvent = createMockMouseEvent(100, 400);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const top = parseInt(mockModal.style.top);
            const modalHeight = 450;
            expect(top + modalHeight).toBeLessThanOrEqual(500);
        });
    });

    describe('Positioning Algorithm - Deck Editor Card Button Avoidance', () => {
        it('should avoid deck editor card buttons', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'deck-card-editor-item';
            const button = document.createElement('button');
            button.className = 'quantity-btn';
            cardElement.appendChild(button);
            document.body.appendChild(cardElement);

            // Mock getBoundingClientRect for button
            const buttonRect = { left: 200, right: 250, top: 200, bottom: 250 };
            jest.spyOn(button, 'getBoundingClientRect').mockReturnValue(buttonRect as DOMRect);

            // Mock closest and querySelectorAll
            jest.spyOn(cardElement, 'querySelectorAll').mockReturnValue([button] as any);
            
            const mockEvent = createMockMouseEvent(225, 225, button);
            window.event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            // Modal should be positioned away from button
            const left = parseInt(mockModal.style.left);
            expect(left).not.toBe(225 + 80); // Should not be at default position
        });

        it('should handle multiple deck editor buttons', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'deck-card-editor-item';
            const button1 = document.createElement('button');
            button1.className = 'quantity-btn';
            const button2 = document.createElement('button');
            button2.className = 'reserve-btn';
            cardElement.appendChild(button1);
            cardElement.appendChild(button2);
            document.body.appendChild(cardElement);

            jest.spyOn(button1, 'getBoundingClientRect').mockReturnValue({ left: 200, right: 250, top: 200, bottom: 250 } as DOMRect);
            jest.spyOn(button2, 'getBoundingClientRect').mockReturnValue({ left: 260, right: 310, top: 200, bottom: 250 } as DOMRect);
            jest.spyOn(cardElement, 'querySelectorAll').mockReturnValue([button1, button2] as any);

            const mockEvent = createMockMouseEvent(255, 225, button1);
            window.event = mockEvent;

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test');
            }).not.toThrow();
        });
    });

    describe('Positioning Algorithm - Collection Card Button Avoidance', () => {
        it('should keep modal clear of the full collection quantity strip', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'collection-card-item';
            const actions = document.createElement('div');
            actions.className = 'collection-card-actions';
            const wrap = document.createElement('div');
            wrap.className = 'collection-quantity-control';
            const button = document.createElement('button');
            button.className = 'collection-quantity-btn';
            wrap.appendChild(button);
            actions.appendChild(wrap);
            cardElement.appendChild(actions);
            document.body.appendChild(cardElement);

            const controlRect = {
                left: 200,
                right: 400,
                top: 200,
                bottom: 240,
                width: 200,
                height: 40,
                x: 200,
                y: 200,
                toJSON: () => ({})
            };
            jest.spyOn(actions, 'getBoundingClientRect').mockReturnValue(controlRect as DOMRect);
            jest.spyOn(cardElement, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 500,
                top: 190,
                bottom: 270,
                width: 500,
                height: 80,
                x: 0,
                y: 190,
                toJSON: () => ({})
            } as DOMRect);

            // Target the row so closest('.collection-card-item') resolves reliably in jsdom
            const mockEvent = collectionHoverMouseEvent(260, 150, cardElement);
            window.event = mockEvent;

            // character uses landscape hover box (503×365) per card-hover-modal.js
            const modalWidth = 503;
            window.showCardHoverModal!('test.webp', 'Test', 'c1', 'character');

            const left = parseInt(mockModal.style.left, 10);
            const right = left + modalWidth;
            const inflatedLeft = controlRect.left - 14;
            const inflatedRight = controlRect.right + 14;
            const clearToTheLeft = right <= inflatedLeft + 2;
            const clearToTheRight = left >= inflatedRight - 2;
            expect(clearToTheLeft || clearToTheRight).toBe(true);
        });

        it('should handle collection card actions container', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'collection-card-item';
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'collection-card-actions';
            cardElement.appendChild(actionsContainer);
            document.body.appendChild(cardElement);

            const containerRect = {
                left: 200,
                right: 300,
                top: 200,
                bottom: 250,
                width: 100,
                height: 50,
                x: 200,
                y: 200,
                toJSON: () => ({})
            };
            jest.spyOn(actionsContainer, 'getBoundingClientRect').mockReturnValue(containerRect as DOMRect);

            const mockEvent = createMockMouseEvent(250, 225, actionsContainer);
            (window as any).event = mockEvent;

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test', 'c1', 'character');
            }).not.toThrow();
        });

        it('positions preview clear of controls when pointer is on name column (table row)', () => {
            Object.defineProperty(mockWindow, 'innerWidth', { value: 1200, writable: true });
            Object.defineProperty(mockWindow, 'innerHeight', { value: 800, writable: true });

            const row = document.createElement('tr');
            row.className = 'collection-card-item';
            const nameTd = document.createElement('td');
            nameTd.className = 'collection-card-name';
            const actionsTd = document.createElement('td');
            actionsTd.className = 'collection-card-actions';
            const qty = document.createElement('div');
            qty.className = 'collection-quantity-control';
            actionsTd.appendChild(qty);
            row.appendChild(nameTd);
            row.appendChild(actionsTd);
            const table = document.createElement('table');
            const tbody = document.createElement('tbody');
            tbody.appendChild(row);
            table.appendChild(tbody);
            document.body.appendChild(table);

            jest.spyOn(actionsTd, 'getBoundingClientRect').mockReturnValue({
                left: 900,
                right: 1100,
                top: 200,
                bottom: 240,
                width: 200,
                height: 40,
                x: 900,
                y: 200,
                toJSON: () => ({})
            } as DOMRect);
            jest.spyOn(row, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 1200,
                top: 195,
                bottom: 265,
                width: 1200,
                height: 70,
                x: 0,
                y: 195,
                toJSON: () => ({})
            } as DOMRect);

            const mockEvent = collectionHoverMouseEvent(500, 150, row);
            (window as any).event = mockEvent;

            const modalWidth = 503;
            window.showCardHoverModal!('test.webp', 'Test', 'c1', 'character');

            const left = parseInt(mockModal.style.left, 10);
            const avoidLeft = 900 - 14;
            expect(left + modalWidth).toBeLessThanOrEqual(avoidLeft + 2);
        });
    });

    describe('Positioning Algorithm - Available Card Button Avoidance', () => {
        it('should avoid card-item plus button', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            const plusButton = document.createElement('button');
            plusButton.className = 'card-item-plus';
            cardElement.appendChild(plusButton);
            document.body.appendChild(cardElement);

            const buttonRect = { left: 200, right: 230, top: 200, bottom: 230 };
            jest.spyOn(plusButton, 'getBoundingClientRect').mockReturnValue(buttonRect as DOMRect);
            jest.spyOn(cardElement, 'querySelector').mockReturnValue(plusButton);

            const mockEvent = createMockMouseEvent(215, 215, plusButton);
            window.event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const left = parseInt(mockModal.style.left);
            expect(left).not.toBe(215 + 80);
        });
    });
});
