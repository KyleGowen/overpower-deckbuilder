/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';

function execFrontendScript(relPathFromRepoRoot: string) {
  const scriptPath = path.join(__dirname, '../..', relPathFromRepoRoot);
  const code = fs.readFileSync(scriptPath, 'utf8');
  new Function(code)();
}

describe('Special function icon rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="special-cards-table"><tbody id="special-cards-tbody"></tbody></table>
      <div id="special-cards-tab" style="display:block;"></div>
      <div id="characters-tab" style="display:none;"></div>
    `;

    (window as any).Alphabetization = {
      compare: (a: string, b: string) => String(a).localeCompare(String(b))
    };
    (globalThis as any).mapImagePathToActualFile = (value: string) => value;
    (globalThis as any).getCurrentUser = jest.fn(() => null);
    (globalThis as any).refreshDatabaseViewCollectionButtons = jest.fn();

    execFrontendScript('public/js/dbv/dbv-layout-context.js');
    execFrontendScript('public/js/dbv/dbv-render-shared.js');
    execFrontendScript('public/js/card-display.js');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).getSpecialFunctionIcons;
    delete (window as any).renderSpecialFunctionIcons;
    delete (window as any).displaySpecialCards;
    delete (window as any).Alphabetization;
    delete (globalThis as any).mapImagePathToActualFile;
    delete (globalThis as any).getCurrentUser;
    delete (globalThis as any).refreshDatabaseViewCollectionButtons;
  });

  it('maps all enabled icon fields to expected image paths', () => {
    const iconData = (window as any).getSpecialFunctionIcons({
      icon_offensive_swords: true,
      icon_defensive_shield: true,
      icon_remainder_of_battle: true,
      icon_remainder_of_game: true,
      icon_attached_paperclip: true,
      icon_astral_plane: true,
      icon_first_action_only: true
    });

    expect(iconData).toHaveLength(7);
    expect(iconData.map((icon: any) => icon.field)).toEqual([
      'icon_offensive_swords',
      'icon_defensive_shield',
      'icon_remainder_of_battle',
      'icon_remainder_of_game',
      'icon_attached_paperclip',
      'icon_astral_plane',
      'icon_first_action_only'
    ]);
    expect(iconData.map((icon: any) => icon.path)).toEqual([
      '/src/resources/images/icons/function/offensive_action.png',
      '/src/resources/images/icons/function/defensive_action.png',
      '/src/resources/images/icons/function/reminder_of_battle.png',
      '/src/resources/images/icons/function/reminder_of_game.png',
      '/src/resources/images/icons/function/attach_to_a_character.png',
      '/src/resources/images/icons/function/astral_plane.png',
      '/src/resources/images/icons/function/first_icon.png'
    ]);
  });

  it('renders dash placeholder when no icons are enabled', () => {
    const markup = (window as any).renderSpecialFunctionIcons({});
    expect(markup).toContain('special-function-icons-empty');
    expect(markup).toContain('>-<');
  });

  it('renders one image per true function icon in the function column', () => {
    const cards = [
      {
        id: 'sp1',
        name: 'Function Test Card',
        character: 'Angry Mob',
        universe: 'MA',
        image_path: 'specials/function_test.webp',
        card_effect: 'Test effect text',
        icon_offensive_swords: true,
        icon_remainder_of_game: true,
        icon_first_action_only: true
      }
    ];

    (window as any).displaySpecialCards(cards);

    const row = document.querySelector('#special-cards-tbody tr');
    expect(row).toBeTruthy();
    expect(row?.querySelectorAll('td')).toHaveLength(8);

    const functionCell = row?.querySelector('td:nth-child(8)');
    expect(functionCell).toBeTruthy();

    const icons = functionCell?.querySelectorAll('img.special-function-icon') || [];
    expect(icons).toHaveLength(3);
    expect(Array.from(icons).map((icon) => icon.getAttribute('src'))).toEqual([
      '/src/resources/images/icons/function/offensive_action.png',
      '/src/resources/images/icons/function/reminder_of_game.png',
      '/src/resources/images/icons/function/first_icon.png'
    ]);
  });
});
