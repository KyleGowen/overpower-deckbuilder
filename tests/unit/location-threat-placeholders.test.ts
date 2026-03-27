import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';

describe('location-threat-placeholders.js', () => {
    const scriptPath = join(__dirname, '../../public/js/dbv/location-threat-placeholders.js');
    const scriptSource = readFileSync(scriptPath, 'utf8');

    function runWithLayout(isMobile: boolean) {
        const dom = new JSDOM(
            `<!DOCTYPE html><html><head></head><body>
                <input id="location-threat-min" placeholder="Min">
                <input id="location-threat-max" placeholder="Max">
            </body></html>`,
            { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost/' }
        );
        const { window } = dom;
        (window as unknown as { isLayoutMobile: () => boolean }).isLayoutMobile = () => isMobile;
        window.eval(scriptSource);
        return window;
    }

    it('sets long placeholders when layout-mobile', () => {
        const window = runWithLayout(true);
        const minEl = window.document.getElementById('location-threat-min') as HTMLInputElement;
        const maxEl = window.document.getElementById('location-threat-max') as HTMLInputElement;
        expect(minEl.placeholder).toBe('Min Threat Value');
        expect(maxEl.placeholder).toBe('Max Threat Value');
    });

    it('sets short placeholders when not layout-mobile', () => {
        const window = runWithLayout(false);
        const minEl = window.document.getElementById('location-threat-min') as HTMLInputElement;
        const maxEl = window.document.getElementById('location-threat-max') as HTMLInputElement;
        expect(minEl.placeholder).toBe('Min');
        expect(maxEl.placeholder).toBe('Max');
    });

    it('exposes syncLocationThreatFilterPlaceholders for layout-mode-change parity', () => {
        const window = runWithLayout(false);
        const sync = (window as unknown as { syncLocationThreatFilterPlaceholders: () => void })
            .syncLocationThreatFilterPlaceholders;
        expect(typeof sync).toBe('function');
    });
});
