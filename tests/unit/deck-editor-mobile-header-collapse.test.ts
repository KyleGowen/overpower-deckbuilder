import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';
import { runInNewContext } from 'vm';

describe('DEV MV deck header collapse helpers', () => {
    function setupWindow(mobile: boolean) {
        const dom = new JSDOM(
            `<!DOCTYPE html><html><body>
                <div id="deckEditorModal">
                    <div class="modal-header">
                        <div id="devMobileDeckHeaderExpandableRegion"></div>
                        <div id="devMobileDeckHeaderStats"></div>
                        <button type="button" id="devMobileDeckHeaderCollapseToggle"></button>
                    </div>
                </div>
            </body></html>`,
            { url: 'http://localhost', pretendToBeVisual: true }
        );
        const { window } = dom;
        const store: Record<string, string> = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: (k: string) => (k in store ? store[k] : null),
                setItem: (k: string, v: string) => {
                    store[k] = v;
                }
            },
            configurable: true
        });
        (window as unknown as { isLayoutMobile: () => boolean }).isLayoutMobile = () => mobile;
        const code = readFileSync(join(__dirname, '../../public/js/deck-editor-mobile-view.js'), 'utf8');
        runInNewContext(code, {
            window,
            document: window.document,
            console,
            addEventListener: window.addEventListener.bind(window),
            requestAnimationFrame: (cb: FrameRequestCallback) => window.requestAnimationFrame(cb)
        });
        return { window, dom, store };
    }

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('applyDevMobileDeckHeaderCollapsed adds/removes class and aria when layout-mobile', () => {
        const { window, dom } = setupWindow(true);
        const w = window as unknown as {
            applyDevMobileDeckHeaderCollapsed: (c: boolean) => void;
        };
        const header = window.document.querySelector('.modal-header') as HTMLElement;
        const region = window.document.getElementById('devMobileDeckHeaderExpandableRegion')!;
        const stats = window.document.getElementById('devMobileDeckHeaderStats')!;
        const btn = window.document.getElementById('devMobileDeckHeaderCollapseToggle')!;

        w.applyDevMobileDeckHeaderCollapsed(true);
        expect(header.classList.contains('dev-mobile-deck-header-collapsed')).toBe(true);
        expect(btn.getAttribute('aria-expanded')).toBe('false');
        expect(region.getAttribute('aria-hidden')).toBe('true');
        expect(stats.getAttribute('aria-hidden')).toBe('true');

        w.applyDevMobileDeckHeaderCollapsed(false);
        expect(header.classList.contains('dev-mobile-deck-header-collapsed')).toBe(false);
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        expect(region.getAttribute('aria-hidden')).toBe('false');
        expect(stats.getAttribute('aria-hidden')).toBe('false');

        dom.window.close();
    });

    it('applyDevMobileDeckHeaderCollapsed strips collapsed state when not layout-mobile', () => {
        const { window, dom } = setupWindow(true);
        const w = window as unknown as {
            applyDevMobileDeckHeaderCollapsed: (c: boolean) => void;
        };
        const header = window.document.querySelector('.modal-header') as HTMLElement;
        w.applyDevMobileDeckHeaderCollapsed(true);
        expect(header.classList.contains('dev-mobile-deck-header-collapsed')).toBe(true);

        (window as unknown as { isLayoutMobile: () => boolean }).isLayoutMobile = () => false;
        w.applyDevMobileDeckHeaderCollapsed(true);
        expect(header.classList.contains('dev-mobile-deck-header-collapsed')).toBe(false);

        dom.window.close();
    });
});
