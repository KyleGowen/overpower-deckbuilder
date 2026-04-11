/** @jest-environment jsdom */

/**
 * Card Hover Modal - Module init, showCardHoverModal, hideCardHoverModal
 * Part of comprehensive card-hover-modal tests; uses cardHoverModalTestHelpers.
 */

declare global {
    interface Window {
        showCardHoverModal?: (imagePath: string, cardName: string, cardId?: string, cardType?: string) => void;
        hideCardHoverModal?: () => void;
        hoverHideTimeout?: NodeJS.Timeout | null;
    }
}

import {
    setupCardHoverModalBootstrap,
    teardownCardHoverModalMocks,
    createMockMouseEvent
} from '../helpers/cardHoverModalTestHelpers';

describe('Card Hover Modal - Init and Show/Hide', () => {
    let mockModal: HTMLElement;
    let mockImage: HTMLImageElement;
    let mockCaption: HTMLElement;
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;
    let clearTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
        const setup = setupCardHoverModalBootstrap();
        mockModal = setup.mockModal;
        mockImage = setup.mockImage;
        mockCaption = setup.mockCaption;
        addEventListenerSpy = setup.addEventListenerSpy;
        removeEventListenerSpy = setup.removeEventListenerSpy;
        clearTimeoutSpy = setup.clearTimeoutSpy;
    });

    afterEach(() => {
        teardownCardHoverModalMocks(window);
    });

    describe('Module Initialization', () => {
        it('should attach showCardHoverModal to window object', () => {
            expect(typeof window.showCardHoverModal).toBe('function');
        });

        it('should attach hideCardHoverModal to window object', () => {
            expect(typeof window.hideCardHoverModal).toBe('function');
        });

        it('should have correct function signatures', () => {
            expect(window.showCardHoverModal?.length).toBe(5); // imagePath, cardName, cardId (optional), cardType (optional), isFoil (optional)
            expect(window.hideCardHoverModal?.length).toBe(0); // no parameters
        });
    });

    describe('showCardHoverModal() - Basic Functionality', () => {
        it('should set image source when modal elements exist', () => {
            const imagePath = 'characters/hercules.webp';
            const cardName = 'Hercules';
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!(imagePath, cardName);

            expect(mockImage.src).toContain(imagePath);
        });

        it('should display card name in caption', () => {
            mockCaption.textContent = 'Previous text';
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockCaption.textContent).toBe('Test');
        });

        it('should display modal', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockModal.style.display).toBe('block');
        });

        it('should not throw error when modal elements are missing', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test');
            }).not.toThrow();
        });

        it('should not display modal when elements are missing', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);
            mockModal.style.display = 'none';
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockModal.style.display).toBe('none');
        });

        it('should update image when hovering a second card (no lock to first)', () => {
            const pathA = '/src/resources/cards/images/specials/card_a.webp';
            const pathB = '/src/resources/cards/images/specials/card_b.webp';
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!(pathA, 'Card A');
            expect(mockImage.src).toContain('card_a.webp');

            window.showCardHoverModal!(pathB, 'Card B');
            expect(mockImage.src).toContain('card_b.webp');
            expect(mockImage.src).not.toContain('card_a.webp');
        });
    });

    describe('showCardHoverModal() - Timeout Management', () => {
        it('should clear existing hide timeout when showing modal', () => {
            const mockTimeout = setTimeout(() => {}, 100) as any;
            window.hoverHideTimeout = mockTimeout;
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            expect(clearTimeoutSpy).toHaveBeenCalledWith(mockTimeout);
            expect(window.hoverHideTimeout).toBeNull();
        });

        it('should handle null timeout gracefully', () => {
            window.hoverHideTimeout = null;
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test');
            }).not.toThrow();
        });
    });

    describe('showCardHoverModal() - Image Event Handlers', () => {
        it('should attach onerror handler to image', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockImage.onerror).toBeDefined();
            expect(typeof mockImage.onerror).toBe('function');
        });

        it('should attach onload handler to image', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockImage.onload).toBeDefined();
            expect(typeof mockImage.onload).toBe('function');
        });

        it('should handle image error without throwing', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(() => {
                if (mockImage.onerror) {
                    (mockImage.onerror as any)();
                }
            }).not.toThrow();
        });

        it('should handle image load without throwing', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test');

            expect(() => {
                if (mockImage.onload) {
                    (mockImage.onload as any)();
                }
            }).not.toThrow();
        });
    });

    describe('showCardHoverModal() - Event Listener Management', () => {
        it('should attach mousemove event listener', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        });

        it('should store mousemove handler on modal element', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            expect(mockModal._mouseMoveHandler).toBeDefined();
            expect(typeof mockModal._mouseMoveHandler).toBe('function');
        });

        it('should update modal position on mousemove', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');

            // Simulate mousemove
            const moveEvent = createMockMouseEvent(200, 200);
            if (mockModal._mouseMoveHandler) {
                mockModal._mouseMoveHandler(moveEvent);
            }

            // Modal should be positioned (not at 0,0)
            expect(mockModal.style.left).not.toBe('0px');
            expect(mockModal.style.top).not.toBe('0px');
        });

        it('does not throw when no hover event is available (strict mode; no arguments.callee)', () => {
            (window as any).event = undefined;
            try {
                (globalThis as unknown as { event?: undefined }).event = undefined;
            } catch {
                /* ignore */
            }

            expect(() => {
                window.showCardHoverModal!('test.webp', 'Test');
            }).not.toThrow();
        });
    });

    describe('hideCardHoverModal() - Basic Functionality', () => {
        it('should hide modal after timeout', (done) => {
            mockModal.style.display = 'block';

            window.hideCardHoverModal!();

            setTimeout(() => {
                expect(mockModal.style.display).toBe('none');
                done();
            }, 150);
        });

        it('should clear existing timeout before setting new one', () => {
            const existingTimeout = setTimeout(() => {}, 100) as any;
            window.hoverHideTimeout = existingTimeout;

            window.hideCardHoverModal!();

            expect(clearTimeoutSpy).toHaveBeenCalledWith(existingTimeout);
        });

        it('should handle missing modal gracefully', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(null);

            expect(() => {
                window.hideCardHoverModal!();
            }).not.toThrow();
        });
    });

    describe('hideCardHoverModal() - Event Listener Cleanup', () => {
        it('should remove mousemove listener on hide', (done) => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;

            window.showCardHoverModal!('test.webp', 'Test');
            const handler = mockModal._mouseMoveHandler;

            window.hideCardHoverModal!();

            setTimeout(() => {
                expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', handler);
                expect(mockModal._mouseMoveHandler).toBeNull();
                done();
            }, 150);
        });

        it('should handle missing handler gracefully', (done) => {
            mockModal._mouseMoveHandler = null;

            window.hideCardHoverModal!();

            setTimeout(() => {
                expect(removeEventListenerSpy).not.toHaveBeenCalled();
                done();
            }, 150);
        });
    });
});
