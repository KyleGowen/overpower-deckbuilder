/** @jest-environment jsdom */

/**
 * Card Hover Modal - Statistics display (threat, duplicate probability, etc.)
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

describe('Card Hover Modal - Statistics Display', () => {
    let mockModal: HTMLElement;

    beforeEach(() => {
        const setup = setupCardHoverModalBootstrap();
        mockModal = setup.mockModal;
    });

    afterEach(() => {
        teardownCardHoverModalMocks(window);
    });

    describe('Statistics Display', () => {
        let mockStats: HTMLElement;
        let mockDeckEditorCards: any[];
        let mockAvailableCardsMap: Map<string, any>;

        beforeEach(() => {
            // Get or create stats element
            let statsElement = document.getElementById('cardHoverStats');
            if (!statsElement) {
                statsElement = document.createElement('div');
                statsElement.id = 'cardHoverStats';
                statsElement.style.display = 'none';
                mockModal.appendChild(statsElement);
            }
            mockStats = statsElement;

            mockDeckEditorCards = [];
            mockAvailableCardsMap = new Map();
            
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
        });

        it('should display threat level for characters', () => {
            const cardId = 'char-123';
            const cardType = 'character';
            const cardName = 'Virginia Fighting Man';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 18 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Virginia Fighting Man');
            expect(mockStats.innerHTML).toContain('Threat: 18');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display threat level for locations', () => {
            const cardId = 'loc-123';
            const cardType = 'location';
            const cardName = 'Test Location';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 2 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Location');
            expect(mockStats.innerHTML).toContain('Threat: 2');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display threat level 0 for locations', () => {
            const cardId = 'loc-123';
            const cardType = 'location';
            const cardName = 'Test Location';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 0 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Location');
            expect(mockStats.innerHTML).toContain('Threat: 0');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display only card name for mission cards (no threat level)', () => {
            const cardId = 'mission-123';
            const cardType = 'mission';
            const cardName = 'Test Mission';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 3 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Mission');
            expect(mockStats.innerHTML).not.toContain('Threat:');
            expect(mockStats.style.display).toBe('block');
        });

        it('should not show card counts for mission cards', () => {
            const cardId = 'mission-123';
            const cardType = 'mission';
            const cardName = 'Test Mission';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 2 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            // Add some draw pile cards
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 3 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            // Should show only card name, not count format (count format would be "2/5")
            expect(mockStats.innerHTML).toContain('Test Mission');
            expect(mockStats.innerHTML).not.toMatch(/\d+\/\d+/); // Should not contain count format like "2/5"
            expect(mockStats.innerHTML).not.toContain('Threat:'); // Should not contain threat level
            expect(mockStats.style.display).toBe('block');
        });

        it('should display power card format with value', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, value: 3 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            // Add another power card with same value
            mockDeckEditorCards.push({ cardId: 'power-456', type: 'power', quantity: 1 });
            mockAvailableCardsMap.set('power-456', { name: 'Power 3', value: 3 });
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 3');
            expect(mockStats.innerHTML).toContain('3 Power Cards of Value 3 / 4 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display power card format correctly for single power card of a value', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 5';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 5');
            expect(mockStats.innerHTML).toContain('1 Power Cards of Value 5 / 2 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should only count power cards with matching value', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, value: 3 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            // Add power card with different value
            mockDeckEditorCards.push({ cardId: 'power-789', type: 'power', quantity: 1 });
            mockAvailableCardsMap.set('power-789', { name: 'Power 5', value: 5 });
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 3');
            expect(mockStats.innerHTML).toContain('2 Power Cards of Value 3 / 4 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for special cards', () => {
            const cardId = 'special-123';
            const cardType = 'special';
            const cardName = 'Test Special';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Special');
            expect(mockStats.innerHTML).toContain('2 Copies / 3 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of special card', () => {
            const cardId = 'special-123';
            const cardType = 'special';
            const cardName = 'Test Special';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Special');
            expect(mockStats.innerHTML).toContain('1 Copy / 2 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for ally-universe cards', () => {
            const cardId = 'ally-123';
            const cardType = 'ally-universe';
            const cardName = 'Test Ally';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Ally');
            expect(mockStats.innerHTML).toContain('2 Copies / 4 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of ally-universe card', () => {
            const cardId = 'ally-123';
            const cardType = 'ally-universe';
            const cardName = 'Test Ally';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Ally');
            expect(mockStats.innerHTML).toContain('1 Copy / 3 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for basic-universe cards', () => {
            const cardId = 'basic-123';
            const cardType = 'basic-universe';
            const cardName = 'Test Basic';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 3 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Basic');
            expect(mockStats.innerHTML).toContain('3 Copies / 4 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of basic-universe card', () => {
            const cardId = 'basic-123';
            const cardType = 'basic-universe';
            const cardName = 'Test Basic';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Basic');
            expect(mockStats.innerHTML).toContain('1 Copy / 2 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for training cards', () => {
            const cardId = 'training-123';
            const cardType = 'training';
            const cardName = 'Test Training';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Training');
            expect(mockStats.innerHTML).toContain('2 Copies / 3 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of training card', () => {
            const cardId = 'training-123';
            const cardType = 'training';
            const cardName = 'Test Training';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Training');
            expect(mockStats.innerHTML).toContain('1 Copy / 2 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of aspect card', () => {
            const cardId = 'aspect-123';
            const cardType = 'aspect';
            const cardName = 'Test Aspect';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Aspect');
            expect(mockStats.innerHTML).toContain('1 Copy / 3 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for multiple aspect cards', () => {
            const cardId = 'aspect-123';
            const cardType = 'aspect';
            const cardName = 'Test Aspect';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Aspect');
            expect(mockStats.innerHTML).toContain('2 Copies / 3 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copies format for advanced-universe cards', () => {
            const cardId = 'advanced-123';
            const cardType = 'advanced-universe';
            const cardName = 'Test Advanced';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Advanced');
            expect(mockStats.innerHTML).toContain('2 Copies / 3 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display Copy (singular) for single copy of advanced-universe card', () => {
            const cardId = 'advanced-123';
            const cardType = 'advanced-universe';
            const cardName = 'Test Advanced';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Advanced');
            expect(mockStats.innerHTML).toContain('1 Copy / 2 Cards in Draw Pile');
            expect(mockStats.innerHTML).not.toContain('1 Copies');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display event count format for event cards', () => {
            const cardId = 'event-123';
            const cardType = 'event';
            const cardName = 'Test Event';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            // Add multiple event cards
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'event-456', type: 'event', quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'event-789', type: 'event', quantity: 1 });
            // Add other draw pile cards
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 3 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            // Should show "4 Events / 9 Cards in Draw Pile" (4 total events, 9 total draw pile cards including events)
            expect(mockStats.innerHTML).toContain('Test Event');
            expect(mockStats.innerHTML).toContain('4 Events / 9 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should display event count format correctly for single event', () => {
            const cardId = 'event-123';
            const cardType = 'event';
            const cardName = 'Test Event';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Test Event');
            expect(mockStats.innerHTML).toContain('1 Events / 3 Cards in Draw Pile');
            expect(mockStats.style.display).toBe('block');
        });

        it('should apply reserve character threat adjustments', () => {
            const cardId = 'char-victory';
            const cardType = 'character';
            const cardName = 'Victory Harben';
            
            mockAvailableCardsMap.set(cardId, { name: cardName, threat_level: 18 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            (window as any).currentDeckData = {
                metadata: { reserve_character: cardId }
            };
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Victory Harben');
            expect(mockStats.innerHTML).toContain('Threat: 20'); // Adjusted from 18 to 20
        });

        it('should display count format correctly for single copy', () => {
            const cardId = 'power-456';
            const cardType = 'power';
            const cardName = 'Power 5';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            mockDeckEditorCards.push({ cardId: 'power-789', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 5');
            expect(mockStats.innerHTML).toContain('1/3'); // 1 copy / 3 draw pile cards total
        });

        it('should sum quantities for multiple instances of same card', () => {
            const cardId = 'power-456';
            const cardType = 'power';
            const cardName = 'Power 5';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push(
                { cardId, type: cardType, quantity: 2 },
                { cardId, type: cardType, quantity: 1 }
            );
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 5');
            expect(mockStats.innerHTML).toContain('3/4'); // 3 copies / 4 draw pile cards total
        });

        it('should hide statistics when character has no threat level', () => {
            const cardId = 'char-123';
            const cardType = 'character';
            const cardName = 'Hercules';
            
            mockAvailableCardsMap.set(cardId, { name: cardName }); // No threat_level
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.style.display).toBe('none');
        });

        it('should hide statistics when draw pile card not in deck', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            // No cards in deckEditorCards
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.style.display).toBe('none');
        });

        it('should hide statistics when cardId not provided', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test Card');
            
            expect(mockStats.style.display).toBe('none');
        });

        it('should hide statistics when cardType not provided', () => {
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Test Card', 'char-123');
            
            expect(mockStats.style.display).toBe('none');
        });

        it('should use card_name from availableCardsMap when name not available for character', () => {
            const cardId = 'char-123';
            const cardType = 'character';
            const cardName = 'Virginia Fighting Man';
            
            mockAvailableCardsMap.set(cardId, { card_name: cardName, threat_level: 18 });
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', 'Fallback Name', cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Virginia Fighting Man');
            expect(mockStats.innerHTML).toContain('Threat: 18');
        });

        it('should fallback to provided cardName when character not in availableCardsMap', () => {
            const cardId = 'char-123';
            const cardType = 'character';
            const cardName = 'Virginia Fighting Man';
            
            // No entry in availableCardsMap (no threat_level, so stats will be hidden)
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            // Character without threat_level should hide stats
            expect(mockStats.style.display).toBe('none');
        });

        it('should fallback to provided cardName when draw pile card not in availableCardsMap', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            // No entry in availableCardsMap
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'power-1', type: 'power', quantity: 2 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 3');
            expect(mockStats.innerHTML).toContain('2/4'); // 2 copies / 4 draw pile cards
        });

        it('should only count cards with matching cardId and type', () => {
            const cardId = 'power-456';
            const cardType = 'power';
            const cardName = 'Power 5';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push(
                { cardId, type: cardType, quantity: 2 },
                { cardId: 'power-789', type: cardType, quantity: 1 }, // Different cardId
                { cardId, type: 'special', quantity: 1 } // Different type (but still in draw pile)
            );
            mockDeckEditorCards.push({ cardId: 'special-2', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 5');
            // Draw pile: power-456 (power, 2) + power-789 (power, 1) + power-456 (special, 1) + special-2 (special, 1) = 5
            expect(mockStats.innerHTML).toContain('2/5'); // 2 copies / 5 draw pile cards total
        });

        describe('Duplicate Probability Calculations', () => {
            describe('Special Cards', () => {
                it('should calculate duplicate probability for special cards with same character and name', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card';
                    const character = 'Hercules';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, character: character });
                    // Add 3 copies of the same special card
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'special-other', type: cardType, quantity: 1, exclude_from_draw: false },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                    // With 3 copies in a draw pile of 14, probability should be > 0
                    expect(mockStats.innerHTML).toMatch(/Duplication Risk: \d+\.\d+% of Hands/);
                });

                it('should not count special cards with same character but different name as duplicates', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card A';
                    const character = 'Hercules';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, character: character });
                    mockAvailableCardsMap.set('special-456', { name: 'Special Card B', character: character });
                    
                    // Add 1 copy of card A and 1 copy of card B (same character, different name)
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'special-456', type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should show 0% duplicate risk since they're different cards
                    expect(mockStats.innerHTML).toContain('Duplication Risk: 0.0% of Hands');
                });

                it('should not count special cards with different character as duplicates', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, character: 'Hercules' });
                    mockAvailableCardsMap.set('special-456', { name: cardName, character: 'Batman' });
                    
                    // Same name, different character
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'special-456', type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('0.0% of Hands');
                });
            });

            describe('Teamwork Cards', () => {
                it('should calculate duplicate probability for teamwork cards with same to_use and followup_attack_types', () => {
                    const cardId = 'teamwork-123';
                    const cardType = 'teamwork';
                    const cardName = 'Teamwork Card';
                    
                    mockAvailableCardsMap.set(cardId, { 
                        name: cardName, 
                        to_use: '6 Energy',
                        followup_attack_types: 'Brute Force + Energy'
                    });
                    
                    // Add 2 copies of the same teamwork card
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                    expect(mockStats.innerHTML).toMatch(/Duplication Risk: \d+\.\d+% of Hands/);
                });

                it('should not count teamwork cards with same to_use but different followup_attack_types as duplicates', () => {
                    const cardId = 'teamwork-123';
                    const cardType = 'teamwork';
                    const cardName = 'Teamwork Card';
                    
                    mockAvailableCardsMap.set(cardId, { 
                        name: cardName, 
                        to_use: '6 Energy',
                        followup_attack_types: 'Brute Force + Energy'
                    });
                    mockAvailableCardsMap.set('teamwork-456', { 
                        name: cardName, 
                        to_use: '6 Energy',
                        followup_attack_types: 'Combat + Intelligence'
                    });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'teamwork-456', type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('0.0% of Hands');
                });
            });

            describe('Power Cards', () => {
                it('should calculate duplicate probability for power cards with same value', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Combat', value: 5 });
                    mockAvailableCardsMap.set('power-789', { name: 'Power 5 Energy', value: 5 });
                    
                    // Add multiple power cards with value 5
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 1 },
                        { cardId: 'power-789', type: cardType, quantity: 1 },
                        { cardId: 'power-999', type: cardType, quantity: 5, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('of Hands');
                    // With 4 power cards of value 5 in draw pile, probability should be > 0
                    expect(mockStats.innerHTML).toMatch(/\d+\.\d+% of Hands/);
                });

                it('should not count power cards with different values as duplicates', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 3', value: 3 });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'power-456', type: cardType, quantity: 1 },
                        { cardId: 'special-1', type: 'special', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('0.0% of Hands');
                });
            });

            describe('Event Cards', () => {
                it('should calculate duplicate probability for event cards (all events are duplicates)', () => {
                    const cardId = 'event-123';
                    const cardType = 'event';
                    const cardName = 'Event Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    mockAvailableCardsMap.set('event-456', { name: 'Other Event' });
                    
                    // Add multiple event cards
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'event-456', type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('of Hands');
                    // With 3 events total, probability should be > 0
                    expect(mockStats.innerHTML).toMatch(/\d+\.\d+% of Hands/);
                });

                it('should show 0% duplicate risk when only one event exists', () => {
                    const cardId = 'event-123';
                    const cardType = 'event';
                    const cardName = 'Event Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    // Only one event
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('0.0% of Hands');
                });
            });

            describe('Other Universe Cards', () => {
                it('should calculate duplicate probability for ally-universe cards', () => {
                    const cardId = 'ally-123';
                    const cardType = 'ally-universe';
                    const cardName = 'Ally Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    // Add 2 copies
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                    expect(mockStats.innerHTML).toMatch(/Duplication Risk: \d+\.\d+% of Hands/);
                });

                it('should calculate duplicate probability for aspect cards', () => {
                    const cardId = 'aspect-123';
                    const cardType = 'aspect';
                    const cardName = 'Aspect Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'power-1', type: 'power', quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                    expect(mockStats.innerHTML).toMatch(/Duplication Risk: \d+\.\d+% of Hands/);
                });
            });

            describe('Edge Cases', () => {
                it('should handle draw pile smaller than hand size', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Only 5 cards in draw pile (hand size is 8)
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 3, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Other', value: 5 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // With draw pile smaller than hand size and duplicates exist, should show 100%
                    expect(mockStats.innerHTML).toContain('of Hands');
                });

                it('should show 0% when no duplicates possible', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 3', value: 3 });
                    
                    // Only one copy of this power card
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'power-456', type: cardType, quantity: 10, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('0.0% of Hands');
                });

                it('should use hand size 8 even when events are present', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Add events - hand size should still be 8 for duplicate calculations
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'event-1', type: 'event', quantity: 1 },
                        { cardId: 'power-456', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Other', value: 5 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('of Hands');
                    // Hand size should always be 8 for duplicate calculations (events don't change this)
                    expect(mockStats.innerHTML).toMatch(/\d+\.\d+% of Hands/);
                });

                it('should exclude cards with exclude_from_draw: true from calculations', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Add cards including some excluded from draw
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 1, exclude_from_draw: true }, // Excluded
                        { cardId: 'power-789', type: cardType, quantity: 1, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-789', { name: 'Power 5 Other', value: 5 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should only count non-excluded cards in draw pile
                    expect(mockStats.innerHTML).toContain('of Hands');
                });
            });
        });

        describe('Placed First Hand Duplicate Probability', () => {
            describe('Power Cards', () => {
                it('should calculate placed first hand probability for power cards with 2+ duplicates', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Combat', value: 5 });
                    
                    // Add 3 power cards of value 5 (total duplicates = 3)
                    // Draw pile size = 20 (enough for calculation)
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 1 },
                        { cardId: 'power-999', type: 'power', quantity: 17, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                    expect(mockStats.innerHTML).toMatch(/Chance to duplicate if placed first hand: \d+\.\d+% of Hands/);
                });

                it('should show 0% for power cards with only 1 duplicate', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Only 1 power card of value 5
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'power-999', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand: 0.0% of Hands');
                });

                it('should handle power cards without value (fallback to cardId)', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    // No value property
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    // Add 2 copies of same cardId
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-999', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });
            });

            describe('Special Cards', () => {
                it('should calculate placed first hand probability for special cards with 2+ copies', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card';
                    const character = 'Hercules';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, character: character });
                    
                    // Add 3 copies of the same special card
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                    expect(mockStats.innerHTML).toMatch(/Chance to duplicate if placed first hand: \d+\.\d+% of Hands/);
                });

                it('should show 0% for special cards with only 1 copy', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 1 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand: 0.0% of Hands');
                });
            });

            describe('Universe Cards', () => {
                it('should calculate placed first hand probability for ally-universe cards', () => {
                    const cardId = 'ally-123';
                    const cardType = 'ally-universe';
                    const cardName = 'Ally Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                    expect(mockStats.innerHTML).toMatch(/Chance to duplicate if placed first hand: \d+\.\d+% of Hands/);
                });

                it('should calculate placed first hand probability for basic-universe cards', () => {
                    const cardId = 'basic-123';
                    const cardType = 'basic-universe';
                    const cardName = 'Basic Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });

                it('should calculate placed first hand probability for training cards', () => {
                    const cardId = 'training-123';
                    const cardType = 'training';
                    const cardName = 'Training Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });

                it('should calculate placed first hand probability for aspect cards', () => {
                    const cardId = 'aspect-123';
                    const cardType = 'aspect';
                    const cardName = 'Aspect Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });

                it('should calculate placed first hand probability for advanced-universe cards', () => {
                    const cardId = 'advanced-123';
                    const cardType = 'advanced-universe';
                    const cardName = 'Advanced Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });
            });

            describe('Teamwork Cards', () => {
                it('should calculate placed first hand probability for teamwork cards', () => {
                    const cardId = 'teamwork-123';
                    const cardType = 'teamwork';
                    const cardName = 'Teamwork Card';
                    
                    mockAvailableCardsMap.set(cardId, { 
                        name: cardName, 
                        to_use: '6 Energy',
                        followup_attack_types: 'Brute Force + Energy'
                    });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });
            });

            describe('Event Cards', () => {
                it('should NOT show placed first hand statistic for event cards', () => {
                    const cardId = 'event-123';
                    const cardType = 'event';
                    const cardName = 'Event Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Event cards cannot be placed, so this statistic should not appear
                    expect(mockStats.innerHTML).not.toContain('Chance to duplicate if placed first hand:');
                    // But duplication risk should still appear
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                });
            });

            describe('Edge Cases', () => {
                it('should handle draw pile smaller than 8 cards', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Combat', value: 5 });
                    
                    // Only 5 cards total (less than 8 for first hand)
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 3, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should handle gracefully (remaining draw pile would be negative, so returns null)
                    // Statistic should not appear or should handle null
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                });

                it('should handle remaining draw pile smaller than hand size', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    mockAvailableCardsMap.set('power-456', { name: 'Power 5 Combat', value: 5 });
                    
                    // 10 cards total: after removing 8, remaining = 2 (less than hand size of 8)
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-456', type: cardType, quantity: 1 },
                        { cardId: 'power-999', type: 'power', quantity: 7, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should handle gracefully (returns 100% if duplicates exist, 0% otherwise)
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });

                it('should handle card not found in deckEditorCards', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Card not in deckEditorCards
                    mockDeckEditorCards.push(
                        { cardId: 'power-999', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should handle gracefully (returns null, statistic should not appear)
                    expect(mockStats.style.display).toBe('none');
                });

                it('should handle empty draw pile', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Only characters/locations/missions (not in draw pile)
                    mockDeckEditorCards.push(
                        { cardId: 'char-1', type: 'character', quantity: 1 }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should handle gracefully (returns null, statistic should not appear)
                    expect(mockStats.style.display).toBe('none');
                });

                it('should handle remaining duplicates = 0 after placing one', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Two copies total: after placing 1, there is still 1 duplicate copy that could be drawn
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-999', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // With a 22-card draw pile and 2 duplicates of the same value:
                    // remaining pile after drawing 8 cards is 14 cards, with 1 duplicate remaining.
                    // P(draw duplicate) = 1 - C(13,8)/C(14,8) = 57.1%
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand: 57.1% of Hands');
                });

                it('should not display statistic when calculation returns null', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName, value: 5 });
                    
                    // Empty draw pile (will return null)
                    mockDeckEditorCards.push(
                        { cardId: 'char-1', type: 'character', quantity: 1 } // Only non-draw-pile cards
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Statistic should not appear when calculation returns null
                    expect(mockStats.innerHTML).not.toContain('Chance to duplicate if placed first hand:');
                });

                it('should display statistic for power cards without value (fallback path)', () => {
                    const cardId = 'power-123';
                    const cardType = 'power';
                    const cardName = 'Power 5';
                    
                    // No value property (fallback to cardId matching)
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    // Add 2 copies of same cardId
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 2 },
                        { cardId: 'power-999', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    mockAvailableCardsMap.set('power-999', { name: 'Power 3', value: 3 });
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Should show statistic in fallback format (count format)
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                });

                it('should display both duplication risk and placed first hand statistics together', () => {
                    const cardId = 'special-123';
                    const cardType = 'special';
                    const cardName = 'Special Card';
                    
                    mockAvailableCardsMap.set(cardId, { name: cardName });
                    
                    mockDeckEditorCards.push(
                        { cardId, type: cardType, quantity: 3 },
                        { cardId: 'power-1', type: 'power', quantity: 20, exclude_from_draw: false }
                    );
                    
                    const mockEvent = createMockMouseEvent(100, 100);
                    (window as any).event = mockEvent;
                    
                    window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
                    
                    // Both statistics should appear
                    expect(mockStats.innerHTML).toContain('Duplication Risk:');
                    expect(mockStats.innerHTML).toContain('Chance to duplicate if placed first hand:');
                    // Duplication Risk should appear before placed first hand
                    const duplicationRiskIndex = mockStats.innerHTML.indexOf('Duplication Risk:');
                    const placedFirstHandIndex = mockStats.innerHTML.indexOf('Chance to duplicate if placed first hand:');
                    expect(duplicationRiskIndex).toBeLessThan(placedFirstHandIndex);
                });
            });
        });

        it('should handle cards with quantity undefined (default to 1)', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            mockAvailableCardsMap.set(cardId, { name: cardName });
            mockDeckEditorCards.push({ cardId, type: cardType }); // No quantity property
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.innerHTML).toContain('Power 3');
            expect(mockStats.innerHTML).toContain('1/2'); // 1 copy / 2 draw pile cards
        });

        it('should handle missing deckEditorCards gracefully', () => {
            const cardId = 'char-123';
            const cardType = 'character';
            const cardName = 'Hercules';
            
            delete (window as any).deckEditorCards;
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            expect(mockStats.style.display).toBe('none');
        });

        it('should handle missing availableCardsMap gracefully', () => {
            const cardId = 'power-123';
            const cardType = 'power';
            const cardName = 'Power 3';
            
            delete (window as any).availableCardsMap;
            mockDeckEditorCards.push({ cardId, type: cardType, quantity: 2 });
            mockDeckEditorCards.push({ cardId: 'special-1', type: 'special', quantity: 1 });
            
            const mockEvent = createMockMouseEvent(100, 100);
            (window as any).event = mockEvent;
            
            window.showCardHoverModal!('test.webp', cardName, cardId, cardType);
            
            // Should use provided cardName as fallback
            expect(mockStats.innerHTML).toContain('Power 3');
            expect(mockStats.innerHTML).toContain('2/3'); // 2 copies / 3 draw pile cards
        });
    });
});
