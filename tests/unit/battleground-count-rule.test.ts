import { BattlegroundCountRule } from '../../src/services/deck-validation/rules/battleground-count.rule';
import { buildDeckValidationContext } from '../../src/services/deck-validation/deck-validation-context';
import type { DeckCard } from '../../src/types';

const rule = new BattlegroundCountRule();

function validate(cards: DeckCard[]) {
  return rule.validate(buildDeckValidationContext(cards, new Map()));
}

describe('BattlegroundCountRule', () => {
  it('allows no Battleground, one Battleground, and one Location plus one Battleground', () => {
    expect(validate([])).toEqual([]);
    expect(validate([
      { id: 'b1', type: 'battleground', cardId: 'gda', quantity: 1 },
    ])).toEqual([]);
    expect(validate([
      { id: 'l1', type: 'location', cardId: 'homebase', quantity: 1 },
      { id: 'b1', type: 'battleground', cardId: 'gda', quantity: 1 },
    ])).toEqual([]);
  });

  it('rejects more than one Battleground copy', () => {
    expect(validate([
      { id: 'b1', type: 'battleground', cardId: 'gda', quantity: 2 },
    ])).toEqual([{
      rule: 'battleground_count',
      message: 'Deck may have at most 1 battleground (found 2)',
    }]);
  });
});
