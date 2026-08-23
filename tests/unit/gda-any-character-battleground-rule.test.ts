import type { DeckCard } from '../../src/types';
import { buildDeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { GdaAnyCharacterBattlegroundRule } from '../../src/services/deck-validation/rules/gda-any-character-battleground.rule';

const rule = new GdaAnyCharacterBattlegroundRule();

function validate(
  cards: DeckCard[],
  specials: Array<Record<string, unknown>>,
  locations: Array<Record<string, unknown>> = [],
) {
  const available = new Map<string, Record<string, unknown>>();
  specials.forEach((special) => available.set(`special_${special.id}`, { ...special, type: 'special' }));
  locations.forEach((location) => available.set(`location_${location.id}`, { ...location, type: 'location' }));
  return rule.validate(buildDeckValidationContext(cards, available));
}

const shapesmith = {
  id: 'shapesmith',
  name: 'Shapesmith',
  character: 'Any Character',
  set: 'SKY',
  set_number: '370',
};

describe('G.D.A. Any Character Battleground rule', () => {
  it('invalidates a deck containing a G.D.A. Any Character special without the Battleground', () => {
    const errors = validate(
      [{ id: 'deck-shapesmith', type: 'special', cardId: 'shapesmith', quantity: 1 }],
      [shapesmith],
    );
    expect(errors).toEqual([{
      rule: 'gda_any_character_requires_battleground',
      message: 'G.D.A. Any Character Special cards require the "Global Defense Agency" Battleground in your deck',
    }]);
  });

  it('allows the G.D.A. special when Global Defense Agency is the deck location', () => {
    const errors = validate(
      [
        { id: 'deck-shapesmith', type: 'special', cardId: 'shapesmith', quantity: 1 },
        { id: 'deck-gda', type: 'location', cardId: 'gda', quantity: 1 },
      ],
      [shapesmith],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([]);
  });

  it('does not apply to other Any Character cards or similarly numbered cards from another set', () => {
    const errors = validate(
      [
        { id: 'deck-assist', type: 'special', cardId: 'assist', quantity: 1 },
        { id: 'deck-other-set', type: 'special', cardId: 'other-set', quantity: 1 },
      ],
      [
        { ...shapesmith, id: 'assist', set_number: '362' },
        { ...shapesmith, id: 'other-set', set: 'ERB' },
      ],
    );
    expect(errors).toEqual([]);
  });
});
