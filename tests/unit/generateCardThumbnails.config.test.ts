import {
  PRESET_CHARACTER,
  PRESET_LOCATION,
  PRESET_PORTRAIT,
  THUMB_CONFIGS,
} from '../../src/scripts/generateCardThumbnails';

describe('generateCardThumbnails THUMB_CONFIGS', () => {
  it('uses contain for landscape character thumbs', () => {
    expect(THUMB_CONFIGS.characters).toBe(PRESET_CHARACTER);
    expect(PRESET_CHARACTER.fit).toBe('contain');
    expect(PRESET_CHARACTER.width).toBe(380);
    expect(PRESET_CHARACTER.height).toBe(280);
  });

  it('uses portrait contain preset for special and universe folders', () => {
    const portraitFolders = [
      'specials',
      'power-cards',
      'aspects',
      'advanced-universe',
      'teamwork-universe',
      'ally-universe',
      'training-universe',
      'basic-universe',
      'missions',
    ] as const;

    for (const folder of portraitFolders) {
      expect(THUMB_CONFIGS[folder]).toBe(PRESET_PORTRAIT);
    }

    expect(PRESET_PORTRAIT.fit).toBe('contain');
    expect(PRESET_PORTRAIT.width / PRESET_PORTRAIT.height).toBeCloseTo(5 / 7, 2);
  });

  it('uses contain for landscape location thumbs', () => {
    expect(THUMB_CONFIGS.locations).toBe(PRESET_LOCATION);
    expect(PRESET_LOCATION.fit).toBe('contain');
    expect(PRESET_LOCATION.width / PRESET_LOCATION.height).toBeCloseTo(236 / 151, 2);
  });
});
