/**
 * validateCardAddition — mission/character/location limits apply only when adding that type.
 */

import { validateCardAddition } from '../../src/index';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

function missionRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    type: 'mission',
    cardId: `mission-${i + 1}`,
    quantity: 1,
  }));
}

describe('validateCardAddition — type-scoped deck limits', () => {
  it('allows adding teamwork when deck already has more than 7 mission rows', async () => {
    const result = await validateCardAddition(missionRows(13), 'teamwork', 'teamwork-1', 1);
    expect(result).toBeNull();
  });

  it('rejects adding an 8th mission row when deck already has 7', async () => {
    const result = await validateCardAddition(missionRows(7), 'mission', 'mission-8', 1);
    expect(result).toBe('Deck cannot have more than 7 mission cards (would have 8)');
  });

  it('allows adding special when deck already has more than 4 characters', async () => {
    const currentCards = Array.from({ length: 5 }, (_, i) => ({
      type: 'character',
      cardId: `char-${i + 1}`,
      quantity: 1,
    }));
    const result = await validateCardAddition(currentCards, 'special', 'special-1', 1);
    expect(result).toBeNull();
  });
});
