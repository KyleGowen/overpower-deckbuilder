/** @jest-environment jsdom */

/**
 * Draw Hand KO Dimming - Edge cases and displayDrawnCards integration
 * Uses drawHandKoDimmingTestHelpers.
 */

declare global {
    interface Window {
        SimulateKO?: {
            init?: () => void;
            shouldDimCard: (card: unknown, availableCardsMap: Map<string, unknown>, deckCards: unknown[]) => boolean;
            applyDimming: () => void;
        };
        availableCardsMap?: Map<string, unknown>;
        deckEditorCards?: unknown[];
    }
}

import {
    setupDrawHandKoDimmingBootstrap,
    teardownDrawHandKoDimmingMocks
} from '../helpers/drawHandKoDimmingTestHelpers';

describe('Draw Hand KO Dimming - Edge and Integration', () => {
    let mockAvailableCardsMap: Map<string, any>;
    let mockDeckEditorCards: any[];

    beforeEach(() => {
        const setup = setupDrawHandKoDimmingBootstrap();
        mockAvailableCardsMap = setup.mockAvailableCardsMap;
        mockDeckEditorCards = setup.mockDeckEditorCards;
    });

    afterEach(() => {
        teardownDrawHandKoDimmingMocks(window);
    });

    describe('shouldDimCard - Edge Cases', () => {
        it('should return false when no KO\'d characters exist', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const specialCard = {
                cardId: 'special-1',
                type: 'special',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8
            };
            
            const specialData = {
                id: 'special-1',
                name: 'Spartan Shield',
                character: 'Leonidas'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(characterCard, specialCard);
            
            // No KO'd characters
            ((window as any).koCharacters as Set<string>).clear();
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                specialCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should return false when card data is missing', () => {
            const card = {
                cardId: 'missing-card',
                type: 'special',
                quantity: 1
            };
            
            mockDeckEditorCards.push(card);
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                card,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should handle empty deck', () => {
            const card = {
                cardId: 'card-1',
                type: 'special',
                quantity: 1
            };
            
            const cardData = {
                id: 'card-1',
                name: 'Test Card'
            };
            
            mockAvailableCardsMap.set('card-1', cardData);
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                card,
                mockAvailableCardsMap,
                []
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should handle single character deck (should not dim teamwork/ally for single character)', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const teamworkCard = {
                cardId: 'teamwork-1',
                type: 'teamwork',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8
            };
            
            const teamworkData = {
                id: 'teamwork-1',
                name: '6 Combat',
                to_use: '6 Combat'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('teamwork-1', teamworkData);
            mockDeckEditorCards.push(characterCard, teamworkCard);
            
            // Single character, no KO'd characters - should check normal stat requirement
            const shouldDim = window.SimulateKO?.shouldDimCard(
                teamworkCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false); // Character has 8 Combat, can use 6 Combat
        });
    });

    describe('displayDrawnCards Integration', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="drawHandContent"></div>
            `;
        });

        it('should apply ko-dimmed class to cards that should be dimmed', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const specialCard = {
                cardId: 'special-1',
                type: 'special',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8
            };
            
            const specialData = {
                id: 'special-1',
                name: 'Spartan Shield',
                character: 'Leonidas',
                card_name: 'Spartan Shield'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(characterCard, specialCard);
            
            // KO the character
            ((window as any).koCharacters as Set<string>).add('char-1');
            
            // Mock getCardImagePath
            (window as any).getCardImagePath = jest.fn(() => '/path/to/image.webp');
            
            // Create displayDrawnCards function
            const displayDrawnCards = (cards: any[]) => {
                const drawHandContent = document.getElementById('drawHandContent');
                if (!drawHandContent) return;
                
                drawHandContent.innerHTML = '';
                
                cards.forEach((card) => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'drawn-card';
                    cardElement.dataset.cardId = card.cardId;
                    
                    // Check if card should be dimmed
                    if (window.SimulateKO && window.SimulateKO.shouldDimCard) {
                        const shouldDim = window.SimulateKO.shouldDimCard(
                            card,
                            window.availableCardsMap || new Map(),
                            window.deckEditorCards || []
                        );
                        if (shouldDim) {
                            cardElement.classList.add('ko-dimmed');
                        }
                    }
                    
                    drawHandContent.appendChild(cardElement);
                });
            };
            
            displayDrawnCards([specialCard]);
            
            const cardElement = document.querySelector('.drawn-card');
            expect(cardElement).toBeTruthy();
            expect(cardElement?.classList.contains('ko-dimmed')).toBe(true);
        });

        it('should not apply ko-dimmed class to cards that should not be dimmed', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const specialCard = {
                cardId: 'special-1',
                type: 'special',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8
            };
            
            const specialData = {
                id: 'special-1',
                name: 'Spartan Shield',
                character: 'Leonidas',
                card_name: 'Spartan Shield'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(characterCard, specialCard);
            
            // Character is not KO'd
            
            // Mock getCardImagePath
            (window as any).getCardImagePath = jest.fn(() => '/path/to/image.webp');
            
            // Create displayDrawnCards function
            const displayDrawnCards = (cards: any[]) => {
                const drawHandContent = document.getElementById('drawHandContent');
                if (!drawHandContent) return;
                
                drawHandContent.innerHTML = '';
                
                cards.forEach((card) => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'drawn-card';
                    cardElement.dataset.cardId = card.cardId;
                    
                    // Check if card should be dimmed
                    if (window.SimulateKO && window.SimulateKO.shouldDimCard) {
                        const shouldDim = window.SimulateKO.shouldDimCard(
                            card,
                            window.availableCardsMap || new Map(),
                            window.deckEditorCards || []
                        );
                        if (shouldDim) {
                            cardElement.classList.add('ko-dimmed');
                        }
                    }
                    
                    drawHandContent.appendChild(cardElement);
                });
            };
            
            displayDrawnCards([specialCard]);
            
            const cardElement = document.querySelector('.drawn-card');
            expect(cardElement).toBeTruthy();
            expect(cardElement?.classList.contains('ko-dimmed')).toBe(false);
        });
    });
});
