/** @jest-environment jsdom */

/**
 * Draw Hand KO Dimming - Training and Basic Universe cards (shouldDimCard)
 * Uses drawHandKoDimmingTestHelpers.
 */

declare global {
    interface Window {
        SimulateKO?: {
            init?: () => void;
            shouldDimCard: (card: unknown, availableCardsMap: Map<string, unknown>, deckCards: unknown[]) => boolean;
        };
    }
}

import {
    setupDrawHandKoDimmingBootstrap,
    teardownDrawHandKoDimmingMocks
} from '../helpers/drawHandKoDimmingTestHelpers';

describe('Draw Hand KO Dimming - Training and Basic Universe', () => {
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

    describe('shouldDimCard - Training Cards', () => {
        it('should dim training cards when no character can use them after KO', () => {
            const char1 = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const char2 = {
                cardId: 'char-2',
                type: 'character',
                quantity: 1
            };
            
            const trainingCard = {
                cardId: 'training-1',
                type: 'training',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                card_name: 'Leonidas',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                card_name: 'King Arthur',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const trainingData = {
                id: 'training-1',
                name: 'Training (Leonidas)',
                type_1: 'Energy',
                type_2: 'Combat',
                value_to_use: '5'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('training-1', trainingData);
            mockDeckEditorCards.push(char1, char2, trainingCard);
            
            // KO the character with low stats - now only char1 remains
            // Training cards are usable if EITHER stat is <= value
            // Both stats (8, 8) are > 5, so no character can use it, should dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                trainingCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should not dim training cards when a character can use them', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const trainingCard = {
                cardId: 'training-1',
                type: 'training',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const trainingData = {
                id: 'training-1',
                name: 'Training (Leonidas)',
                type_1: 'Energy',
                type_2: 'Combat',
                value_to_use: '5'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('training-1', trainingData);
            mockDeckEditorCards.push(characterCard, trainingCard);
            
            // Energy (4) is <= 5, so should not dim
            const shouldDim = window.SimulateKO?.shouldDimCard(
                trainingCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });
    });

    describe('shouldDimCard - Basic Universe Cards', () => {
        it('should dim basic universe cards when requirement not met after KO', () => {
            const char1 = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const char2 = {
                cardId: 'char-2',
                type: 'character',
                quantity: 1
            };
            
            const basicCard = {
                cardId: 'basic-1',
                type: 'basic-universe',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                card_name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 0,
                intelligence: 0
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                card_name: 'King Arthur',
                energy: 4,
                combat: 8,
                brute_force: 0,
                intelligence: 0
            };
            
            const basicData = {
                id: 'basic-1',
                name: 'Rapier',
                type: 'Combat',
                value_to_use: '7 or greater'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('basic-1', basicData);
            mockDeckEditorCards.push(char1, char2, basicCard);
            
            // KO the character with 8 Combat - now only char1 remains with 4 Combat, need 7, so should dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                basicCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });
    });

});
