/** @jest-environment jsdom */

/**
 * Deck Export - Card Grouping (special, missions, events, advanced universe)
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Card Grouping', () => {
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

    describe('Card Grouping - Special Cards by Character', () => {
        it('should group special cards by character name', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 },
                { cardId: 'special2', type: 'special', quantity: 1 },
                { cardId: 'special3', type: 'special', quantity: 2 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Card 1', character_name: 'Captain Nemo' });
            mockAvailableCardsMap.set('special2', { name: 'Card 2', character_name: 'Captain Nemo' });
            mockAvailableCardsMap.set('special3', { name: 'Card 3', character_name: 'Count of Monte Cristo' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.special_cards).toEqual({
                'Captain Nemo': ['Card 1', 'Card 2'],
                'Count of Monte Cristo': ['Card 3', 'Card 3']
            });
        });

        it('should handle special cards with Any Character', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Universal Card', character_name: 'Any Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.special_cards).toEqual({
                'Any Character': ['Universal Card']
            });
        });

        it('should handle special cards with missing character_name using character field', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Card 1', character: 'Fallback Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.special_cards).toEqual({
                'Fallback Character': ['Card 1']
            });
        });

        it('should handle special cards with missing character field', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 1 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Card 1' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.special_cards).toEqual({
                'Any Character': ['Card 1']
            });
        });

        it('should handle special card quantities correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'special1', type: 'special', quantity: 3 }
            ];

            mockAvailableCardsMap.set('special1', { name: 'Card 1', character_name: 'Test Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.special_cards).toEqual({
                'Test Character': ['Card 1', 'Card 1', 'Card 1']
            });
        });
    });

    describe('Card Grouping - Missions by Mission Set', () => {
        it('should group missions by mission set', async () => {
            mockDeckEditorCards = [
                { cardId: 'mission1', type: 'mission', quantity: 1 },
                { cardId: 'mission2', type: 'mission', quantity: 1 },
                { cardId: 'mission3', type: 'mission', quantity: 2 }
            ];

            mockAvailableCardsMap.set('mission1', { name: 'Mission 1', mission_set: 'Battle at Olympus' });
            mockAvailableCardsMap.set('mission2', { name: 'Mission 2', mission_set: 'Battle at Olympus' });
            mockAvailableCardsMap.set('mission3', { name: 'Mission 3', mission_set: 'Divine Retribution' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.missions).toEqual({
                'Battle at Olympus': ['Mission 1', 'Mission 2'],
                'Divine Retribution': ['Mission 3', 'Mission 3']
            });
        });

        it('should handle missions with missing mission_set', async () => {
            mockDeckEditorCards = [
                { cardId: 'mission1', type: 'mission', quantity: 1 }
            ];

            mockAvailableCardsMap.set('mission1', { name: 'Mission 1' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.missions).toEqual({
                'Unknown Mission Set': ['Mission 1']
            });
        });

        it('should handle mission quantities correctly', async () => {
            mockDeckEditorCards = [
                { cardId: 'mission1', type: 'mission', quantity: 4 }
            ];

            mockAvailableCardsMap.set('mission1', { name: 'Mission 1', mission_set: 'Test Set' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.missions).toEqual({
                'Test Set': ['Mission 1', 'Mission 1', 'Mission 1', 'Mission 1']
            });
        });
    });

    describe('Card Grouping - Events by Mission Set', () => {
        it('should group events by mission set', async () => {
            mockDeckEditorCards = [
                { cardId: 'event1', type: 'event', quantity: 1 },
                { cardId: 'event2', type: 'event', quantity: 1 }
            ];

            mockAvailableCardsMap.set('event1', { name: 'Event 1', mission_set: 'Set A' });
            mockAvailableCardsMap.set('event2', { name: 'Event 2', mission_set: 'Set B' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.events).toEqual({
                'Set A': ['Event 1'],
                'Set B': ['Event 2']
            });
        });

        it('should handle events with missing mission_set', async () => {
            mockDeckEditorCards = [
                { cardId: 'event1', type: 'event', quantity: 1 }
            ];

            mockAvailableCardsMap.set('event1', { name: 'Event 1' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.events).toEqual({
                'Unknown Mission Set': ['Event 1']
            });
        });
    });

    describe('Card Grouping - Advanced Universe by Character', () => {
        it('should group advanced universe cards by character', async () => {
            mockDeckEditorCards = [
                { cardId: 'adv1', type: 'advanced-universe', quantity: 1 },
                { cardId: 'adv2', type: 'advanced-universe', quantity: 1 },
                { cardId: 'adv3', type: 'advanced-universe', quantity: 2 }
            ];

            mockAvailableCardsMap.set('adv1', { name: 'Card 1', character: 'Ra' });
            mockAvailableCardsMap.set('adv2', { name: 'Card 2', character: 'Ra' });
            mockAvailableCardsMap.set('adv3', { name: 'Card 3', character: 'Other Character' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.advanced_universe).toEqual({
                'Ra': ['Card 1', 'Card 2'],
                'Other Character': ['Card 3', 'Card 3']
            });
        });

        it('should handle advanced universe cards with missing character', async () => {
            mockDeckEditorCards = [
                { cardId: 'adv1', type: 'advanced-universe', quantity: 1 }
            ];

            mockAvailableCardsMap.set('adv1', { name: 'Card 1' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.cards.advanced_universe).toEqual({
                'Unknown Character': ['Card 1']
            });
        });
    });
});
