import { formatEventLocation } from '../../../../frontend/src/lib/tournaments/formatEventLocation';

describe('formatEventLocation', () => {
  it('joins venue with city and region', () => {
    expect(
      formatEventLocation({
        venueName: 'Heroes and Games',
        city: 'Columbus',
        region: 'OH',
      }),
    ).toBe('Heroes and Games · Columbus, OH');
  });

  it('omits venue when absent', () => {
    expect(formatEventLocation({ city: 'Columbus', region: 'OH' })).toBe('Columbus, OH');
  });

  it('formats a complete street address on separate lines', () => {
    expect(formatEventLocation({
      venueName: 'Mecha Games',
      addressLine: '370 Ontario St',
      city: 'St. Catharines',
      region: 'ON',
      postalCode: 'L2R 5L8',
      country: 'Canada',
    })).toBe('Mecha Games\n370 Ontario St\nSt. Catharines, ON L2R 5L8, Canada');
  });

  it('formats an international venue without its street address on two lines', () => {
    expect(formatEventLocation({
      venueName: 'Mecha Games',
      city: 'St. Catharines',
      region: 'ON',
      country: 'Canada',
    })).toBe('Mecha Games\nSt. Catharines, ON, Canada');
  });
});
