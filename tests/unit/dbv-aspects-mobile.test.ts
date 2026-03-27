/**
 * DBV Aspects tab — mobile view contract (CSS, markup, displayAspects output).
 * Spec: MOBILE_DESIGN.md §10.5, docs/current/DBV_ASPECTS_MOBILE.md
 */
import { readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('mobile-layout.css (DBV Aspects tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('documents Aspects mobile filter shell (Special-style, no function row)', () => {
        expect(css).toContain('Aspects tab — filter shell + card rows (Special-style, no function toggles)');
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+thead\s*\{[\s\S]*?display:\s*block[\s\S]*?width:\s*100%/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+thead\s+tr\.aspects-filter-row[\s\S]*?display:\s*flex[\s\S]*?flex-wrap:\s*wrap[\s\S]*?border-radius:\s*12px/
        );
    });

    it('hides desktop-only aspect filter th (clear, spacer, fort, OPD) on mobile', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+thead\s+tr\.aspects-filter-row\s*>\s*th\.aspect-filter-clear-th[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(/aspect-filter-spacer-th[\s\S]*?display:\s*none\s*!important/);
        expect(css).toMatch(/aspect-filter-fort-th[\s\S]*?display:\s*none\s*!important/);
        expect(css).toMatch(/aspect-filter-opd-th[\s\S]*?display:\s*none\s*!important/);
    });

    it('orders mobile filters: icon row → value → location → name → effect', () => {
        expect(css).toContain(
            'Mobile order: power icons row; value; location; name; effect (full-tab clear hidden on MV — end-of-file DBV block)'
        );
        expect(css).toMatch(/aspect-filter-icon-th[\s\S]*?order:\s*1/);
        expect(css).toMatch(/aspect-filter-value-th[\s\S]*?order:\s*2/);
        expect(css).toMatch(/aspect-filter-location-th[\s\S]*?order:\s*3/);
        expect(css).toMatch(/aspect-filter-name-th[\s\S]*?order:\s*4/);
        expect(css).toMatch(/aspect-filter-effect-th[\s\S]*?order:\s*5/);
    });

    it('hides full-tab clear on MV under #database-view (icon trailing collapsed)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#clear-aspects-filters-mobile[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+\.aspect-icon-mobile-trailing[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('uses the same value column-filters grid as Special Cards (8-column track + buffers)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+\.special-value-filters-inner\s+\.column-filters[\s\S]*?grid-template-columns:\s*4fr\s+85fr\s+4fr\s+125fr\s+4fr\s+125fr\s+4fr\s+45fr\s+4fr/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+\.special-value-filters-inner\s+\.column-filters\s+\.filter-input\.equals[\s\S]*?grid-column:\s*2/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+\.special-value-filters-inner\s+\.column-filters\s+\.special-no-value-toggle-label[\s\S]*?grid-column:\s*8/
        );
    });

    it('lays out tbody as card rows, hides columns 3+, and matches All/Special action grid', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+tr[\s\S]*?display:\s*block[\s\S]*?border-radius:\s*10px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:nth-child\(2\)[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*1fr\s+1fr/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:nth-child\(2\)\s+\.add-to-deck-btn[\s\S]*?grid-column:\s*1\s*\/\s*-1/
        );
    });

    it('defines Aspects art tokens and portrait max-height override (MOBILE_DBV_TD_IMG_MAX_HEIGHT_FIX)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s*\{[\s\S]*?--dbv-mobile-aspects-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(/--dbv-mobile-aspects-tile-img-max:\s*100%/);
        expect(css).toMatch(/--dbv-mobile-aspects-tile-img-landscape-max-h:\s*min\(\s*84vw\s*,\s*720px\s*\)/);
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });

    it('styles mobile caption stack and bold Fortification / One Per Deck lines', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption[\s\S]*?max-width:\s*min\(\s*666px\s*,\s*100%\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__name[\s\S]*?font-size:\s*1\.0625rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__fortification[\s\S]*?font-weight:\s*700/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__opd[\s\S]*?font-weight:\s*700/
        );
    });

    it('shows data-label pseudo labels only for cells that have data-label (not bare actions td)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#aspects-table\s+tbody\s+td\[data-label\]::before[\s\S]*?content:\s*attr\(data-label\)/
        );
    });

    it('mirrors Aspects tbody + art tokens at max-width 900px for preferDesktopLayout on narrow viewports', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#aspects-table[\s\S]*?--dbv-mobile-aspects-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#aspects-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__fortification[\s\S]*?font-weight:\s*700/
        );
    });
});

describe('database-view.css (DBV Aspects — desktop chrome)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/database-view.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('hides mobile-only icon-row Clear wrapper on desktop', () => {
        expect(css).toMatch(/#aspects-table\s+\.aspect-icon-mobile-trailing\s*\{[\s\S]*?display:\s*none/);
    });

    it('scopes value wrapper as block for Aspects value column', () => {
        expect(css).toMatch(
            /#aspects-table\s+\.aspects-value-inputs-and-clear\s*\{[\s\S]*?display:\s*block/
        );
    });

    it('matches Special Cards no-value ban button chrome on Aspects (#aspect-no-value-toggle)', () => {
        expect(css).toMatch(
            /#aspects-table\s+\.special-no-value-toggle-face[\s\S]*?width:\s*36px[\s\S]*?height:\s*36px/
        );
        expect(css).toMatch(/#aspects-table\s+#aspect-no-value-toggle:checked\s+\+\s+\.special-no-value-toggle-face/);
        expect(css).toMatch(
            /#aspects-table\s+\.special-no-value-toggle-label\s+input\[type="checkbox"\]\.visually-hidden/
        );
    });
});

describe('DBV Aspects mobile markup (index.html + template)', () => {
    const indexPath = path.join(__dirname, '../../public/index.html');
    const templatePath = path.join(__dirname, '../../public/templates/database-view-complete.html');

    it('index.html includes Aspects mobile filter structure', () => {
        const html = readFileSync(indexPath, 'utf8');
        expect(html).toContain('tr class="filter-row aspects-filter-row"');
        expect(html).toContain('aspect-filter-icon-th');
        expect(html).toContain('aspect-filter-icon-row');
        expect(html).toContain('aspect-icon-mobile-trailing');
        expect(html).toContain('id="clear-aspects-filters-mobile"');
        expect(html).toContain('clear-filters-btn--aspects-mobile-inline');
        expect(html).toContain('aspects-value-inputs-and-clear');
        expect(html).toContain('id="aspect-no-value-toggle"');
        expect(html).toContain('placeholder="Search location');
        expect(html).toContain('data-dbv-name-filter="aspects-name"');
        expect(html).toContain('placeholder="Search card text');
    });

    it('template mirrors index Aspects mobile hooks', () => {
        const html = readFileSync(templatePath, 'utf8');
        expect(html).toContain('aspects-filter-row');
        expect(html).toContain('aspect-icon-mobile-trailing');
        expect(html).toContain('clear-aspects-filters-mobile');
        expect(html).toContain('aspect-no-value-toggle');
    });
});

describe('card-display-functions.js displayAspects (mobile row contract)', () => {
    const jsPath = path.join(__dirname, '../../public/js/card-display-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('uses aspectUseMobileListArt + helpers for caption lines', () => {
        expect(source).toContain('function aspectUseMobileListArt()');
        expect(source).toContain('function aspectMobileCaptionOptionalLine(');
        expect(source).toContain('window.isLayoutMobileForCardDisplay');
        expect(source).toContain('window.isNarrowViewportDbvBand');
        expect(source).toContain('characters-mobile-card-caption__fortification');
        expect(source).toContain('characters-mobile-card-caption__opd');
    });

    it('does not put data-label on the actions column (avoids mobile ACTIONS pseudo heading)', () => {
        expect(source).not.toMatch(/<td\s+data-label="Actions"/);
    });

    it('includes lightbox context on list image', () => {
        expect(source).toContain('data-dbv-lightbox-context="aspect"');
    });
});

describe('search-filter-functions.js setupAspectSearch (layout-mode refresh)', () => {
    const jsPath = path.join(__dirname, '../../public/js/search-filter-functions.js');
    let source: string;

    beforeAll(() => {
        source = readFileSync(jsPath, 'utf8');
    });

    it('re-runs aspects search on layout-mode-change when tab is visible', () => {
        const fnBlock = source.slice(source.indexOf('function setupAspectSearch()'));
        expect(fnBlock).toContain("addEventListener('layout-mode-change'");
        expect(fnBlock).toContain("getElementById('aspects-tab')");
        expect(fnBlock).toContain('void performAspectSearch()');
        expect(fnBlock).toContain('aspectLayoutModeBound');
    });
});

/** Globals normally split across card-display.js + card-display-functions.js; stubs for isolated eval */
const CARD_DISPLAY_FUNCTIONS_ASPECTS_PREAMBLE = `
function getCurrentUser() { return null; }
function mapImagePathToActualFile(p) { return p || 'x.webp'; }
function displayLocations() {}
function formatSpecialCardEffect(t) { return String(t); }
function renderSpecialIconBadges() { return ''; }
function refreshDatabaseViewCollectionButtons() {}
`;

describe('displayAspects runtime (JSDOM)', () => {
    afterEach(() => {
        delete (global as unknown as { window?: Window; document?: Document }).window;
        delete (global as unknown as { window?: Window; document?: Document }).document;
    });

    function runDisplayAspects(
        aspects: Record<string, unknown>[],
        opts: { mobileListArt: boolean }
    ): string {
        const dom = new JSDOM(
            '<!DOCTYPE html><html><body><table><tbody id="aspects-tbody"></tbody></table></body></html>',
            { url: 'http://localhost/', pretendToBeVisual: true }
        );
        const win = dom.window as unknown as Window & {
            isLayoutMobileForCardDisplay: () => boolean;
            isNarrowViewportDbvBand: () => boolean;
            specialCardEffectPlainForMobileCaption: (s: string) => string;
            APP_CDN_BASE: string;
            displayAspects: (a: Record<string, unknown>[]) => void;
        };

        (global as unknown as { window: Window; document: Document }).window = win;
        (global as unknown as { window: Window; document: Document }).document = win.document;

        win.isLayoutMobileForCardDisplay = () => opts.mobileListArt;
        win.isNarrowViewportDbvBand = () => false;
        win.specialCardEffectPlainForMobileCaption = (s) =>
            String(s || '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        win.APP_CDN_BASE = '';

        const code = readFileSync(path.join(__dirname, '../../public/js/card-display-functions.js'), 'utf8');
        dom.window.eval(`${CARD_DISPLAY_FUNCTIONS_ASPECTS_PREAMBLE}\n${code}`);

        win.displayAspects(aspects);
        return win.document.getElementById('aspects-tbody')!.innerHTML;
    }

    it('when mobile list art: caption, fort/OPD lines, no max-height 180px inline, no actions data-label', () => {
        const html = runDisplayAspects(
            [
                {
                    id: 'a1',
                    card_name: 'Cap <Test>',
                    location: 'Here',
                    aspect_description: '<em>FX</em>',
                    image: 'f.webp',
                    value: 1,
                    is_fortification: true,
                    is_one_per_deck: true
                }
            ],
            { mobileListArt: true }
        );

        expect(html).toContain('characters-mobile-card-caption');
        expect(html).toContain('characters-mobile-card-caption__name');
        expect(html).toContain('Cap &lt;Test&gt;');
        expect(html).toContain('characters-mobile-card-caption__fortification');
        expect(html).toContain('Fortification!');
        expect(html).toContain('characters-mobile-card-caption__opd');
        expect(html).toContain('One Per Deck');
        expect(html).toContain('data-dbv-lightbox-context="aspect"');
        expect(html).not.toMatch(/data-label="Actions"/);
        expect(html).not.toContain('max-height: 180px');
        expect(html).toContain('border-radius: 5px');
    });

    it('when mobile list art: hides optional caption lines with display:none when empty', () => {
        const html = runDisplayAspects(
            [
                {
                    id: 'a2',
                    card_name: 'Plain',
                    location: '',
                    aspect_description: 'Text',
                    image: 'p.webp',
                    value: null,
                    is_fortification: false,
                    is_one_per_deck: false
                }
            ],
            { mobileListArt: true }
        );

        expect(html).toMatch(/characters-mobile-card-caption__location[^>]*style="display:none;"/);
        expect(html).toMatch(/characters-mobile-card-caption__fortification[^>]*style="display:none;"/);
        expect(html).toMatch(/characters-mobile-card-caption__opd[^>]*style="display:none;"/);
    });

    it('when desktop list art: no caption block, desktop img constraints', () => {
        const html = runDisplayAspects(
            [
                {
                    id: 'a3',
                    card_name: 'Desk',
                    location: 'X',
                    aspect_description: 'Y',
                    image: 'd.webp',
                    value: 0,
                    is_fortification: false,
                    is_one_per_deck: false
                }
            ],
            { mobileListArt: false }
        );

        expect(html).not.toContain('characters-mobile-card-caption');
        expect(html).toContain('max-height: 180px');
    });

    it('narrow viewport band without layout-mobile still uses mobile list art when isNarrowViewportDbvBand is true', () => {
        const dom = new JSDOM(
            '<!DOCTYPE html><html><body><table><tbody id="aspects-tbody"></tbody></table></body></html>',
            { url: 'http://localhost/', pretendToBeVisual: true }
        );
        const win = dom.window as unknown as Window & {
            isLayoutMobileForCardDisplay: () => boolean;
            isNarrowViewportDbvBand: () => boolean;
            specialCardEffectPlainForMobileCaption: (s: string) => string;
            APP_CDN_BASE: string;
            displayAspects: (a: Record<string, unknown>[]) => void;
        };
        (global as unknown as { window: Window; document: Document }).window = win as unknown as Window;
        (global as unknown as { window: Window; document: Document }).document = win.document;

        win.isLayoutMobileForCardDisplay = () => false;
        win.isNarrowViewportDbvBand = () => true;
        win.specialCardEffectPlainForMobileCaption = (s) =>
            String(s || '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        win.APP_CDN_BASE = '';

        const c = readFileSync(path.join(__dirname, '../../public/js/card-display-functions.js'), 'utf8');
        dom.window.eval(`${CARD_DISPLAY_FUNCTIONS_ASPECTS_PREAMBLE}\n${c}`);
        win.displayAspects([
            {
                id: 'a4',
                card_name: 'Narrow',
                location: '',
                aspect_description: 'Z',
                image: 'n.webp',
                value: 2,
                is_fortification: false,
                is_one_per_deck: false
            }
        ]);

        const html = win.document.getElementById('aspects-tbody')!.innerHTML;
        expect(html).toContain('characters-mobile-card-caption');
        expect(html).not.toContain('max-height: 180px');
        dom.window.close();
    });
});
