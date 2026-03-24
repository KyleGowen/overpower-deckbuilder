/** @jest-environment jsdom */

/**
 * Draw Hand KO Dimming - Teamwork and Ally cards (shouldDimCard)
 * Uses drawHandKoDimmingTestHelpers.
 */

declare global {
    interface Window {
        SimulateKO?: {
            init?: () => void;
            toggleKOCharacter?: (cardId: string, index: number, renderFunctions: any) => Promise<void>;
            shouldDimCard: (card: any, availableCardsMap: Map<string, any>, deckCards: any[]) => boolean;
            applyDimming?: () => void;
        };
    }
}

import {
    setupDrawHandKoDimmingBootstrap,
    teardownDrawHandKoDimmingMocks
} from '../helpers/drawHandKoDimmingTestHelpers';

describe('Draw Hand KO Dimming - Teamwork and Ally', () => {
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

    describe('shouldDimCard - Teamwork Cards', () => {
        it('should dim teamwork cards when team cannot meet stat requirement after KO', () => {
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
            
            const teamworkCard = {
                cardId: 'teamwork-1',
                type: 'teamwork',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const teamworkData = {
                id: 'teamwork-1',
                name: '8 Combat',
                to_use: '8 Combat'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('teamwork-1', teamworkData);
            mockDeckEditorCards.push(char1, char2, teamworkCard);
            
            // KO one character - now only char1 remains with 4 Combat, can't use 8 Combat
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                teamworkCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should not dim teamwork cards when team can meet stat requirement', () => {
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
                energy: 4,
                combat: 8,
                brute_force: 3,
                intelligence: 2
            };
            
            const teamworkData = {
                id: 'teamwork-1',
                name: '8 Combat',
                to_use: '8 Combat'
            };
            
            mockAvailableCardsMap.set('char-1', characterData);
            mockAvailableCardsMap.set('teamwork-1', teamworkData);
            mockDeckEditorCards.push(characterCard, teamworkCard);
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                teamworkCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should dim teamwork cards when only one active character remains (special rule)', () => {
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
            
            const teamworkCard = {
                cardId: 'teamwork-1',
                type: 'teamwork',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 7,
                combat: 7
            };
            
            const teamworkData = {
                id: 'teamwork-1',
                name: '6 Combat',
                to_use: '6 Combat'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('teamwork-1', teamworkData);
            mockDeckEditorCards.push(char1, char2, teamworkCard);
            
            // KO one character, leaving only one active
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                teamworkCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should handle Any-Power teamwork cards', () => {
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
            
            const teamworkCard = {
                cardId: 'teamwork-1',
                type: 'teamwork',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 8,
                combat: 8,
                brute_force: 5,
                intelligence: 4
            };
            
            const teamworkData = {
                id: 'teamwork-1',
                name: '8 Any-Power',
                to_use: '8 Any-Power'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('teamwork-1', teamworkData);
            mockDeckEditorCards.push(char1, char2, teamworkCard);
            
            // KO the character with high stats - now only char1 remains with max 4, need 8
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                teamworkCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true); // Max stat is 4, need 8
        });
    });

    describe('shouldDimCard - Ally Cards', () => {
        it('should not dim ally cards when active character meets requirement', () => {
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
            
            const char3 = {
                cardId: 'char-3',
                type: 'character',
                quantity: 1
            };
            
            const allyCard = {
                cardId: 'ally-1',
                type: 'ally-universe',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char3Data = {
                id: 'char-3',
                name: 'Merlin',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const allyData = {
                id: 'ally-1',
                name: 'Little John',
                stat_to_use: '5 or less',
                stat_type_to_use: 'Combat'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('char-3', char3Data);
            mockAvailableCardsMap.set('ally-1', allyData);
            mockDeckEditorCards.push(char1, char2, char3, allyCard);
            
            // KO one character - 2 active characters remain, so special rule doesn't apply
            // char1 has 4 Combat, which is <= 5, so should not dim
            ((window as any).koCharacters as Set<string>).add('char-3');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                allyCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(false);
        });

        it('should dim ally cards with "or higher" requirement when stat is too low', () => {
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
            
            const allyCard = {
                cardId: 'ally-1',
                type: 'ally-universe',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 4,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 8,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            };
            
            const allyData = {
                id: 'ally-1',
                name: 'Hera',
                stat_to_use: '7 or higher',
                stat_type_to_use: 'Energy'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('ally-1', allyData);
            mockDeckEditorCards.push(char1, char2, allyCard);
            
            // KO the character with 8 Energy - now only char1 remains with 4 Energy, need 7 or higher, so should dim
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                allyCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });

        it('should dim ally cards when only one active character remains (special rule)', () => {
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
            
            const allyCard = {
                cardId: 'ally-1',
                type: 'ally-universe',
                quantity: 1
            };
            
            const char1Data = {
                id: 'char-1',
                name: 'Leonidas',
                energy: 8,
                combat: 8
            };
            
            const char2Data = {
                id: 'char-2',
                name: 'King Arthur',
                energy: 7,
                combat: 7
            };
            
            const allyData = {
                id: 'ally-1',
                name: 'Little John',
                stat_to_use: '5 or less',
                stat_type_to_use: 'Combat'
            };
            
            mockAvailableCardsMap.set('char-1', char1Data);
            mockAvailableCardsMap.set('char-2', char2Data);
            mockAvailableCardsMap.set('ally-1', allyData);
            mockDeckEditorCards.push(char1, char2, allyCard);
            
            // KO one character, leaving only one active
            ((window as any).koCharacters as Set<string>).add('char-2');
            
            const shouldDim = window.SimulateKO?.shouldDimCard(
                allyCard,
                mockAvailableCardsMap,
                mockDeckEditorCards
            );
            
            expect(shouldDim).toBe(true);
        });
    });

});
