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

const greenGhost = {
  id: 'green-ghost',
  name: 'Green Ghost',
  character: 'Any Character',
  set: 'SKY',
  set_number: '349',
};

describe('G.D.A. Any Character Battleground rule', () => {
  it('invalidates a deck containing a G.D.A. Any Character special without the Battleground', () => {
    const errors = validate(
      [{ id: 'deck-green-ghost', type: 'special', cardId: 'green-ghost', quantity: 1 }],
      [greenGhost],
    );
    expect(errors).toEqual([{
      rule: 'gda_any_character_requires_battleground',
      message: 'G.D.A. Any Character Special cards require the "Global Defense Agency" Battleground in your deck',
    }]);
  });

  it('allows the G.D.A. special when Global Defense Agency is the deck Battleground', () => {
    const errors = validate(
      [
        { id: 'deck-green-ghost', type: 'special', cardId: 'green-ghost', quantity: 1 },
        { id: 'deck-gda', type: 'battleground', cardId: 'gda', quantity: 1 },
      ],
      [greenGhost],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([]);
  });

  it('rejects mixing G.D.A. and non-G.D.A. Any Character specials', () => {
    const errors = validate(
      [
        { id: 'deck-green-ghost', type: 'special', cardId: 'green-ghost', quantity: 1 },
        { id: 'deck-wild', type: 'special', cardId: 'wild', quantity: 1 },
        { id: 'deck-gda', type: 'battleground', cardId: 'gda', quantity: 1 },
      ],
      [greenGhost, { id: 'wild', name: 'Wild', character: 'Any Character', set: 'ERB' }],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([{
      rule: 'gda_any_character_exclusive',
      message: 'G.D.A. Any Character Special cards cannot be combined with non-G.D.A. Any Character Special cards',
    }]);
  });

  it('treats the entire Skybound 349–374 Any Character block as G.D.A. cards', () => {
    const errors = validate(
      [
        { id: 'deck-green-ghost', type: 'special', cardId: 'green-ghost', quantity: 1 },
        { id: 'deck-assist', type: 'special', cardId: 'assist', quantity: 1 },
        { id: 'deck-damien', type: 'special', cardId: 'damien', quantity: 1 },
        { id: 'deck-gda', type: 'battleground', cardId: 'gda', quantity: 1 },
      ],
      [
        greenGhost,
        { ...greenGhost, id: 'assist', name: 'Assist!', set_number: '360' },
        { ...greenGhost, id: 'damien', name: 'Damien Darkblood', set_number: '374' },
      ],
      [{ id: 'gda', name: 'Global Defense Agency' }],
    );
    expect(errors).toEqual([]);
  });

  it('does not apply to cards outside the G.D.A. set and collector-number boundary', () => {
    const errors = validate(
      [
        { id: 'deck-before', type: 'special', cardId: 'before', quantity: 1 },
        { id: 'deck-after', type: 'special', cardId: 'after', quantity: 1 },
        { id: 'deck-other-set', type: 'special', cardId: 'other-set', quantity: 1 },
      ],
      [
        { ...greenGhost, id: 'before', set_number: '348' },
        { ...greenGhost, id: 'after', set_number: '375' },
        { ...greenGhost, id: 'other-set', set: 'ERB' },
      ],
    );
    expect(errors).toEqual([]);
  });
});
