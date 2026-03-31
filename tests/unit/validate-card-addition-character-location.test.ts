/**
 * validateCardAddition — duplicate character / location blocking (early returns, no DB).
 */

import { validateCardAddition } from '../../src/index';

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  }))
}));

describe('validateCardAddition — character and location uniqueness', () => {
  it('rejects adding the same character id again', async () => {
    const result = await validateCardAddition(
      [{ type: 'character', cardId: 'char-anubis', quantity: 1 }],
      'character',
      'char-anubis',
      1
    );
    expect(result).toBe('This character is already in the deck');
  });

  it('matches character ids after trim', async () => {
    const result = await validateCardAddition(
      [{ type: 'character', cardId: '  char-x  ', quantity: 1 }],
      'character',
      'char-x',
      1
    );
    expect(result).toBe('This character is already in the deck');
  });

  it('rejects a second location while one is already present', async () => {
    const result = await validateCardAddition(
      [{ type: 'location', cardId: 'loc-a', quantity: 1 }],
      'location',
      'loc-b',
      1
    );
    expect(result).toBe('Cannot add more than 1 location to a deck');
  });
});
