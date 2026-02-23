/**
 * @jest-environment jsdom
 *
 * Regression tests for database view image loading.
 * Ensures card images use native `src` attribute (not just data-src).
 *
 * Context: Images failed to load when using data-src + ImageLoadQueue.
 * The fix was to set src directly on img elements so the browser loads them natively.
 * These tests prevent that regression.
 */

import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  new Function(code)();
}

function loadAlphabetization() {
  execFrontendScript('public/js/alphabetization.js');
  return (window as any).Alphabetization;
}

function ensureMinimalImageHelpers() {
  (globalThis as any).mapImagePathToActualFile = (p: string) => p;
}

describe('Database view image src regression', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete (window as any).Alphabetization;
    delete (window as any).displayCharacters;
    delete (window as any).displaySpecialCards;
    delete (window as any).displayLocations;
    delete (window as any).renderCardCell;
    delete (globalThis as any).mapImagePathToActualFile;
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Characters tab - img must have src attribute', () => {
    it('renders character images with src attribute for browser to load', () => {
      loadAlphabetization();
      ensureMinimalImageHelpers();
      execFrontendScript('public/js/card-image-utils.js');
      execFrontendScript('public/js/card-display.js');

      document.body.innerHTML = `
        <table><tbody id="characters-tbody"></tbody></table>
        <div id="characters-tab" style="display:block;"></div>
      `;

      const characters = [
        {
          id: 'c1',
          name: 'Tarzan',
          universe: 'ERB',
          image_path: 'characters/tarzan.webp',
          threat_level: 18,
          energy: 1,
          combat: 1,
          brute_force: 1,
          intelligence: 1,
          special_abilities: ''
        }
      ];

      (window as any).displayCharacters(characters);

      const imgs = document.querySelectorAll('#characters-tbody img');
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => {
        expect(img.hasAttribute('src')).toBe(true);
        expect((img.getAttribute('src') || '').length).toBeGreaterThan(0);
        expect(img.getAttribute('src')).not.toBe('data:image/gif;base64,');
        expect((img.getAttribute('src') || '').toLowerCase()).toMatch(/\.(webp|png|jpg|svg)/);
      });
    });
  });

  describe('Special Cards tab - img must have src attribute', () => {
    it('renders special card images with src attribute for browser to load', () => {
      loadAlphabetization();
      ensureMinimalImageHelpers();
      execFrontendScript('public/js/card-image-utils.js');
      execFrontendScript('public/js/card-display.js');

      document.body.innerHTML = `
        <table><tbody id="special-cards-tbody"></tbody></table>
        <div id="special-cards-tab" style="display:block;"></div>
      `;

      const specialCards = [
        {
          id: 's1',
          name: '3 Quick Strokes',
          character: 'Zorro',
          universe: 'MA',
          image_path: 'specials/quick_strokes.webp',
          card_effect: ''
        }
      ];

      (window as any).displaySpecialCards(specialCards);

      const imgs = document.querySelectorAll('#special-cards-tbody img');
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => {
        expect(img.hasAttribute('src')).toBe(true);
        expect((img.getAttribute('src') || '').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Locations tab - img must have src attribute', () => {
    it('renders location images with src attribute for browser to load', () => {
      loadAlphabetization();
      ensureMinimalImageHelpers();
      execFrontendScript('public/js/card-image-utils.js');
      execFrontendScript('public/js/card-display.js');

      document.body.innerHTML = `
        <table><tbody id="locations-tbody"></tbody></table>
        <div id="locations-tab" style="display:block;"></div>
      `;

      const locations = [
        {
          id: 'l1',
          name: 'Barsoom',
          threat_level: 0,
          special_ability: '',
          image_path: 'locations/barsoom.webp'
        }
      ];

      (window as any).displayLocations(locations);

      const imgs = document.querySelectorAll('#locations-tbody img');
      expect(imgs.length).toBeGreaterThan(0);
      imgs.forEach((img) => {
        expect(img.hasAttribute('src')).toBe(true);
        expect((img.getAttribute('src') || '').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Source code - DBV img templates must include src attribute', () => {
    it('card-display.js img templates use src= for native loading (Characters, Specials, Locations)', () => {
      const cardDisplayPath = path.join(__dirname, '../../public/js/card-display.js');
      const code = fs.readFileSync(cardDisplayPath, 'utf8');
      // Must have src="${currentImagePath}" - regression: was data-src only + ImageLoadQueue
      expect(code).toMatch(/src="\$\{currentImagePath\}"/);
    });

    it('all-cards-display.js img template uses src= for native loading', () => {
      const allCardsPath = path.join(__dirname, '../../public/js/all-cards-display.js');
      const code = fs.readFileSync(allCardsPath, 'utf8');
      // renderCardCell img must have src="${imagePath}" - regression: was data-src only
      expect(code).toMatch(/src="\$\{imagePath\}"/);
    });
  });
});
