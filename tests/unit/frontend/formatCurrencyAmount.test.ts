import { formatCurrencyAmount } from '../../../frontend/src/lib/formatCurrencyAmount';

describe('formatCurrencyAmount', () => {
  it('always displays exactly two decimal places', () => {
    expect(formatCurrencyAmount(12, 'USD')).toBe('$12.00');
    expect(formatCurrencyAmount(12.3, 'USD')).toBe('$12.30');
  });

  it('rounds monetary values to two decimal places', () => {
    expect(formatCurrencyAmount(12.345, 'USD')).toBe('$12.35');
    expect(formatCurrencyAmount(0.004, 'USD')).toBe('$0.00');
  });
});
