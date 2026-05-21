import fs from 'fs';
import path from 'path';

function loadEscapeJsSingleQuoted(): (value: unknown) => string {
    const filePath = path.join(__dirname, '../../public/js/load-available-cards.js');
    const source = fs.readFileSync(filePath, 'utf8');
    const preamble = source.split('async function loadAvailableCardsData')[0];
    const fn = new Function(`${preamble}\nreturn escapeJsSingleQuoted;`);
    return fn() as (value: unknown) => string;
}

describe('load-available-cards onclick escaping', () => {
    const escapeJsSingleQuoted = loadEscapeJsSingleQuoted();

    it('escapeJsSingleQuoted escapes apostrophes and backslashes', () => {
        expect(escapeJsSingleQuoted("Merlin's Magic")).toBe("Merlin\\'s Magic");
        expect(escapeJsSingleQuoted(String.raw`foo\bar`)).toBe(String.raw`foo\\bar`);
        expect(escapeJsSingleQuoted(null)).toBe('');
    });

    it('special card plus onclick parses when name has apostrophe and JSON is on data-all-cards only', () => {
        const name = "Merlin's Magic";
        const categoryType = 'special';
        const displayCardId = 'special_merlin';
        const escapedName = escapeJsSingleQuoted(name);
        const allCards = [{ id: displayCardId, name }];
        const allCardsJson = JSON.stringify(allCards).replace(/"/g, '&quot;');

        const plusOnclick = `handlePlusButtonClick(event, '${categoryType}', '${displayCardId}', '${escapedName}')`;

        expect(plusOnclick).toContain("Merlin\\'s Magic");
        expect(plusOnclick).not.toContain(allCardsJson);
        expect(plusOnclick).not.toMatch(/'Merlin's Magic'/);
        expect(() => new Function(plusOnclick)).not.toThrow();

        // Apostrophe in JSON must live in HTML attribute, not inline onclick string
        const rowHtml = `<div class="card-item" data-all-cards="${allCardsJson}"></div>`;
        expect(rowHtml).toContain("Merlin's Magic");
    });

    it('load-available-cards.js does not pass allCardsJson into plus onclick', () => {
        const source = fs.readFileSync(
            path.join(__dirname, '../../public/js/load-available-cards.js'),
            'utf8'
        );
        expect(source).toContain('function escapeJsSingleQuoted(value)');
        expect(source).toContain(
            "handlePlusButtonClick(event, '${category.type}', '${displayCard.id}', '${escapeJsSingleQuoted(name)}')"
        );
        expect(source).not.toMatch(
            /handlePlusButtonClick\([^)]*'\$\{allCardsJson\}'/
        );
    });
});
