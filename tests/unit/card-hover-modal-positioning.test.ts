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
        it('should avoid collection card buttons', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'collection-card-item';
            const button = document.createElement('button');
            button.className = 'collection-quantity-btn';
            cardElement.appendChild(button);
            document.body.appendChild(cardElement);

            const buttonRect = { left: 200, right: 250, top: 200, bottom: 250 };
            jest.spyOn(button, 'getBoundingClientRect').mockReturnValue(buttonRect as DOMRect);
            jest.spyOn(cardElement, 'querySelectorAll').mockReturnValue([button] as any);

            const mockEvent = createMockMouseEvent(225, 225, button);
            window.event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            const left = parseInt(mockModal.style.left);
            expect(left).not.toBe(225 + 80);
        });

        it('should handle collection card actions container', () => {
            const cardElement = document.createElement('div');
            cardElement.className = 'collection-card-item';
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'collection-card-actions';
            cardElement.appendChild(actionsContainer);
            document.body.appendChild(cardElement);

            const containerRect = { left: 200, right: 300, top: 200, bottom: 250 };
            jest.spyOn(actionsContainer, 'getBoundingClientRect').mockReturnValue(containerRect as DOMRect);
            jest.spyOn(cardElement, 'querySelector').mockReturnValue(actionsContainer);

            const mockEvent = createMockMouseEvent(250, 225, actionsContainer);
            (window as any).event = mockEvent;

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test');
            }).not.toThrow();
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
