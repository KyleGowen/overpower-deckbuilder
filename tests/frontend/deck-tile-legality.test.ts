import { deckTileLegalityBadge } from '../../frontend/src/components/DeckTile/deckTileLegality';

describe('deckTileLegalityBadge', () => {
  it('returns null for legal standard decks', () => {
    expect(deckTileLegalityBadge({ is_valid: true, is_limited: false })).toBeNull();
  });

  it('returns Not Legal when invalid and not limited', () => {
    expect(deckTileLegalityBadge({ is_valid: false, is_limited: false })).toEqual({
      label: 'Not Legal',
      variant: 'not-legal',
    });
  });

  it('returns Limited when is_limited', () => {
    expect(deckTileLegalityBadge({ is_valid: true, is_limited: true })).toEqual({
      label: 'Limited',
      variant: 'limited',
    });
  });

  it('returns Limited only when both limited and invalid', () => {
    expect(deckTileLegalityBadge({ is_valid: false, is_limited: true })).toEqual({
      label: 'Limited',
      variant: 'limited',
    });
  });
});
