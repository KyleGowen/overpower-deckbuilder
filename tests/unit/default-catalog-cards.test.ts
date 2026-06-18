import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  dedupeToDefaultCatalogCards,
  isAlternateArtCard,
  prepareAddCardsCatalogList,
  qtyInDeckForRepresentative,
} from '../../frontend/src/lib/catalog/defaultCatalogCards';

function card(id: string, extra: Partial<CatalogCard> = {}): CatalogCard {
  return { id, name: 'Card', ...extra } as CatalogCard;
}

describe('defaultCatalogCards', () => {
  describe('isAlternateArtCard', () => {
    it('detects alternate paths with or without type prefix', () => {
      expect(isAlternateArtCard(card('1', { image_path: 'characters/alternate/foo.png' }))).toBe(true);
      expect(isAlternateArtCard(card('2', { image_path: 'alternate/221_b_baker_st.png' }))).toBe(true);
      expect(isAlternateArtCard(card('3', { image_path: 'dracula.webp' }))).toBe(false);
    });
  });

  describe('prepareAddCardsCatalogList', () => {
    const foilToBase = new Map([
      ['foil-1', 'base-1'],
    ]);

    it('hides foil when base exists and keeps foil-only promos', () => {
      const base = card('base-1', { name: 'Promo Base', is_foil: false });
      const foil = card('foil-1', { name: 'Promo Base', is_foil: true });
      const foilOnly = card('foil-only', { name: 'Foil Only', is_foil: true });

      const result = prepareAddCardsCatalogList([base, foil, foilOnly], 'characters', foilToBase);

      expect(result.cards.map((c) => c.id).sort()).toEqual(['base-1', 'foil-only']);
    });
  });

  describe('dedupeToDefaultCatalogCards', () => {
    it('keeps default character art over alternate in the same set', () => {
      const base = card('base', {
        name: 'Dracula',
        set: 'ERB',
        image_path: 'dracula.webp',
      });
      const alt = card('alt', {
        name: 'Dracula',
        set: 'ERB',
        image_path: 'characters/alternate/dracula2.png',
      });

      const { cards, variantIdsByRepresentative } = dedupeToDefaultCatalogCards(
        [alt, base],
        'characters',
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('base');
      expect(variantIdsByRepresentative.get('base')?.sort()).toEqual(['alt', 'base']);
    });

    it('merges ERBP alternate with ERB base for characters', () => {
      const erb = card('erb', {
        name: 'Asclepieion',
        set: 'ERB',
        image_path: 'asclepieion.webp',
      });
      const erbp = card('erbp', {
        name: 'Asclepieion',
        set: 'ERBP',
        image_path: 'characters/alternate/asclepieion.png',
      });

      const { cards } = dedupeToDefaultCatalogCards([erbp, erb], 'characters');

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('erb');
    });

    it('keeps default location art before bare alternate paths', () => {
      const alt = card('alt', {
        name: '221-B Baker St.',
        set: 'ERB',
        image_path: 'alternate/221_b_baker_st.png',
      });
      const base = card('base', {
        name: '221-B Baker St.',
        set: 'ERB',
        image_path: '221_b_baker_st.webp',
      });

      const { cards } = dedupeToDefaultCatalogCards([alt, base], 'locations');

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('base');
    });

    it('groups power cards by type and value across sets, preferring ERB default art', () => {
      const erbAlt = card('erb-alt', {
        name: '7 Any-Power',
        set: 'ERB',
        power_type: 'Any-Power',
        value: 7,
        image_path: 'power-cards/alternate/7_anypower.png',
      });
      const otherSet = card('other', {
        name: '7 Any-Power',
        set: 'Other',
        power_type: 'Any-Power',
        value: 7,
        image_path: '7_anypower.webp',
      });
      const erbBase = card('erb-base', {
        name: '7 Any-Power',
        set: 'ERB',
        power_type: 'Any-Power',
        value: 7,
        image_path: '7_anypower.webp',
      });

      const { cards } = dedupeToDefaultCatalogCards(
        [otherSet, erbAlt, erbBase],
        'power-cards',
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('erb-base');
    });

    it('groups special cards by character and name', () => {
      const base = card('base', {
        name: 'Ancient One',
        character: 'Cthulhu',
        image_path: 'ancient_one.webp',
      });
      const alt = card('alt', {
        name: 'Ancient One',
        character: 'Cthulhu',
        image_path: 'specials/alternate/ancient_one.png',
      });

      const { cards, variantIdsByRepresentative } = dedupeToDefaultCatalogCards(
        [alt, base],
        'special-cards',
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('base');
      expect(variantIdsByRepresentative.get('base')?.sort()).toEqual(['alt', 'base']);
    });

    it('keeps distinct teamwork cards with same to_use but different followup types', () => {
      const a = card('tw-1', {
        name: '6 Brute Force',
        set: 'ERB',
        to_use: '6 Brute Force',
        followup_attack_types: 'Intelligence + Combat',
        image_path: 'teamwork-universe/6_brute_force_0c_1i.webp',
      });
      const b = card('tw-2', {
        name: '6 Brute Force',
        set: 'ERB',
        to_use: '6 Brute Force',
        followup_attack_types: 'Intelligence + Energy',
        image_path: 'teamwork-universe/6_brute_force_0e_1i.webp',
      });
      const c = card('tw-3', {
        name: '6 Brute Force',
        set: 'ERB',
        to_use: '6 Brute Force',
        followup_attack_types: 'Energy + Combat',
        image_path: 'teamwork-universe/6_brute_force_0e_1c.webp',
      });

      const { cards } = dedupeToDefaultCatalogCards([a, b, c], 'teamwork');

      expect(cards).toHaveLength(3);
      expect(cards.map((row) => row.id).sort()).toEqual(['tw-1', 'tw-2', 'tw-3']);
    });

    it('groups teamwork alternate art with same to_use and followup types', () => {
      const base = card('tw-base', {
        name: '6 Combat',
        set: 'ERB',
        to_use: '6 Combat',
        followup_attack_types: 'Brute Force + Energy',
        image_path: 'teamwork-universe/6_combat_0e_1bf.webp',
      });
      const alt = card('tw-alt', {
        name: '6 Combat',
        set: 'ERB',
        to_use: '6 Combat',
        followup_attack_types: 'Brute Force + Energy',
        image_path: 'teamwork-universe/alternate/6_combat_0e_1bf.png',
      });

      const { cards, variantIdsByRepresentative } = dedupeToDefaultCatalogCards(
        [alt, base],
        'teamwork',
      );

      expect(cards).toHaveLength(1);
      expect(cards[0].id).toBe('tw-base');
      expect(variantIdsByRepresentative.get('tw-base')?.sort()).toEqual(['tw-alt', 'tw-base']);
    });
  });

  describe('qtyInDeckForRepresentative', () => {
    it('sums quantities across variant ids in the representative group', () => {
      const representative = card('base', { name: 'Dracula' });
      const variantMap = new Map([['base', ['base', 'alt']]]);

      const qty = qtyInDeckForRepresentative(
        representative,
        'characters',
        [
          { type: 'character', cardId: 'alt', quantity: 1 },
          { type: 'power', cardId: 'alt', quantity: 5 },
        ],
        'character',
        variantMap,
      );

      expect(qty).toBe(1);
    });
  });
});
