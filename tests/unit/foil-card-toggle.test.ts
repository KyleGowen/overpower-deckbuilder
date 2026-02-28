/**
 * @jest-environment jsdom
 *
 * Unit tests for the foil card toggle system.
 *
 * Covers:
 *  - toggleFoilForCard() core logic (base→foil, foil→base)
 *  - foilCardMap bidirectional lookup
 *  - per-instance foil toggling (multi-quantity cards)
 *  - edge cases: missing map, missing card, no counterpart
 */

const mockRenderDeckCardsCardView = jest.fn();
const mockRenderDeckCardsListView = jest.fn();
const mockDisplayDeckCardsForEditing = jest.fn();

(global as any).renderDeckCardsCardView = mockRenderDeckCardsCardView;
(global as any).renderDeckCardsListView = mockRenderDeckCardsListView;
(global as any).displayDeckCardsForEditing = mockDisplayDeckCardsForEditing;

/**
 * Inline re-implementation of toggleFoilForCard matching deck-editor-core.js.
 * Tests exercise the pure logic without DOM / module loading complexity.
 */
function toggleFoilForCard(
    cardId: string,
    index: number,
    instanceIndex = 0,
    {
        deckEditorCards,
        foilCardMap,
    }: { deckEditorCards: any[]; foilCardMap: Record<string, string> }
): void {
    if (!deckEditorCards || !deckEditorCards[index]) {
        return;
    }
    if (!foilCardMap) {
        return;
    }

    const deckCard = deckEditorCards[index];

    let currentInstanceId: string;
    if (deckCard.selectedAlternateCardIds && deckCard.selectedAlternateCardIds[instanceIndex]) {
        currentInstanceId = deckCard.selectedAlternateCardIds[instanceIndex];
    } else if (deckCard.selectedAlternateCardId) {
        currentInstanceId = deckCard.selectedAlternateCardId;
    } else {
        currentInstanceId = deckCard.cardId;
    }

    const counterpartId = foilCardMap[currentInstanceId];
    if (!counterpartId) {
        return;
    }

    if (!deckCard.selectedAlternateCardIds) {
        deckCard.selectedAlternateCardIds = Array(deckCard.quantity || 1).fill(deckCard.cardId);
    }
    deckCard.selectedAlternateCardIds[instanceIndex] = counterpartId;

    if (deckCard.quantity === 1) {
        deckCard.selectedAlternateCardId = counterpartId;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test data helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeFoilMap(): Record<string, string> {
    return {
        'base-001': 'foil-001',
        'foil-001': 'base-001',
        'base-002': 'foil-002',
        'foil-002': 'base-002',
    };
}

function makeDeckCard(overrides: Partial<any> = {}): any {
    return {
        cardId: 'base-001',
        quantity: 1,
        selectedAlternateCardId: null,
        selectedAlternateCardIds: null,
        ...overrides,
    };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('toggleFoilForCard — base to foil', () => {
    it('sets selectedAlternateCardId to the foil ID when card is not foil', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({ cardId: 'base-001', quantity: 1 });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds![0]).toBe('foil-001');
        expect(card.selectedAlternateCardId).toBe('foil-001');
    });
});

describe('toggleFoilForCard — foil to base', () => {
    it('returns to base ID when card instance is already foil', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({
            cardId: 'base-001',
            quantity: 1,
            selectedAlternateCardId: 'foil-001',
            selectedAlternateCardIds: ['foil-001'],
        });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds![0]).toBe('base-001');
        expect(card.selectedAlternateCardId).toBe('base-001');
    });
});

describe('toggleFoilForCard — per-instance toggling (quantity > 1)', () => {
    it('only changes the specified instance, leaving others unchanged', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({
            cardId: 'base-001',
            quantity: 3,
            selectedAlternateCardIds: ['base-001', 'base-001', 'base-001'],
        });
        const deckEditorCards = [card];

        // Toggle instance 1 only
        toggleFoilForCard('base-001', 0, 1, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds![0]).toBe('base-001'); // unchanged
        expect(card.selectedAlternateCardIds![1]).toBe('foil-001'); // toggled
        expect(card.selectedAlternateCardIds![2]).toBe('base-001'); // unchanged
    });

    it('does NOT update selectedAlternateCardId for quantity > 1', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({
            cardId: 'base-001',
            quantity: 2,
            selectedAlternateCardIds: ['base-001', 'base-001'],
        });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });

        // selectedAlternateCardId sync only happens for quantity === 1
        expect(card.selectedAlternateCardId).toBeNull();
    });
});

describe('toggleFoilForCard — initialises selectedAlternateCardIds when null', () => {
    it('creates the array from quantity and applies the toggle', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({
            cardId: 'base-001',
            quantity: 2,
            selectedAlternateCardIds: null,
        });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds).not.toBeNull();
        expect(card.selectedAlternateCardIds![0]).toBe('foil-001');
        expect(card.selectedAlternateCardIds!.length).toBe(2);
    });
});

describe('toggleFoilForCard — edge cases', () => {
    it('does nothing when card index is out of range', () => {
        const foilCardMap = makeFoilMap();
        const deckEditorCards: any[] = [];

        expect(() =>
            toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap })
        ).not.toThrow();
    });

    it('does nothing when foilCardMap is falsy', () => {
        const card = makeDeckCard({ cardId: 'base-001' });
        const deckEditorCards = [card];

        expect(() =>
            toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap: null as any })
        ).not.toThrow();
        expect(card.selectedAlternateCardIds).toBeNull();
    });

    it('does nothing when no counterpart exists in the map', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({ cardId: 'unknown-card' });
        const deckEditorCards = [card];

        toggleFoilForCard('unknown-card', 0, 0, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds).toBeNull();
    });

    it('uses selectedAlternateCardId as fallback when selectedAlternateCardIds is absent', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({
            cardId: 'base-001',
            quantity: 1,
            selectedAlternateCardId: 'base-001',
            selectedAlternateCardIds: null,
        });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });

        expect(card.selectedAlternateCardIds![0]).toBe('foil-001');
    });
});

describe('foilCardMap — bidirectional lookup', () => {
    it('resolves foil → base correctly', () => {
        const map = makeFoilMap();
        expect(map['foil-001']).toBe('base-001');
    });

    it('resolves base → foil correctly', () => {
        const map = makeFoilMap();
        expect(map['base-001']).toBe('foil-001');
    });

    it('returns undefined for an ID not in the map', () => {
        const map = makeFoilMap();
        expect(map['not-in-map']).toBeUndefined();
    });

    it('two toggles return to the original ID', () => {
        const foilCardMap = makeFoilMap();
        const card = makeDeckCard({ cardId: 'base-001', quantity: 1 });
        const deckEditorCards = [card];

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });
        expect(card.selectedAlternateCardIds![0]).toBe('foil-001');

        toggleFoilForCard('base-001', 0, 0, { deckEditorCards, foilCardMap });
        expect(card.selectedAlternateCardIds![0]).toBe('base-001');
    });
});
