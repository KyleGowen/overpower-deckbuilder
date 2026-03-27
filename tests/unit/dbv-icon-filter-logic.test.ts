/**
 * @jest-environment jsdom
 */

/** Parity tests for Special/Aspects icon column filtering (icons[] + no-icon + Multi-Power). */
import fs from 'fs';
import path from 'path';

describe('matchesIconsPowerTypeFilters (dbv-icon-filter-logic.js)', () => {
    beforeAll(() => {
        const code = fs.readFileSync(path.join(__dirname, '../../public/js/dbv-icon-filter-logic.js'), 'utf8');
        window.eval(code);
    });

    const m = (icons: unknown, noIconOnly: boolean, selected: string[]) =>
        (window as unknown as { matchesIconsPowerTypeFilters: (i: unknown, n: boolean, s: string[]) => boolean })
            .matchesIconsPowerTypeFilters(icons, noIconOnly, selected);

    it('no icon only: empty or missing icons', () => {
        expect(m(null, true, [])).toBe(true);
        expect(m([], true, [])).toBe(true);
        expect(m(['Combat'], true, [])).toBe(false);
    });

    it('no type selection and not no-icon: always matches', () => {
        expect(m(['Combat'], false, [])).toBe(true);
        expect(m(null, false, [])).toBe(true);
    });

    it('specific type OR', () => {
        expect(m(['Combat'], false, ['Combat'])).toBe(true);
        expect(m(['Energy'], false, ['Combat'])).toBe(false);
        expect(m(['Energy', 'Combat'], false, ['Combat', 'Energy'])).toBe(true);
    });

    it('Multi-Power means at least two icons', () => {
        expect(m(['Combat', 'Energy'], false, ['Multi-Power'])).toBe(true);
        expect(m(['Combat'], false, ['Multi-Power'])).toBe(false);
    });

    it('Multi-Power OR specific type', () => {
        expect(m(['Combat'], false, ['Multi-Power', 'Combat'])).toBe(true);
        expect(m(['Combat', 'Energy'], false, ['Multi-Power', 'Intelligence'])).toBe(true);
    });
});
