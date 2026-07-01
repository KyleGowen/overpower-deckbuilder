import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  collectPrintingsForCard,
  hasMultiplePrintings,
} from '../../frontend/src/lib/catalog/cardPrintings';
import { buildFoilCardMapLookup } from '../../frontend/src/lib/catalog/foilCatalog';

function card(id: string, extra: Partial<CatalogCard> = {}): CatalogCard {
  return { id, name: 'Card', ...extra } as CatalogCard;
}

const foilLookup = buildFoilCardMapLookup([
  { foilCardId: 'foil-1', baseCardId: 'base-1', cardType: 'character' },
]);

describe('cardPrintings', () => {
  describe('collectPrintingsForCard', () => {
    it('includes alternate art and foil rows for characters', () => {
      const base = card('base-1', {
        name: 'Dejah Thoris',
        set: 'ERB',
        set_number: '055',
        image_path: 'dejah.webp',
      });
      const alt = card('alt-1', {
        name: 'Dejah Thoris',
        set: 'ERB',
        set_number: '055',
        image_path: 'characters/alternate/dejah2.png',
      });
      const foil = card('foil-1', {
        name: 'Dejah Thoris',
        set: 'ERB',
        set_number: '055F',
        is_foil: true,
        image_path: 'dejah_foil.webp',
      });
      const catalog = [base, alt, foil];

      const printings = collectPrintingsForCard(base, 'characters', catalog, foilLookup);

      expect(printings.map((p) => p.id).sort()).toEqual(['alt-1', 'base-1', 'foil-1']);
    });

    it('returns single row when no alternates or foil exist', () => {
      const solo = card('solo', { name: 'Solo Hero', set: 'ERB' });
      const printings = collectPrintingsForCard(solo, 'characters', [solo], foilLookup);
      expect(printings).toHaveLength(1);
      expect(hasMultiplePrintings(solo, 'characters', [solo], foilLookup)).toBe(false);
    });

    it('groups power cards by type and value across sets', () => {
      const erb = card('erb-p', {
        name: 'Energy 6',
        set: 'ERB',
        power_type: 'Energy',
        value: 6,
        set_number: '100',
      });
      const mom = card('mom-p', {
        name: 'Energy 6 MOM',
        set: 'MOM',
        power_type: 'Energy',
        value: 6,
        set_number: '200',
      });
      const catalog = [erb, mom];

      const printings = collectPrintingsForCard(erb, 'power-cards', catalog, foilLookup);

      expect(printings).toHaveLength(2);
      expect(printings.map((p) => p.id).sort()).toEqual(['erb-p', 'mom-p']);
    });

    it('resolves foil anchor to base for grouping', () => {
      const base = card('base-1', {
        name: 'Dejah Thoris',
        set: 'ERB',
        set_number: '055',
      });
      const foil = card('foil-1', {
        name: 'Dejah Thoris',
        set: 'ERB',
        set_number: '055F',
        is_foil: true,
      });
      const catalog = [base, foil];

      const printings = collectPrintingsForCard(foil, 'characters', catalog, foilLookup);

      expect(printings.map((p) => p.id).sort()).toEqual(['base-1', 'foil-1']);
    });

    it('includes TFCP foil-only promo and second non-foil printing for 7 Combat', () => {
      const erbBase = card('erb-7c', {
        name: '7 - Combat',
        set: 'ERB',
        power_type: 'Combat',
        value: 7,
        image_path: 'power-cards/7_combat.webp',
      });
      const tfcpFoil = card('tfcp-7c-foil', {
        name: '7 - Combat',
        set: 'TFCP',
        power_type: 'Combat',
        value: 7,
        is_foil: true,
        image_path: 'tfacp/power/7_combat.png',
      });
      const tfcpAlt = card('tfcp-7c-2', {
        name: '7 - Combat',
        set: 'TFCP',
        power_type: 'Combat',
        value: 7,
        image_path: 'tfacp/power/7_combat_2.jpg',
      });
      const powerFoilLookup = buildFoilCardMapLookup([
        { foilCardId: 'tfcp-7c-foil', baseCardId: 'erb-7c', cardType: 'power' },
      ]);
      const catalog = [erbBase, tfcpFoil, tfcpAlt];

      const printings = collectPrintingsForCard(erbBase, 'power-cards', catalog, powerFoilLookup);

      expect(printings.map((p) => p.id).sort()).toEqual(['erb-7c', 'tfcp-7c-2', 'tfcp-7c-foil']);
    });

    it('groups ally universe cards by stat slot across sets', () => {
      const erb = card('erb-ally', {
        name: 'Allan Quatermain',
        set: 'ERB',
        stat_to_use: '5 or less',
        stat_type_to_use: 'Energy',
        attack_value: 3,
        attack_type: 'Energy',
        set_number: '324',
        image_path: 'ally-universe/5_energy.webp',
      });
      const tfcp = card('tfcp-ally', {
        name: 'White Demon Of Mazandaran',
        set: 'TFCP',
        stat_to_use: '5 or less',
        stat_type_to_use: 'Energy',
        attack_value: 3,
        attack_type: 'Energy',
        image_path: 'tfacp/ally/5_energy.png',
      });
      const catalog = [erb, tfcp];

      const printings = collectPrintingsForCard(erb, 'ally-universe', catalog, foilLookup);

      expect(printings).toHaveLength(2);
      expect(printings.map((p) => p.id).sort()).toEqual(['erb-ally', 'tfcp-ally']);
    });
  });
});
