/** @jest-environment jsdom */

/**
 * Deck Export - Teamwork, Training, Basic Universe enhanced format
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Enhanced Format', () => {
    let exportDeckAsJson: () => Promise<void>;
    let getExportedJson: () => any;
    let mockDeckEditorCards: any[];
    let mockAvailableCardsMap: Map<string, any>;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        exportDeckAsJson = setup.exportDeckAsJson;
        getExportedJson = setup.getExportedJson;
        mockDeckEditorCards = (window as any).deckEditorCards;
        mockAvailableCardsMap = (window as any).availableCardsMap;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('Teamwork Cards Export - Enhanced Format', () => {
        it('should export teamwork cards with followup_attack_types appended', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 },
                { cardId: 'teamwork2', type: 'teamwork', quantity: 2 },
                { cardId: 'teamwork3', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat',
                followup_attack_types: 'Brute Force + Energy'
            });
            mockAvailableCardsMap.set('teamwork2', { 
                name: '7 Combat',
                followup_attack_types: 'Intelligence + Energy'
            });
            mockAvailableCardsMap.set('teamwork3', { 
                name: '7 Any-Power',
                followup_attack_types: 'Any-Power / Any-Power'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual([
                '6 Combat - Brute Force + Energy',
                '7 Combat - Intelligence + Energy',
                '7 Combat - Intelligence + Energy',
                '7 Any-Power - Any-Power / Any-Power'
            ]);
        });

        it('should export teamwork cards without followup_attack_types if field is missing', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat'
                // No followup_attack_types field
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual(['6 Combat']);
        });

        it('should export teamwork cards without followup_attack_types if field is empty', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat',
                followup_attack_types: ''
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual(['6 Combat']);
        });

        it('should export teamwork cards without followup_attack_types if field is whitespace only', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat',
                followup_attack_types: '   '
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual(['6 Combat']);
        });

        it('should handle teamwork cards with follow_up_attack_types (alternative field name)', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '7 Combat',
                follow_up_attack_types: 'Intelligence + Energy'  // Alternative field name
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual(['7 Combat - Intelligence + Energy']);
        });

        it('should handle multiple quantities of same teamwork card with followup types', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 3 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '7 Combat',
                followup_attack_types: 'Intelligence + Energy'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toEqual([
                '7 Combat - Intelligence + Energy',
                '7 Combat - Intelligence + Energy',
                '7 Combat - Intelligence + Energy'
            ]);
        });
    });

    describe('Training Cards Export - Enhanced Format', () => {
        it('should export training cards with type_1, type_2, and bonus appended', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                type_1: 'Energy',
                type_2: 'Combat',
                bonus: '+4'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Energy Combat +4']);
        });

        it('should export training cards with only type_1 and type_2 (no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                type_1: 'Energy',
                type_2: 'Combat'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Energy Combat']);
        });

        it('should export training cards with only type_1 (no type_2, no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                type_1: 'Energy'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Energy']);
        });

        it('should export training cards with only type_2 (no type_1, no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                type_2: 'Combat'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Combat']);
        });

        it('should export training cards with only bonus (no types)', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                bonus: '+4'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - +4']);
        });

        it('should export training cards without type_1, type_2, or bonus', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas)']);
        });

        it('should handle multiple quantities of same training card', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 2 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Cultists)',
                type_1: 'Energy',
                type_2: 'Combat',
                bonus: '+4'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual([
                'Training (Cultists) - Energy Combat +4',
                'Training (Cultists) - Energy Combat +4'
            ]);
        });

        it('should handle training cards missing from availableCardsMap', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            // Don't add training1 to mockAvailableCardsMap
            // Add at least one other card to ensure export doesn't fail completely
            mockDeckEditorCards.push({ cardId: 'char1', type: 'character', quantity: 1 });
            mockAvailableCardsMap.set('char1', { name: 'Test Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result).toBeDefined();
            expect(result.cards).toBeDefined();
            expect(result.cards.training).toEqual([]);
        });

        it('should handle whitespace in type_1, type_2, and bonus fields', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                name: 'Training (Leonidas)',
                type_1: '  Energy  ',
                type_2: '  Combat  ',
                bonus: '  +4  '
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Energy Combat +4']);
        });

        it('should handle training cards with card_name field instead of name', async () => {
            mockDeckEditorCards = [
                { cardId: 'training1', type: 'training', quantity: 1 }
            ];

            mockAvailableCardsMap.set('training1', { 
                card_name: 'Training (Leonidas)',
                type_1: 'Energy',
                type_2: 'Combat',
                bonus: '+4'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.training).toEqual(['Training (Leonidas) - Energy Combat +4']);
        });

        it('should handle teamwork cards missing from availableCardsMap', async () => {
            mockDeckEditorCards = [
                { cardId: 'missing_teamwork', type: 'teamwork', quantity: 1 },
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 }
            ];

            // Only add one teamwork card to map
            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat',
                followup_attack_types: 'Brute Force + Energy'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            // Missing card should be skipped (not added to result)
            expect(result.cards.teamwork).toEqual(['6 Combat - Brute Force + Energy']);
        });

        it('should handle various followup_attack_types formats', async () => {
            mockDeckEditorCards = [
                { cardId: 'teamwork1', type: 'teamwork', quantity: 1 },
                { cardId: 'teamwork2', type: 'teamwork', quantity: 1 },
                { cardId: 'teamwork3', type: 'teamwork', quantity: 1 }
            ];

            mockAvailableCardsMap.set('teamwork1', { 
                name: '6 Combat',
                followup_attack_types: 'Brute Force + Energy'
            });
            mockAvailableCardsMap.set('teamwork2', { 
                name: '7 Any-Power',
                followup_attack_types: 'Any-Power / Any-Power'
            });
            mockAvailableCardsMap.set('teamwork3', { 
                name: '8 Energy',
                followup_attack_types: 'Combat + Intelligence'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.teamwork).toContain('6 Combat - Brute Force + Energy');
            expect(result.cards.teamwork).toContain('7 Any-Power - Any-Power / Any-Power');
            expect(result.cards.teamwork).toContain('8 Energy - Combat + Intelligence');
        });
    });

    describe('Basic Universe Cards Export - Enhanced Format', () => {
        it('should export basic universe cards with type, value_to_use, and bonus appended', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: 'Energy',
                value_to_use: '6 or greater',
                bonus: '+2'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - Energy 6 or greater +2']);
        });

        it('should export basic universe cards with only type and value_to_use (no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: 'Energy',
                value_to_use: '6 or greater'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - Energy 6 or greater']);
        });

        it('should export basic universe cards with only type (no value_to_use, no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: 'Energy'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - Energy']);
        });

        it('should export basic universe cards with only value_to_use (no type, no bonus)', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                value_to_use: '6 or greater'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - 6 or greater']);
        });

        it('should export basic universe cards with only bonus (no type, no value_to_use)', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                bonus: '+2'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - +2']);
        });

        it('should export basic universe cards without type, value_to_use, or bonus', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity']);
        });

        it('should handle multiple quantities of same basic universe card', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 3 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: 'Energy',
                value_to_use: '6 or greater',
                bonus: '+2'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual([
                'Secret Identity - Energy 6 or greater +2',
                'Secret Identity - Energy 6 or greater +2',
                'Secret Identity - Energy 6 or greater +2'
            ]);
        });

        it('should handle basic universe cards missing from availableCardsMap', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 },
                { cardId: 'char1', type: 'character', quantity: 1 }
            ];

            // Don't add basic1 to map - card should be skipped
            // Add at least one other card to ensure export doesn't fail completely
            mockAvailableCardsMap.set('char1', { name: 'Test Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual([]);
        });

        it('should handle whitespace in type, value_to_use, and bonus fields', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: ' Energy ',
                value_to_use: ' 6 or greater ',
                bonus: ' +2 '
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - Energy 6 or greater +2']);
        });

        it('should handle basic universe cards with name field instead of card_name', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                name: 'Secret Identity',
                type: 'Energy',
                value_to_use: '6 or greater',
                bonus: '+2'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual(['Secret Identity - Energy 6 or greater +2']);
        });

        it('should handle multiple different basic universe cards', async () => {
            mockDeckEditorCards = [
                { cardId: 'basic1', type: 'basic-universe', quantity: 1 },
                { cardId: 'basic2', type: 'basic-universe', quantity: 2 },
                { cardId: 'basic3', type: 'basic-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('basic1', { 
                card_name: 'Secret Identity',
                type: 'Energy',
                value_to_use: '6 or greater',
                bonus: '+2'
            });
            mockAvailableCardsMap.set('basic2', { 
                card_name: 'Longbow',
                type: 'Combat',
                value_to_use: '7 or greater',
                bonus: '+3'
            });
            mockAvailableCardsMap.set('basic3', { 
                card_name: 'Flintlock',
                type: 'Brute Force',
                value_to_use: '5 or greater',
                bonus: '+1'
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.basic_universe).toEqual([
                'Secret Identity - Energy 6 or greater +2',
                'Longbow - Combat 7 or greater +3',
                'Longbow - Combat 7 or greater +3',
                'Flintlock - Brute Force 5 or greater +1'
            ]);
        });
    });
});
