/**
 * Layout mode (public/js/layout-mode.js) and viewport clamp (viewport-positioning.js)
 */
import { readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

function runScriptInDom(dom: JSDOM, filename: string): void {
    const filePath = path.join(__dirname, '../../public/js', filename);
    const code = readFileSync(filePath, 'utf8');
    const w = dom.window as unknown as Window;
    (global as unknown as { window: Window; document: Document }).window = w;
    (global as unknown as { window: Window; document: Document }).document = w.document;
    dom.window.eval(code);
}

describe('viewport-positioning.js', () => {
    it('clampRectToViewport keeps rect inside viewport with padding', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/',
            pretendToBeVisual: true
        });
        Object.defineProperty(dom.window, 'innerWidth', { value: 400, configurable: true });
        Object.defineProperty(dom.window, 'innerHeight', { value: 800, configurable: true });
        (global as unknown as { window: Window }).window = dom.window as unknown as Window;
        runScriptInDom(dom, 'viewport-positioning.js');
        const w = dom.window as unknown as { clampRectToViewport: (l: number, t: number, ww: number, h: number, p?: number) => { left: number; top: number } };
        const r = w.clampRectToViewport(500, 10, 200, 100, 8);
        expect(r.left).toBeLessThanOrEqual(400 - 200 - 8);
        expect(r.left).toBeGreaterThanOrEqual(8);
        dom.window.close();
    });
});

describe('layout-mode.js', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        delete (global as unknown as { window?: Window }).window;
        delete (global as unknown as { document?: Document }).document;
    });

    it('sets layout-mobile when matchMedia matches narrow width', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
            url: 'http://localhost/',
            pretendToBeVisual: true
        });
        const win = dom.window as unknown as Window & {
            matchMedia: (q: string) => MediaQueryList;
            localStorage: Storage;
            LAYOUT_MOBILE_MAX_PX: number;
            isLayoutMobile: () => boolean;
        };
        (global as unknown as { window: Window }).window = win;

        const mql = {
            matches: true,
            media: '',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
            onchange: null
        };
        win.matchMedia = jest.fn().mockReturnValue(mql);
        const ls1 = {
            getItem: jest.fn().mockReturnValue(null),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
            key: jest.fn(),
            length: 0
        };
        Object.defineProperty(win, 'localStorage', { value: ls1, configurable: true });

        runScriptInDom(dom as unknown as JSDOM, 'layout-mode.js');

        expect(win.document.documentElement.classList.contains('layout-mobile')).toBe(true);
        expect(win.document.documentElement.classList.contains('layout-desktop')).toBe(false);
        expect(win.LAYOUT_MOBILE_MAX_PX).toBe(900);
        expect(win.isLayoutMobile()).toBe(true);
        dom.window.close();
    });

    it('setPreferDesktopLayout forces layout-desktop on narrow mq', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
            url: 'http://localhost/',
            pretendToBeVisual: true
        });
        const win = dom.window as unknown as Window & {
            matchMedia: (q: string) => MediaQueryList;
            localStorage: Storage;
            setPreferDesktopLayout: (on: boolean) => void;
        };
        (global as unknown as { window: Window }).window = win;

        const mql = {
            matches: true,
            media: '',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
            onchange: null
        };
        win.matchMedia = jest.fn().mockReturnValue(mql);
        const store: Record<string, string> = {};
        const ls2 = {
            getItem: (k: string) => store[k] ?? null,
            setItem: (k: string, v: string) => {
                store[k] = v;
            },
            removeItem: (k: string) => {
                delete store[k];
            },
            clear: () => {
                Object.keys(store).forEach((k) => delete store[k]);
            },
            key: jest.fn(),
            length: 0
        };
        Object.defineProperty(win, 'localStorage', { value: ls2, configurable: true });

        runScriptInDom(dom as unknown as JSDOM, 'layout-mode.js');
        win.setPreferDesktopLayout(true);
        expect(win.document.documentElement.classList.contains('layout-desktop')).toBe(true);
        expect(store.preferDesktopLayout).toBe('1');
        dom.window.close();
    });

    it('dispatches layout-mode-change when setPreferDesktopLayout runs', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
            url: 'http://localhost/',
            pretendToBeVisual: true
        });
        const win = dom.window as unknown as Window & {
            matchMedia: (q: string) => MediaQueryList;
            localStorage: Storage;
            setPreferDesktopLayout: (on: boolean) => void;
        };
        (global as unknown as { window: Window }).window = win;

        const mql = {
            matches: false,
            media: '',
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
            onchange: null
        };
        win.matchMedia = jest.fn().mockReturnValue(mql);
        const store: Record<string, string> = {};
        const ls3 = {
            getItem: (k: string) => store[k] ?? null,
            setItem: (k: string, v: string) => {
                store[k] = v;
            },
            removeItem: (k: string) => {
                delete store[k];
            },
            clear: () => {
                Object.keys(store).forEach((k) => delete store[k]);
            },
            key: jest.fn(),
            length: 0
        };
        Object.defineProperty(win, 'localStorage', { value: ls3, configurable: true });

        const dispatchSpy = jest.spyOn(win, 'dispatchEvent');

        runScriptInDom(dom as unknown as JSDOM, 'layout-mode.js');

        const layoutChangeEvents = () =>
            dispatchSpy.mock.calls.filter((c) => {
                const ev = c[0] as CustomEvent;
                return ev && ev.type === 'layout-mode-change';
            });

        win.setPreferDesktopLayout(true);
        expect(layoutChangeEvents().length).toBeGreaterThanOrEqual(1);
        const last = layoutChangeEvents().pop()?.[0] as CustomEvent;
        expect(last?.type).toBe('layout-mode-change');

        dispatchSpy.mockClear();
        win.setPreferDesktopLayout(false);
        expect(
            dispatchSpy.mock.calls.some((c) => (c[0] as CustomEvent).type === 'layout-mode-change')
        ).toBe(true);

        dispatchSpy.mockRestore();
        dom.window.close();
    });
});

describe('mobile-layout.css (M1 shell)', () => {
    it('includes global nav stacking and 44px touch targets under .layout-mobile', () => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        const css = readFileSync(cssPath, 'utf8');
        expect(css).toMatch(/--layout-mobile-max:\s*900px/);
        expect(css).toMatch(/#database-view\s+\.tab-container[\s\S]*?max-width:\s*732px/);
        expect(css).toMatch(/\.layout-mobile\s+#database-view\s+\.tab-container[\s\S]*?align-items:\s*stretch/);
        expect(css).toMatch(/\.layout-mobile\s+#database-view\s+\.tab-row[\s\S]*?width:\s*100%/);
        expect(css).toMatch(/\.tab-button\[data-tab="all-cards"\][\s\S]*?flex:\s*0\s+0\s+100%/);
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#all-cards-grid-container[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/
        );
        expect(css).toContain('All tab cell actions: row 1 = +Deck full width');
        expect(css).toContain('Global nav — logo left; 2×2 app grid');
        expect(css).toMatch(/\.layout-mobile\s+\.unified-header[\s\S]*?flex-direction:\s*row/);
        expect(css).toContain('.layout-mobile .unified-header');
        expect(css).toContain('.layout-mobile .header-center');
        expect(css).toContain('position: static');
        expect(css).toMatch(
            /\.layout-mobile\s+\.header-app-actions[\s\S]*?grid-template-columns:\s*1fr\s+1fr/
        );
        expect(css).toContain('.layout-mobile .header-nav-cluster');
        expect(css).toContain('.layout-mobile .header-app-actions .app-tab-button');
        expect(css).toContain('min-height: 44px');
        expect(css).toContain('.layout-mobile #newDeckBtn');
        expect(css).toMatch(
            /\.layout-mobile\s+\.user-menu-toggle[\s\S]*?justify-content:\s*flex-end/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+\.user-menu-dropdown[\s\S]*?width:\s*50%[\s\S]*?max-width:\s*50%/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+\.user-menu-dropdown[\s\S]*?left:\s*auto[\s\S]*?right:\s*0/
        );
    });

    it('sizes #imageModal preview frame to fit content and caps #modalImage to the viewport', () => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        const css = readFileSync(cssPath, 'utf8');
        expect(css).toMatch(
            /\.layout-mobile\s+#imageModal\s+\.modal-content[\s\S]*?width:\s*fit-content\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#imageModal\s+#modalImage[\s\S]*?max-width:\s*calc\(\s*100vw\s*-\s*32px\s*\)\s*!important[\s\S]*?max-height:\s*calc\(\s*100dvh\s*-\s*160px\s*\)\s*!important/
        );
    });
});

/**
 * DBV Characters tab under `.layout-mobile`: card-row tbody, art sizing tied to All tab tokens,
 * three-line caption, +Deck / collection grid. Spec: MOBILE_DESIGN.md §10.2–10.3; CSS mobile-layout.css.
 */
describe('mobile-layout.css (DBV Characters tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('defines --dbv-mobile-tile-* on #database-view and applies them to All-tab tile images', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s*\{[\s\S]*?container-type:\s*inline-size[\s\S]*?--dbv-mobile-tile-img-max:\s*100%/m
        );
        expect(css).toMatch(/--dbv-mobile-tile-img-landscape-max-h:\s*min\(\s*56cqw\s*,\s*480px\s*\)/);
        expect(css).toMatch(/--dbv-mobile-table-portrait-img:\s*min\(\s*100%\s*,\s*580px\s*\)/);
        expect(css).toMatch(
            /--dbv-mobile-table-portrait-img-with-nav:\s*min\(\s*calc\(\s*100%\s*-\s*96px\s*\)\s*,\s*520px\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#all-cards-grid-container\s+\.all-cards-img-wrap[\s\S]*?max-width:\s*var\(\s*--dbv-mobile-tile-img-max\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#database-view\s+#all-cards-grid-container\s+\.all-cards-cell\s+img\.horizontal-card[\s\S]*?width:\s*100%[\s\S]*?max-height:\s*none/
        );
    });

    it('lays out Character rows as cards and hides name/stat columns on mobile', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s*\{[\s\S]*?table-layout:\s*auto\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+tr[\s\S]*?display:\s*block[\s\S]*?border-radius:\s*10px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
    });

    it('uses the same +Deck / collection action grid as the All tab', () => {
        expect(css).toContain('Characters row actions: +Deck full width');
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:nth-child\(2\)[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*1fr\s+1fr/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:nth-child\(2\)\s+\.add-to-deck-btn[\s\S]*?grid-column:\s*1\s*\/\s*-1/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:nth-child\(2\)\s+\.remove-from-collection-btn[\s\S]*?grid-row:\s*2/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:nth-child\(2\)\s+\.add-to-collection-btn[\s\S]*?grid-column:\s*2/
        );
    });

    it('sizes Character art with DBV tile tokens and landscape horizontal-card max-height', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.card-image-container[\s\S]*?width:\s*100%[\s\S]*?max-width:\s*100%/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?width:\s*var\(\s*--dbv-mobile-table-portrait-img\s*\)\s*!important[\s\S]*?max-height:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.card-image-container\s+img\.horizontal-card[\s\S]*?max-height:\s*var\(\s*--dbv-mobile-tile-img-landscape-max-h\s*\)\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+\.card-nav-arrow[\s\S]*?min-width:\s*44px/
        );
    });

    it('shows the mobile caption stack with name, ability, and set line font sizes', () => {
        expect(css).toMatch(
            /#characters-table\s+\.characters-mobile-card-caption\s*,\s*#special-cards-table\s+\.characters-mobile-card-caption\s*,\s*#locations-table\s+\.characters-mobile-card-caption\s*,\s*#aspects-table\s+\.characters-mobile-card-caption\s*,\s*#events-table\s+\.characters-mobile-card-caption\s*\{[\s\S]*?display:\s*none/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption[\s\S]*?flex-direction:\s*column[\s\S]*?max-width:\s*min\(\s*444px\s*,\s*100%\s*\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__name[\s\S]*?font-size:\s*1\.0625rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__ability[\s\S]*?font-size:\s*0\.875rem[\s\S]*?word-break:\s*break-word/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#characters-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__set[\s\S]*?font-size:\s*0\.8125rem/
        );
    });

    it('lays out Locations rows as cards with portrait max-height override and filter shell', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#locations-table\s+thead\s+tr\.locations-filter-row[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#locations-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#locations-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#locations-table\s+#clear-location-filters-mobile\.clear-filters-btn--locations-mobile-inline[\s\S]*?display:\s*inline-flex/
        );
        expect(css).toMatch(
            /#database-view\s+#locations-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?max-height:\s*none\s*!important/
        );
    });
});

/**
 * DBV Special Cards tab under `.layout-mobile`: filter shell, card-row tbody, shared caption classes,
 * All-tab tile tokens on art, +Deck / collection grid. Spec: MOBILE_DESIGN.md §10; CSS mobile-layout.css.
 */
describe('mobile-layout.css (DBV Special Cards tab)', () => {
    let css: string;

    beforeAll(() => {
        const cssPath = path.join(__dirname, '../../public/css/mobile-layout.css');
        css = readFileSync(cssPath, 'utf8');
    });

    it('uses block thead, flex filter shell, and full-width th to beat database-view !important column widths', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr:first-child[\s\S]*?clip:\s*rect\(0,\s*0,\s*0,\s*0\)/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s*\{[\s\S]*?display:\s*block[\s\S]*?width:\s*100%/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*row[\s\S]*?flex-wrap:\s*wrap[\s\S]*?border-radius:\s*12px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row\s*>\s*th\.special-filter-character-th[\s\S]*?width:\s*100%\s*!important[\s\S]*?max-width:\s*100%\s*!important/
        );
        expect(css).not.toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row\s*>\s*th\.special-filter-icon-th::before/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row\s*>\s*th\.special-filter-clear-th[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toContain('Mobile visual order: function row (toggles | Clear)');
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row\s+\.special-function-filter-toggles[\s\S]*?justify-content:\s*center/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+thead\s+tr\.special-cards-filter-row\s+\.special-power-filter-toggles[\s\S]*?justify-content:\s*center/
        );
        expect(css).toMatch(/special-filter-function-th[\s\S]*?order:\s*1/);
        expect(css).toMatch(/special-filter-value-th[\s\S]*?order:\s*3/);
        expect(css).toMatch(/special-filter-character-th[\s\S]*?order:\s*4/);
        expect(css).toMatch(/special-filter-effect-th[\s\S]*?order:\s*6/);
    });

    it('stacks value filters in a column sheet; mobile Clear is compact on function row (44px min height)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+\.special-value-inputs-and-clear[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*column/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+#clear-special-filters-mobile\.clear-filters-btn--special-mobile-inline[\s\S]*?min-height:\s*44px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+\.special-function-mobile-trailing[\s\S]*?display:\s*inline-flex/
        );
    });

    it('lays out Special rows as cards, hides columns 3+, and matches All/Characters action grid', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+tr[\s\S]*?display:\s*block[\s\S]*?border-radius:\s*10px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:nth-child\(n\+3\)[\s\S]*?display:\s*none\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:nth-child\(2\)[\s\S]*?display:\s*grid[\s\S]*?grid-template-columns:\s*1fr\s+1fr/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:nth-child\(2\)\s+\.add-to-deck-btn[\s\S]*?grid-column:\s*1\s*\/\s*-1/
        );
    });

    it('defines Special-only art tokens on #special-cards-table (~1.5x vs shared DBV portrait/tile vars)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s*\{[\s\S]*?--dbv-mobile-special-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(/--dbv-mobile-special-tile-img-max:\s*100%/);
        expect(css).toMatch(/--dbv-mobile-special-tile-img-landscape-max-h:\s*min\(\s*84vw\s*,\s*720px\s*\)/);
    });

    it('sizes Special art with Special-scoped tokens, horizontal-card max-height, and 44px nav arrows', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.card-image-container:not\(\.card-image-container--with-nav\)\s+img:not\(\.horizontal-card\)[\s\S]*?width:\s*var\(\s*--dbv-mobile-special-portrait-img\s*\)\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.card-image-container\.card-image-container--with-nav\s+img:not\(\.horizontal-card\)[\s\S]*?flex:\s*1\s+1\s+0\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.card-image-container\s+img\.horizontal-card[\s\S]*?max-height:\s*var\(\s*--dbv-mobile-special-tile-img-landscape-max-h\s*\)\s*!important/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#(characters|special-cards)-table\s+tbody\s+\.card-nav-arrow[\s\S]*?min-width:\s*44px/
        );
    });

    it('shows mobile caption typography for Special cards (shared classes)', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption[\s\S]*?flex-direction:\s*column/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__name[\s\S]*?font-size:\s*1\.0625rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__character[\s\S]*?font-size:\s*1rem/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#special-cards-table\s+tbody\s+td:first-child\s+\.characters-mobile-card-caption__opd[\s\S]*?font-size:\s*0\.8125rem/
        );
    });

    it('scales Special hover preview and lightbox caps under layout-mobile', () => {
        expect(css).toMatch(
            /\.layout-mobile\s+\.card-hover-modal\[data-card-type='special'\][\s\S]*?padding:\s*6px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+\.card-hover-modal\[data-card-type='special'\]\s+\.card-hover-image[\s\S]*?max-width:\s*min\(\s*518px/
        );
        expect(css).toMatch(
            /\.layout-mobile\s+#imageModal\[data-open-context='special'\]\s+#modalImage[\s\S]*?width:\s*min\(\s*600px/
        );
    });

    it('mirrors Special tbody list art and hover/lightbox at max-width 900px without layout-mobile', () => {
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?#database-view\s+#special-cards-table[\s\S]*?--dbv-mobile-special-portrait-img:\s*min\(\s*100%\s*,\s*870px\s*\)/
        );
        expect(css).toMatch(
            /@media\s*\(\s*max-width:\s*900px\s*\)[\s\S]*?\.card-hover-modal\[data-card-type='special'\][\s\S]*?max-width:\s*min\(\s*518px/
        );
    });
});

describe('public/index.html mobile layout wiring', () => {
    it('loads layout-mode and viewport-positioning before first app stylesheet and includes mobile-layout.css', () => {
        const indexPath = path.join(__dirname, '../../public/index.html');
        const html = readFileSync(indexPath, 'utf8');
        const layoutIdx = html.indexOf('src="/js/layout-mode.js"');
        const vpIdx = html.indexOf('src="/js/viewport-positioning.js"');
        const firstAppCss = html.indexOf('href="/css/index.css"');
        const mobileCssIdx = html.indexOf('href="/css/mobile-layout.css"');
        expect(layoutIdx).toBeGreaterThan(0);
        expect(vpIdx).toBeGreaterThan(layoutIdx);
        expect(firstAppCss).toBeGreaterThan(vpIdx);
        expect(mobileCssIdx).toBeGreaterThan(firstAppCss);
        expect(html).toContain('<div id="all-cards-grid-container">');
        expect(html).not.toMatch(/id="all-cards-grid-container"[^>]*repeat\(5/);
        expect(html).toContain('special-cards-filter-row');
        expect(html).toContain('id="clear-special-filters-mobile"');
        expect(html).toContain('special-function-mobile-trailing');
        expect(html).toContain('clear-filters-btn--special-mobile-inline');
        expect(html).toContain('aspects-filter-row');
        expect(html).toContain('id="clear-aspects-filters-mobile"');
        expect(html).toContain('clear-filters-btn--aspects-mobile-inline');
    });
});
