import {
  deckLegalityBadge,
  deckLegalityBadgeFromValidity,
  legalityBadgeClass,
} from '../../../frontend/src/components/DeckTile/deckTileLegality';

describe('deckLegalityBadge (shared legality chip)', () => {
  it('shows Limited when is_limited, regardless of is_valid', () => {
    expect(deckLegalityBadge({ is_limited: true, is_valid: true })).toEqual({
      label: 'Limited',
      variant: 'limited',
    });
    expect(deckLegalityBadge({ is_limited: true, is_valid: false })).toEqual({
      label: 'Limited',
      variant: 'limited',
    });
  });

  it('shows Not Legal when not limited and not valid', () => {
    expect(deckLegalityBadge({ is_limited: false, is_valid: false })).toEqual({
      label: 'Not Legal',
      variant: 'not-legal',
    });
  });

  it('shows Legal when not limited and valid', () => {
    expect(deckLegalityBadge({ is_limited: false, is_valid: true })).toEqual({
      label: 'Legal',
      variant: 'legal',
    });
  });

  it('treats missing is_valid as not legal', () => {
    expect(deckLegalityBadge({}).variant).toBe('not-legal');
  });

  it('always returns a badge (never null) so legality is explicit everywhere', () => {
    expect(deckLegalityBadge({ is_limited: false, is_valid: true })).not.toBeNull();
    expect(deckLegalityBadge({ is_limited: false, is_valid: false })).not.toBeNull();
    expect(deckLegalityBadge({ is_limited: true, is_valid: true })).not.toBeNull();
  });
});

describe('deckLegalityBadgeFromValidity (deck editor parity)', () => {
  it('matches deckLegalityBadge for the same inputs', () => {
    expect(deckLegalityBadgeFromValidity(false, true)).toEqual(
      deckLegalityBadge({ is_limited: false, is_valid: true }),
    );
    expect(deckLegalityBadgeFromValidity(true, false)).toEqual(
      deckLegalityBadge({ is_limited: true, is_valid: false }),
    );
    expect(deckLegalityBadgeFromValidity(undefined, false)).toEqual(
      deckLegalityBadge({ is_valid: false }),
    );
  });
});

describe('legalityBadgeClass', () => {
  it('maps each variant to its global badge color class', () => {
    expect(legalityBadgeClass('legal')).toBe('badge-legal');
    expect(legalityBadgeClass('limited')).toBe('badge-limited');
    expect(legalityBadgeClass('not-legal')).toBe('badge-not-legal');
  });
});
