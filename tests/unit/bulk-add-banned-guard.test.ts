/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const guardPath = join(__dirname, '../../public/js/bulk-add-banned-guard.js');

describe('bulk-add-banned-guard (public/js/bulk-add-banned-guard.js)', () => {
    let isCatalogCardBannedForBulkAdd: (cardId: string, deckEditorType: string, catalogRowOptional?: unknown) => boolean;

    beforeAll(() => {
        const code = readFileSync(guardPath, 'utf8');
        (0, eval)(code);
        isCatalogCardBannedForBulkAdd = (window as unknown as { isCatalogCardBannedForBulkAdd: typeof isCatalogCardBannedForBulkAdd })
            .isCatalogCardBannedForBulkAdd;
        expect(typeof isCatalogCardBannedForBulkAdd).toBe('function');
    });

    beforeEach(() => {
        (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap = new Map();
    });

    describe('catalog row (strict banned === true)', () => {
        it('returns true when catalogRowOptional.banned is true', () => {
            expect(isCatalogCardBannedForBulkAdd('any-id', 'special', { banned: true })).toBe(true);
        });

        it('returns false when banned is false', () => {
            expect(isCatalogCardBannedForBulkAdd('any-id', 'special', { banned: false })).toBe(false);
        });

        it('returns false when banned is string "true" (only strict boolean)', () => {
            expect(isCatalogCardBannedForBulkAdd('any-id', 'special', { banned: 'true' as unknown as boolean })).toBe(false);
        });

        it('returns true from row first even if map would say not banned', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('x1', { banned: false });
            expect(isCatalogCardBannedForBulkAdd('x1', 'special', { banned: true })).toBe(true);
        });
    });

    describe('availableCardsMap lookups', () => {
        it('finds banned by bare card id', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('mission-uuid-1', { banned: true, name: 'M1' });
            expect(isCatalogCardBannedForBulkAdd('mission-uuid-1', 'mission', undefined)).toBe(true);
        });

        it('finds banned by type_cardId', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('power_abc', { banned: true });
            expect(isCatalogCardBannedForBulkAdd('abc', 'power', undefined)).toBe(true);
        });

        it('for types with underscore, also tries hyphenated prefix', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('advanced-universe_xyz', { banned: true });
            expect(isCatalogCardBannedForBulkAdd('xyz', 'advanced-universe', undefined)).toBe(true);
        });

        it('returns false when map has no banned match', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('special_a', { banned: false, name: 'OK' });
            expect(isCatalogCardBannedForBulkAdd('a', 'special', undefined)).toBe(false);
        });

        it('returns false when map is missing', () => {
            delete (window as unknown as { availableCardsMap?: Map<string, unknown> }).availableCardsMap;
            expect(isCatalogCardBannedForBulkAdd('a', 'special', undefined)).toBe(false);
            (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap = new Map();
        });

        it('trims card id whitespace', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('mid', { banned: true });
            expect(isCatalogCardBannedForBulkAdd('  mid  ', 'mission', undefined)).toBe(true);
        });

        it('returns false for empty id when row not banned', () => {
            expect(isCatalogCardBannedForBulkAdd('', 'mission', {})).toBe(false);
            expect(isCatalogCardBannedForBulkAdd('   ', 'mission', {})).toBe(false);
        });
    });

    describe('combined row + map', () => {
        it('map applies when row is not explicitly banned true (only banned===true short-circuits)', () => {
            const map = (window as unknown as { availableCardsMap: Map<string, Record<string, unknown>> }).availableCardsMap;
            map.set('k1', { banned: true });
            expect(isCatalogCardBannedForBulkAdd('k1', 'special', { banned: false })).toBe(true);
            map.clear();
            expect(isCatalogCardBannedForBulkAdd('k1', 'special', { banned: false })).toBe(false);
            expect(isCatalogCardBannedForBulkAdd('k1', 'special', undefined)).toBe(false);
        });
    });
});
