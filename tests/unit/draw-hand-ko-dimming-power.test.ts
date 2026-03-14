/** @jest-environment jsdom */

/**
 * Draw Hand KO Dimming - Power cards (shouldDimCard)
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

describe('Draw Hand KO Dimming - Power', () => {
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

    describe('shouldDimCard - Power Cards', () => {
        it('should dim power cards when team cannot meet requirement after KO', () => {
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
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                card_name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                card_name: 'King Arthur',
                energy: 8,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const powerData = {
                id: 'power-1',
                name: '8 - Energy',
                value: '8',
                power_type: 'Energy'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(char1, char2, powerCard);
            
            // KO the character with 8 Energy - now only char1 remains with 4 Energy, can't use 8 Energy
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should handle Any-Power cards correctly', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 8,
                brute_force: 3,
                intelligence: 2
            };
            
            const powerData = {
                id: 'power-1',
                name: '8 - Any-Power',
                value: '8',
                power_type: 'Any-Power'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(characterCard, powerCard);
            
            // Max stat is 8, so should not dim
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should handle Multi-Power cards correctly', () => {
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
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                card_name: 'Leonidas',
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                card_name: 'King Arthur',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const powerData = {
                id: 'power-1',
                name: '10 - Multi Power',
                value: '10',
                power_type: 'Multi-Power'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(char1, char2, powerCard);
            
            // KO the character with high stats - now only char1 remains
            // Multi-Power requires sum of two highest stats
            // Character has: Energy 5, Combat 4, Brute Force 3, Intelligence 2
            // Two highest: 5 + 4 = 9, need 10, so should dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should handle Multi Power cards with space variant correctly', () => {
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
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                card_name: 'Leonidas',
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                card_name: 'King Arthur',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const powerData = {
                id: 'power-1',
                name: '10 - Multi Power',
                value: '10',
                power_type: 'Multi Power'  // Space variant
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(char1, char2, powerCard);
            
            // KO the character with high stats - now only char1 remains
            // Multi Power requires sum of two highest stats
            // Character has: Energy 5, Combat 4, Brute Force 3, Intelligence 2
            // Two highest: 5 + 4 = 9, need 10, so should dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should verify Multi-Power uses sum of two highest stats (not Math.max like Any-Power)', () => {
            // This test verifies the fix: Multi-Power should use sum of two highest,
            // not Math.max. A character with stats [8, 4, 3, 2] can use:
            // - Any-Power 8: Math.max(8,4,3,2) = 8 >= 8 ✓
            // - Multi-Power 10: sum(8,4) = 12 >= 10 ✓
            // - Multi-Power 13: sum(8,4) = 12 < 13 ✗
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
            
            const anyPowerCard = {
                cardId: 'power-any',
                type: 'power',
                quantity: 1
            };
            
            const multiPowerCard = {
                cardId: 'power-multi',
                type: 'power',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Test Character',
                energy: 8,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'Other Character',
                energy: 10,
                combat: 10,
                brute_force: 10,
                intelligence: 10
            };
            
            const anyPowerData = {
                id: 'power-any',
                name: '8 - Any-Power',
                value: '8',
                power_type: 'Any-Power'
            };
            
            const multiPowerData = {
                id: 'power-multi',
                name: '13 - Multi-Power',
                value: '13',
                power_type: 'Multi-Power'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('power-any', anyPowerData);
            mockAvailableCardsMap.set('power-multi', multiPowerData);
            mockDeckEditorCards.push(char1, char2, anyPowerCard, multiPowerCard);
            
            // KO char2 so only char1 remains (stats: 8,4,3,2)
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            // Any-Power: Math.max(8,4,3,2) = 8 >= 8, should NOT dim
            const anyPowerShouldDim = window.SimulateKO?.shouldDimCard(
                anyPowerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            expect(anyPowerShouldDim).toBe(false);
            
            // Multi-Power: sum(8,4) = 12 < 13, should dim
            const multiPowerShouldDim = window.SimulateKO?.shouldDimCard(
                multiPowerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            expect(multiPowerShouldDim).toBe(true);
        });

        it('should not dim Multi-Power cards when character can meet requirement with sum of two highest', () => {
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
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 6,
                combat: 5,
                brute_force: 4,
                intelligence: 3
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const powerData = {
                id: 'power-1',
                name: '10 - Multi-Power',
                value: '10',
                power_type: 'Multi-Power'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(char1, char2, powerCard);
            
            // KO char2, char1 remains
            // Character has: Energy 6, Combat 5, Brute Force 4, Intelligence 3
            // Two highest: 6 + 5 = 11 >= 10, so should NOT dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should apply John Carter override for Brute Force', () => {
            const characterCard = {
                cardId: 'char-1',
                type: 'character',
                quantity: 1
            };
            
            const powerCard = {
                cardId: 'power-1',
                type: 'power',
                quantity: 1
            };
            
            const characterData = {
                id: 'char-1',
                name: 'John Carter',
                energy: 4,
                combat: 4,
                brute_force: 5,
                intelligence: 2
            };
            
            const powerData = {
                id: 'power-1',
                name: '8 - Brute Force',
                value: '8',
                power_type: 'Brute Force'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('power-1', powerData);
            mockDeckEditorCards.push(characterCard, powerCard);
            
            // John Carter should have effective 8 Brute Force, so should not dim
            const shouldDim = window.SimulateKO?.shouldDimCard(
                powerCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });
    });

});
