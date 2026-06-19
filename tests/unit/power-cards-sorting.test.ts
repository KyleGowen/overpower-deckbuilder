/**
 * @jest-environment jsdom
 */

import {
  compareDeckPowerCatalogCards,
  comparePowerCatalogCards,
} from '../../frontend/src/lib/catalog/catalogTypeMap';
import type { CatalogCard } from '../../frontend/src/lib/api/types';

function powerCard(value: number, power_type: string): CatalogCard {
  return { id: `${value}-${power_type}`, value, power_type } as CatalogCard;
}

describe('Power Cards Sorting', () => {
  describe('deck editor (value first, then type)', () => {
    function sortDeckPower(cards: CatalogCard[]): CatalogCard[] {
      return [...cards].sort(compareDeckPowerCatalogCards);
    }

    test('sorts by ascending value', () => {
      const input = [
        powerCard(6, 'Combat'),
        powerCard(3, 'Energy'),
        powerCard(5, 'Brute Force'),
      ];
      const out = sortDeckPower(input).map((c) => c.value);
      expect(out).toEqual([3, 5, 6]);
    });

    test('ties use OverPower type order', () => {
      const input = [
        powerCard(6, 'Intelligence'),
        powerCard(6, 'Brute Force'),
        powerCard(6, 'Combat'),
        powerCard(6, 'Energy'),
        powerCard(6, 'Multi Power'),
        powerCard(6, 'Any-Power'),
      ];
      const out = sortDeckPower(input).map((c) => c.power_type);
      expect(out).toEqual([
        'Energy',
        'Combat',
        'Brute Force',
        'Intelligence',
        'Multi Power',
        'Any-Power',
      ]);
    });

    test('unknown types come after known OP types when tied on value', () => {
      const input = [powerCard(4, 'Unknown-X'), powerCard(4, 'Combat')];
      const out = sortDeckPower(input).map((c) => c.power_type);
      expect(out).toEqual(['Combat', 'Unknown-X']);
    });
  });

  describe('add-cards / DBV (type first, then value)', () => {
    function sortCatalogPower(cards: CatalogCard[]): CatalogCard[] {
      return [...cards].sort(comparePowerCatalogCards);
    }

    test('sorts by OverPower type order first', () => {
      const input = [
        powerCard(3, 'Any-Power'),
        powerCard(8, 'Energy'),
        powerCard(5, 'Combat'),
      ];
      const out = sortCatalogPower(input).map((c) => c.power_type);
      expect(out).toEqual(['Energy', 'Combat', 'Any-Power']);
    });
  });
});
