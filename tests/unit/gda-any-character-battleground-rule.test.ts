import type { DeckCard } from '../../src/types';
import { buildDeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import { GdaAnyCharacterBattlegroundRule } from '../../src/services/deck-validation/rules/gda-any-character-battleground.rule';

const rule = new GdaAnyCharacterBattlegroundRule();

function validate(
  cards: DeckCard[],
  specials: Array<Record<string, unknown>>,
  battlegrounds: Array<Record<string, unknown>> = [],
) {
  const available = new Map<string, Record<string, unknown>>();
  specials.forEach((special) => available.set(`special_${special.id}`, { ...special, type: 'special' }));
  battlegrounds.forEach((battleground) => available.set(
    `battleground_${battleground.id}`,
    { ...battleground, type: 'battleground' },
  ));
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

  it('allows the G.D.A. special when Global Defense Agency is the deck Battleground', () => {
    const errors = validate(
      [
        { id: 'deck-shapesmith', type: 'special', cardId: 'shapesmith', quantity: 1 },
        { id: 'deck-gda', type: 'battleground', cardId: 'gda', quantity: 1 },
      ],
      [shapesmith],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([]);
  });

  it('rejects mixing G.D.A. and non-G.D.A. Any Character specials', () => {
    const errors = validate(
      [
        { id: 'deck-shapesmith', type: 'special', cardId: 'shapesmith', quantity: 1 },
        { id: 'deck-wild', type: 'special', cardId: 'wild', quantity: 1 },
        { id: 'deck-gda', type: 'battleground', cardId: 'gda', quantity: 1 },
      ],
      [shapesmith, { id: 'wild', name: 'Wild', character: 'Any Character', set: 'ERB' }],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([{
      rule: 'gda_any_character_exclusive',
      message: 'G.D.A. Any Character Special cards cannot be combined with non-G.D.A. Any Character Special cards',
    }]);
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
