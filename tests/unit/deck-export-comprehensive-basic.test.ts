/** @jest-environment jsdom */

/**
 * Deck Export - Basic Functionality and Threat Calculation
 * Part of comprehensive deck-export tests; uses deckExportTestHelpers.
 */

import {
    setupDeckExportBootstrap,
    teardownDeckExportMocks
} from '../helpers/deckExportTestHelpers';

describe('Deck Export Component - Basic and Threat', () => {
    let exportDeckAsJson: () => Promise<void>;
    let getExportedJson: () => any;
    let mockShowExportOverlay: jest.Mock;
    let mockShowNotification: jest.Mock;
    let mockLoadAvailableCards: jest.Mock;
    let mockValidateDeck: jest.Mock;
    let mockDeckEditorCards: any[];
    let mockAvailableCardsMap: Map<string, any>;
    let mockCurrentDeckData: any;

    beforeEach(() => {
        jest.useFakeTimers();
        const setup = setupDeckExportBootstrap();
        exportDeckAsJson = setup.exportDeckAsJson;
        getExportedJson = setup.getExportedJson;
        mockShowExportOverlay = setup.mocks.mockShowExportOverlay;
        mockShowNotification = setup.mocks.mockShowNotification;
        mockLoadAvailableCards = setup.mocks.mockLoadAvailableCards;
        mockValidateDeck = setup.mocks.mockValidateDeck;
        mockDeckEditorCards = (window as any).deckEditorCards;
        mockAvailableCardsMap = (window as any).availableCardsMap;
        mockCurrentDeckData = (window as any)._currentDeckData;
    });

    afterEach(() => {
        teardownDeckExportMocks(window);
        jest.useRealTimers();
    });

    describe('exportDeckAsJson - Basic Functionality', () => {
        it('should export deck with correct structure', async () => {
            mockCurrentDeckData = {
                metadata: {
                    name: 'Test Deck Name',
                    description: 'Test deck description'
                }
            };
            (window as any)._currentDeckData = mockCurrentDeckData;
            (window as any).currentDeckData = mockCurrentDeckData;

            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'power1', type: 'power', quantity: 2 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Test Character', energy: 5, combat: 4, brute_force: 3, intelligence: 2, threat_level: 18 });
            mockAvailableCardsMap.set('power1', { name: 'Test Power', value: 8, power_type: 'Energy' });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result).toBeDefined();
            expect(result.cards).toBeDefined();
            expect(result.name).toBe('Test Deck Name');
            expect(result.description).toBe('Test deck description');
            expect(result).toHaveProperty('total_energy_icons');
            expect(result).toHaveProperty('total_combat_icons');
            expect(result).toHaveProperty('total_brute_force_icons');
            expect(result).toHaveProperty('total_intelligence_icons');
            expect(Array.isArray(result.cards.characters)).toBe(true);
            expect(mockShowExportOverlay).toHaveBeenCalled();
        });

        it('should handle missing currentDeckData and extract from DOM', async () => {
            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.name).toBe('Test Deck Name');
            expect(result.description).toBe('Test deck description');
        });

        it('should prefer currentDeckData over DOM elements', async () => {
            mockCurrentDeckData = {
                metadata: {
                    name: 'From CurrentDeckData',
                    description: 'Description from CurrentDeckData'
                }
            };
            (window as any)._currentDeckData = mockCurrentDeckData;
            (window as any).currentDeckData = mockCurrentDeckData;

            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.name).toBe('From CurrentDeckData');
            expect(result.description).toBe('Description from CurrentDeckData');
        });

        it('should remove legality badges from deck name', async () => {
            let titleElement = document.querySelector('#deckEditorModal h3') || document.querySelector('h3');
            if (!titleElement) {
                const h4 = document.createElement('h4');
                document.body.appendChild(h4);
                titleElement = h4;
            }
            titleElement!.innerHTML = 'Test Deck <span class="deck-validation-badge error">Not Legal</span>';

            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.name).toBe('Test Deck');
        });

        it('should handle empty deck gracefully', async () => {
            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_cards).toBe(0);
            expect(result.max_energy).toBe(0);
            expect(result.max_combat).toBe(0);
            expect(result.max_brute_force).toBe(0);
            expect(result.max_intelligence).toBe(0);
            expect(result.total_threat).toBe(0);
            expect(result.cards.special_cards).toEqual({});
            expect(result.cards.missions).toEqual({});
            expect(result.cards.events).toEqual({});
            expect(result.cards.advanced_universe).toEqual({});
        });

        it('should include correct metadata', async () => {
            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.exported_by).toBe('Test Admin');
            expect(result.export_timestamp).toBeDefined();
            expect(new Date(result.export_timestamp)).toBeInstanceOf(Date);
            expect(typeof result.legal).toBe('boolean');
            expect(typeof result.limited).toBe('boolean');
        });

        it('should use username if name is not available', async () => {
            const testUser = {
                role: 'ADMIN',
                username: 'testuser'
            };
            (window as any)._currentUser = testUser;
            (window as any).currentUser = testUser;
            if ((window as any)._currentUser.name) {
                delete (window as any)._currentUser.name;
            }
            if ((window as any).currentUser.name) {
                delete (window as any).currentUser.name;
            }

            mockAvailableCardsMap.set('char1', { name: 'Character' });

            mockDeckEditorCards = [];
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.exported_by).toBe('testuser');
        });
    });

    describe('Threat Calculation', () => {
        it('should calculate threat from characters', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'char2', type: 'character', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character 1', threat_level: 18 });
            mockAvailableCardsMap.set('char2', { name: 'Character 2', threat_level: 20 });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(38);
        });

        it('should calculate threat from locations', async () => {
            mockDeckEditorCards = [
                { cardId: 'loc1', type: 'location', quantity: 1 },
                { cardId: 'loc2', type: 'location', quantity: 2 }
            ];

            mockAvailableCardsMap.set('loc1', { name: 'Location 1', threat_level: 3 });
            mockAvailableCardsMap.set('loc2', { name: 'Location 2', threat_level: 2 });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(7);
        });

        it('should calculate threat from both characters and locations', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 1 },
                { cardId: 'loc1', type: 'location', quantity: 1 }
            ];

            mockAvailableCardsMap.set('char1', { name: 'Character 1', threat_level: 18 });
            mockAvailableCardsMap.set('loc1', { name: 'Location 1', threat_level: 3 });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(21);
        });

        it('should apply reserve character threat adjustment for Victory Harben', async () => {
            mockDeckEditorCards = [
                { cardId: 'victory', type: 'character', quantity: 1 }
            ];

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'victory'
                }
            };

            mockAvailableCardsMap.set('victory', {
                name: 'Victory Harben',
                threat_level: 18,
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            });

            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(20);
        });

        it('should apply reserve character threat adjustment for Carson of Venus', async () => {
            mockDeckEditorCards = [
                { cardId: 'carson', type: 'character', quantity: 1 }
            ];

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'carson'
                }
            };

            mockAvailableCardsMap.set('carson', {
                name: 'Carson of Venus',
                threat_level: 18,
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            });

            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(19);
        });

        it('should apply reserve character threat adjustment for Morgan le Fay', async () => {
            mockDeckEditorCards = [
                { cardId: 'morgan', type: 'character', quantity: 1 }
            ];

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'morgan'
                }
            };

            mockAvailableCardsMap.set('morgan', {
                name: 'Morgan le Fay',
                threat_level: 19,
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            });

            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(20);
        });

        it('should not apply reserve adjustments to non-reserve characters', async () => {
            mockDeckEditorCards = [
                { cardId: 'victory', type: 'character', quantity: 1 },
                { cardId: 'other', type: 'character', quantity: 1 }
            ];

            mockCurrentDeckData = {
                metadata: {
                    reserve_character: 'other'
                }
            };

            mockAvailableCardsMap.set('victory', {
                name: 'Victory Harben',
                threat_level: 18,
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            });
            mockAvailableCardsMap.set('other', {
                name: 'Other Character',
                threat_level: 19,
                energy: 4,
                combat: 3,
                brute_force: 2,
                intelligence: 1
            });

            (window as any).currentDeckData = mockCurrentDeckData;
            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(37);
        });

        it('should handle character quantity when calculating threat', async () => {
            mockDeckEditorCards = [
                { cardId: 'char1', type: 'character', quantity: 2 }
            ];

            mockAvailableCardsMap.set('char1', {
                name: 'Character 1',
                threat_level: 18,
                energy: 5,
                combat: 4,
                brute_force: 3,
                intelligence: 2
            });

            (window as any).deckEditorCards = mockDeckEditorCards;
            (window as any).availableCardsMap = mockAvailableCardsMap;
            const promise = exportDeckAsJson();
            await jest.runAllTimersAsync();
            await promise;

            const result = getExportedJson();

            expect(result.total_threat).toBe(36);
        });
    });
});
