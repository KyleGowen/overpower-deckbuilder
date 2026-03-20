import { formatAlternateArtCaption } from '../../src/utils/formatAlternateArtCaption';

describe('formatAlternateArtCaption', () => {
  it('uses friendly set only when set_number and rarity missing', () => {
    expect(formatAlternateArtCaption('Ungodly Powers', '', null)).toBe('Ungodly Powers');
    expect(formatAlternateArtCaption('ERB', undefined, undefined)).toBe('ERB');
  });

  it('appends - set_number when present', () => {
    expect(formatAlternateArtCaption('ERB', '292', null)).toBe('ERB - 292');
    expect(formatAlternateArtCaption('Time Detectives', '035F', '')).toBe('Time Detectives - 035F');
  });

  it('appends (rarity) only when rarity non-empty', () => {
    expect(formatAlternateArtCaption('ERB', '292', 'Common')).toBe('ERB - 292 (Common)');
    expect(formatAlternateArtCaption('ERB', '', 'Rare')).toBe('ERB (Rare)');
  });

  it('defaults empty friendly set to ERB', () => {
    expect(formatAlternateArtCaption('', '001', 'Common')).toBe('ERB - 001 (Common)');
  });
});
