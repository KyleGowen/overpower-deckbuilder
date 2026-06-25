import {
  deriveFoilVars,
  foilIntroPlayedKeys,
  foilVarsFingerprint,
  hasFoilIntroPlayed,
  markFoilIntroPlayed,
  shouldShowFoilEffect,
} from '../../../frontend/src/lib/visual/foilEffect';

describe('deriveFoilVars', () => {
  it('returns identical vars for the same seed', () => {
    expect(deriveFoilVars('card-abc')).toEqual(deriveFoilVars('card-abc'));
    expect(foilVarsFingerprint('card-abc')).toBe(foilVarsFingerprint('card-abc'));
  });

  it('returns different fingerprints for different seeds', () => {
    const seeds = Array.from({ length: 20 }, (_, i) => `seed-${i}-unique`);
    const fingerprints = new Set(seeds.map((s) => foilVarsFingerprint(s)));
    expect(fingerprints.size).toBeGreaterThanOrEqual(15);
  });

  it('produces distinct vars for deck instance seeds', () => {
    expect(foilVarsFingerprint('card-1::inst-a')).not.toBe(foilVarsFingerprint('card-1::inst-b'));
  });
});

describe('shouldShowFoilEffect', () => {
  it('returns true when isFoilFlag is true', () => {
    expect(shouldShowFoilEffect({ isFoilFlag: true })).toBe(true);
  });

  it('returns true when cardId is a foil catalog id', () => {
    const foilToBase = new Map([['foil-id', 'base-id']]);
    expect(shouldShowFoilEffect({ cardId: 'foil-id', foilToBase })).toBe(true);
  });

  it('returns false for base cards without foil flag', () => {
    const foilToBase = new Map([['foil-id', 'base-id']]);
    expect(shouldShowFoilEffect({ cardId: 'base-id', foilToBase })).toBe(false);
    expect(shouldShowFoilEffect({})).toBe(false);
  });
});

describe('foil intro session tracking', () => {
  beforeEach(() => {
    foilIntroPlayedKeys.clear();
  });

  it('tracks played intro keys per session', () => {
    expect(hasFoilIntroPlayed('seed-a')).toBe(false);
    markFoilIntroPlayed('seed-a');
    expect(hasFoilIntroPlayed('seed-a')).toBe(true);
    expect(hasFoilIntroPlayed('seed-b')).toBe(false);
  });
});
