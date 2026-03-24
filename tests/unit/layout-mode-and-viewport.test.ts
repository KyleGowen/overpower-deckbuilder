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
        expect(win.LAYOUT_MOBILE_MAX_PX).toBe(768);
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
        expect(css).toContain('Global nav — stacked shell');
        expect(css).toContain('.layout-mobile .unified-header');
        expect(css).toContain('flex-direction: column');
        expect(css).toContain('.layout-mobile .header-center');
        expect(css).toContain('position: static');
        expect(css).toContain('.layout-mobile .app-tab-button');
        expect(css).toContain('min-height: 44px');
        expect(css).toContain('.layout-mobile .new-deck-btn');
        expect(css).toContain('.layout-mobile .user-menu-toggle');
        expect(css).toContain('.layout-mobile .user-menu-dropdown');
        expect(css).toContain('left: 0');
        expect(css).toContain('right: 0');
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
    });
});
