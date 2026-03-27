/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';

if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder as typeof global.TextEncoder;
    global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports -- load after TextEncoder polyfill for whatwg-url
const { JSDOM } = require('jsdom') as typeof import('jsdom');

function loadDbvCardNameFilter(win: Window): void {
    const jsPath = path.join(__dirname, '../../public/js/dbv-card-name-filter.js');
    const code = fs.readFileSync(jsPath, 'utf-8');
    const doc = win.document;
    const el = doc.createElement('script');
    el.textContent = code;
    doc.documentElement.appendChild(el);
    el.remove();
}

describe('dbv-card-name-filter.js', () => {
    it('exposes initDbvCardNameFilters on window', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
        });
        loadDbvCardNameFilter(dom.window as unknown as Window);
        expect(typeof (dom.window as unknown as { initDbvCardNameFilters: unknown }).initDbvCardNameFilters).toBe(
            'function'
        );
    });

    it('missions-mobile-name preset creates label, id, and missions-mobile-card-name-filter class', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
        });
        const { document, window } = dom.window;
        const host = document.createElement('div');
        host.setAttribute('data-dbv-name-filter', 'missions-mobile-name');
        document.body.appendChild(host);
        loadDbvCardNameFilter(window as unknown as Window);
        (window as unknown as { initDbvCardNameFilters: (o?: { force?: boolean }) => void }).initDbvCardNameFilters({
            force: true,
        });
        const input = document.getElementById('missions-mobile-card-name-filter') as HTMLInputElement;
        expect(input).toBeTruthy();
        expect(input.classList.contains('missions-mobile-card-name-filter')).toBe(true);
        expect(input.type).toBe('search');
        const label = host.querySelector('label[for="missions-mobile-card-name-filter"]');
        expect(label?.textContent).toContain('Card name');
    });

    it('missions-header-name preset sets missions-header-card-name-filter id and data-column', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
        });
        const { document, window } = dom.window;
        const host = document.createElement('div');
        host.setAttribute('data-dbv-name-filter', 'missions-header-name');
        document.body.appendChild(host);
        loadDbvCardNameFilter(window as unknown as Window);
        (window as unknown as { initDbvCardNameFilters: (o?: { force?: boolean }) => void }).initDbvCardNameFilters({
            force: true,
        });
        const input = document.getElementById('missions-header-card-name-filter') as HTMLInputElement;
        expect(input.getAttribute('data-column')).toBe('card_name');
        expect(input.classList.contains('header-filter')).toBe(true);
    });

    it('basic-desktop-name preset uses filter-input basic-universe id', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
        });
        const { document, window } = dom.window;
        const host = document.createElement('div');
        host.setAttribute('data-dbv-name-filter', 'basic-desktop-name');
        document.body.appendChild(host);
        loadDbvCardNameFilter(window as unknown as Window);
        (window as unknown as { initDbvCardNameFilters: (o?: { force?: boolean }) => void }).initDbvCardNameFilters({
            force: true,
        });
        const input = document.getElementById('basic-universe-card-name-filter') as HTMLInputElement;
        expect(input.className).toContain('filter-input');
        expect(input.className).toContain('basic-universe-desktop-card-name-input');
    });

    it('skips second init without force (initialized flag)', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost',
            runScripts: 'dangerously',
        });
        const { document, window } = dom.window;
        const host = document.createElement('div');
        host.setAttribute('data-dbv-name-filter', 'characters-name');
        document.body.appendChild(host);
        loadDbvCardNameFilter(window as unknown as Window);
        const init = (window as unknown as { initDbvCardNameFilters: (o?: { force?: boolean }) => void })
            .initDbvCardNameFilters;
        init();
        const first = host.querySelector('.header-filter') as HTMLInputElement;
        first.value = 'x';
        init();
        expect((host.querySelector('.header-filter') as HTMLInputElement).value).toBe('x');
    });
});
