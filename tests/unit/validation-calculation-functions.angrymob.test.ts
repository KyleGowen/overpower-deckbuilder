import fs from 'fs';
import vm from 'vm';
import path from 'path';

describe('validation-calculation-functions Angry Mob legality', () => {
  function loadValidatorSandbox() {
    const scriptPath = path.resolve(process.cwd(), 'public/js/validation-calculation-functions.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    const sandbox: Record<string, unknown> = {
      availableCardsMap: new Map(),
      DECK_RULES: {
        EXACT_CHARACTERS: 4,
        MAX_MISSIONS: 1,
        MAX_EVENTS: 1,
        MAX_LOCATIONS: 1,
        MAX_TOTAL_THREAT: 76,
        MIN_DECK_SIZE: 51,
        MIN_DECK_SIZE_WITH_EVENTS: 56,
        MAX_COPIES_ONE_PER_DECK: 1
      },
      currentDeckData: { metadata: {} },
      deckEditorCards: [],
      document: {
        getElementById: () => null
      },
      console
    };

    vm.createContext(sandbox);
    vm.runInContext(scriptContent, sandbox);
    return sandbox;
  }

  it('marks deck not legal when two Angry Mob variants are present', () => {
    const sandbox = loadValidatorSandbox();
    const availableCardsMap = sandbox.availableCardsMap as Map<string, any>;
    const validateDeck = sandbox.validateDeck as (cards: Array<{ type: string; cardId: string; quantity: number }>) => {
      errors: string[];
      warnings: string[];
      isValid: boolean;
    };

    availableCardsMap.set('char-angry-mob-middle', { name: 'Angry Mob (Middle Ages)', threat_level: 10 });
    availableCardsMap.set('char-angry-mob-industrial', { name: 'Angry Mob (Industrial Age)', threat_level: 10 });
    availableCardsMap.set('char-anubis', { name: 'Anubis', threat_level: 15 });
    availableCardsMap.set('char-billy', { name: 'Billy the Kid', threat_level: 15 });
    availableCardsMap.set('power-energy-1', { name: '1 - Energy' });

    const result = validateDeck([
      { type: 'character', cardId: 'char-angry-mob-middle', quantity: 1 },
      { type: 'character', cardId: 'char-angry-mob-industrial', quantity: 1 },
      { type: 'character', cardId: 'char-anubis', quantity: 1 },
      { type: 'character', cardId: 'char-billy', quantity: 1 },
      { type: 'power', cardId: 'power-energy-1', quantity: 51 }
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Only one Angry Mob character variant is allowed');
    expect(result.errors).toContain('Angry Mob cannot be used with other characters');
  });
});
