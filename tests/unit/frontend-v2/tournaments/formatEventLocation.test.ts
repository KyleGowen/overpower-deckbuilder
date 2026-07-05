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
});
