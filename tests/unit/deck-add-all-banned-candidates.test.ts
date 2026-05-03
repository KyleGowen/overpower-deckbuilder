/** @jest-environment jsdom */

/**
 * Candidate selection for "Add All" mirrors public/js/deck-card-operations.js.
 * SYNC: When changing bulk-add rules there, update these tests (and vice versa).
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const guardPath = join(__dirname, '../../public/js/bulk-add-banned-guard.js');

/** Same predicate as addAllSpecialCardsForCharacter character grouping. */
function specialRowsForCharacter(
    rows: Array<Record<string, unknown>>,
    characterName: string
): Record<string, unknown>[] {
    return rows.filter((card) => {
        const specialCharacter = String(card.character ?? card.character_name ?? '');
        if (specialCharacter === 'Any Character') {
            return characterName === 'Any Character';
        }
        if (specialCharacter.startsWith('Angry Mob') && characterName.startsWith('Angry Mob')) {
            if (specialCharacter === 'Angry Mob') {
                return true;
            }
            const hasVariantQualifier = specialCharacter.includes(':') || specialCharacter.includes(' - ');
            if (hasVariantQualifier) {
                const separator = specialCharacter.includes(':') ? ':' : ' - ';
                const specialVariant = specialCharacter.split(separator)[1].trim();
                const charVariantMatch = characterName.match(/\(([^)]+)\)/);
                if (!charVariantMatch) return false;
                const charVariant = charVariantMatch[1].trim();
                const normalize = (v: string) =>
                    v.toLowerCase().replace(/\s+/g, ' ').trim().replace(/s$/, '');
                return normalize(specialVariant) === normalize(charVariant);
            }
            return false;
        }
        return specialCharacter === characterName;
    });
}

describe('Add All — banned interaction (candidates vs guard)', () => {
    let isCatalogCardBannedForBulkAdd: (cardId: string, deckEditorType: string, catalogRowOptional?: unknown) => boolean;

    beforeAll(() => {
        const code = readFileSync(guardPath, 'utf8');
        (0, eval)(code);
        isCatalogCardBannedForBulkAdd = (window as unknown as { isCatalogCardBannedForBulkAdd: typeof isCatalogCardBannedForBulkAdd })
            .isCatalogCardBannedForBulkAdd;
    });

    beforeEach(() => {
        (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap = new Map();
    });

    function cardsToAddSpecial(characterName: string, rows: Record<string, unknown>[]): Record<string, unknown>[] {
        const characterCards = specialRowsForCharacter(rows, characterName);
        return characterCards.filter(
            (card) =>
                !card.is_foil &&
                !isCatalogCardBannedForBulkAdd(String(card.id), 'special', card)
        );
    }

    it('Any Character Add All excludes Kali-like banned row and keeps legal specials', () => {
        const rows: Record<string, unknown>[] = [
            {
                id: 'kali-id',
                name: 'Kali: Goddess of War',
                character: 'Any Character',
                is_foil: false,
                banned: true
            },
            {
                id: 'safe-id',
                name: 'Legit Special',
                character: 'Any Character',
                is_foil: false,
                banned: false
            },
            { id: 'foil-id', name: 'Foil Card', character: 'Any Character', is_foil: true, banned: false }
        ];
        const add = cardsToAddSpecial('Any Character', rows);
        expect(add.map((c) => c.id)).toEqual(['safe-id']);
    });

    it('uses availableCardsMap when API row omits banned but map marks banned', () => {
        const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
        map.set('hidden-ban', { banned: true });
        const rows: Record<string, unknown>[] = [
            {
                id: 'hidden-ban',
                name: 'Shadow',
                character: 'Any Character',
                is_foil: false
            }
        ];
        expect(cardsToAddSpecial('Any Character', rows)).toEqual([]);
    });

    it('Angry Mob variant matches qualifier and still respects banned', () => {
        const rows: Record<string, unknown>[] = [
            {
                id: 'am1',
                name: 'AM Special',
                character: 'Angry Mob: Middle Ages',
                is_foil: false,
                banned: true
            },
            {
                id: 'am2',
                name: 'AM OK',
                character: 'Angry Mob',
                is_foil: false,
                banned: false
            }
        ];
        const add = cardsToAddSpecial('Angry Mob (Middle Ages)', rows);
        expect(add.map((c) => c.id)).toEqual(['am2']);
    });

    it('advanced-universe batch excludes banned non-foil', () => {
        const rows: Record<string, unknown>[] = [
            { id: 'au-b', name: 'Bad', character: 'Tarzan', is_foil: false, banned: true },
            { id: 'au-ok', name: 'Good', character: 'Tarzan', is_foil: false, banned: false }
        ];
        const characterCards = rows.filter((card) => String(card.character ?? 'Any Character') === 'Tarzan');
        const toAdd = characterCards.filter(
            (card) =>
                !card.is_foil && !isCatalogCardBannedForBulkAdd(String(card.id), 'advanced-universe', card)
        );
        expect(toAdd.map((c) => c.id)).toEqual(['au-ok']);
    });

    it('mission bulk list skips banned missions (row flag)', () => {
        const cards = [
            { id: 'm1', name: 'M1', card_name: 'M1', banned: true },
            { id: 'm2', name: 'M2', card_name: 'M2', banned: false }
        ];
        const toAdd = cards.filter((c) => !isCatalogCardBannedForBulkAdd(c.id, 'mission', c));
        expect(toAdd.map((c) => c.id)).toEqual(['m2']);
    });

    it('power bulk list skips banned powers', () => {
        const cards = [
            { id: 'p1', value: 5, power_type: 'Energy', banned: true },
            { id: 'p2', value: 6, power_type: 'Energy', banned: false }
        ];
        const toAdd = cards.filter((c) => !isCatalogCardBannedForBulkAdd(c.id, 'power', c));
        expect(toAdd.map((c) => c.id)).toEqual(['p2']);
    });
});
