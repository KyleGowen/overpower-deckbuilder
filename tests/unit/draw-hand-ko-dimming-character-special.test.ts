/** @jest-environment jsdom */

/**
 * Draw Hand KO Dimming - Character and Special cards (shouldDimCard)
 * Uses drawHandKoDimmingTestHelpers.
 */

declare global {
    interface Window {
        SimulateKO?: {
            init?: () => void;
            shouldDimCard: (card: unknown, availableCardsMap: Map<string, unknown>, deckCards: unknown[]) => boolean;
        };
        koCharacters?: Set<string>;
    }
}

import {
    setupDrawHandKoDimmingBootstrap,
    teardownDrawHandKoDimmingMocks
} from '../helpers/drawHandKoDimmingTestHelpers';

describe('Draw Hand KO Dimming - Character and Special', () => {
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

    describe('shouldDimCard - Character Cards', () => {
        it('should return true for KO\'d characters', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockDeckEditorCards.push(characterCard);
            
            // KO the character - manually add to set
            ((window as any).koCharacters as Set<string>).add('char-1');
            // Sync with SimulateKO
            if (window.SimulateKO?.init) {
                window.SimulateKO.init();
            }
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                characterCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should return false for non-KO\'d characters', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockDeckEditorCards.push(characterCard);
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                characterCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });
    });

    describe('shouldDimCard - Special Cards', () => {
        it('should dim special cards belonging to KO\'d characters', () => {
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
                character: 'Leonidas'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(characterCard, specialCard);
            
            // KO the character
            ((window as any).koCharacters as Set<string>).add('char-1');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                specialCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should not dim special cards belonging to active characters', () => {
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
                character: 'Leonidas'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(characterCard, specialCard);
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                specialCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should not dim "Any Character" special cards', () => {
            const specialCard = {
                cardId: 'special-1',
                type: 'special',
                quantity: 1
            };
            
            const specialData = {
                id: 'special-1',
                name: 'Universal Power',
                character: 'Any Character'
            };
            
            mockAvailableCardsMap.set('special-1', specialData);
            mockDeckEditorCards.push(specialCard);
            
            // KO all characters
            const charCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            mockDeckEditorCards.push(charCard);
            (window.koCharacters as Set<string>).add('char-1');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                specialCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });
    });

});
