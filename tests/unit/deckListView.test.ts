import type { CatalogCard, DeckCardEntry } from '../../frontend/src/lib/api/types';
import {
  aggregateDeckListRows,
  attackIconsForDeckCard,
  balanceSectionsIntoColumns,
  buildDeckListSection,
  formatDeckListRowLabel,
  groupSpecialCardsByCharacter,
  sectionRowCount,
} from '../../frontend/src/lib/decks/deckListView';
import { buildDeckCardIndex } from '../../frontend/src/lib/decks/deckCardCatalog';

function entry(
  type: string,
  cardId: string,
  instanceId: string,
): DeckCardEntry {
  return { type: type as DeckCardEntry['type'], cardId, quantity: 1, instanceId };
}

describe('deckListView', () => {
  describe('aggregateDeckListRows', () => {
    it('merges instances sharing type and cardId', () => {
      const index = buildDeckCardIndex(
        ['teamwork'],
        [[{ id: 'tw-1', name: 'Team Card' } as CatalogCard]],
      );
      const rows = aggregateDeckListRows(
        [
          entry('teamwork', 'tw-1', 'a'),
          entry('teamwork', 'tw-1', 'b'),
          entry('teamwork', 'tw-1', 'c'),
        ],
        index,
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].quantity).toBe(3);
      expect(rows[0].instanceIds).toEqual(['a', 'b', 'c']);
    });
  });

  describe('groupSpecialCardsByCharacter', () => {
    it('places Any Character last then alphabetical', () => {
      const index = buildDeckCardIndex(
        ['special'],
        [
          [
            { id: 's1', name: 'Zap', character: 'Zatanna' } as CatalogCard,
            { id: 's2', name: 'Wild', character: 'Any Character' } as CatalogCard,
            { id: 's3', name: 'Bolt', character: 'Aquaman' } as CatalogCard,
          ],
        ],
      );
      const rows = aggregateDeckListRows(
        [
          entry('special', 's1', 'i1'),
          entry('special', 's2', 'i2'),
          entry('special', 's3', 'i3'),
        ],
        index,
      );
      const groups = groupSpecialCardsByCharacter(rows);
      expect(groups.map((g) => g.characterName)).toEqual([
        'Aquaman',
        'Zatanna',
        'Any Character',
      ]);
    });
  });

  describe('balanceSectionsIntoColumns', () => {
    it('balances row totals between columns', () => {
      const sections = [
        { key: 'a', rows: 12 },
        { key: 'b', rows: 8 },
        { key: 'c', rows: 7 },
        { key: 'd', rows: 3 },
      ];
      const [left, right] = balanceSectionsIntoColumns(sections, (s) => s.rows);
      const leftTotal = left.reduce((sum, s) => sum + s.rows, 0);
      const rightTotal = right.reduce((sum, s) => sum + s.rows, 0);
      expect(leftTotal).toBe(15);
      expect(rightTotal).toBe(15);
      expect(Math.abs(leftTotal - rightTotal)).toBeLessThanOrEqual(5);
    });
  });

  describe('formatDeckListRowLabel', () => {
    it('formats teamwork with follow-up attacks', () => {
      const catalog = {
        to_use: '6 Brute Force',
        followup_attack_types: 'Intelligence + Energy',
        first_attack: 0,
        second_attack: 1,
      } as unknown as CatalogCard;
      expect(formatDeckListRowLabel('teamwork', catalog)).toBe(
        '6 Brute Force → Intelligence + Energy (0/1)',
      );
    });

    it('formats ally-universe with attack suffix', () => {
      const catalog = {
        card_name: 'Little John',
        stat_to_use: 4,
        stat_type_to_use: 'Combat',
        attack_value: 5,
        attack_type: 'Energy',
      } as unknown as CatalogCard;
      expect(formatDeckListRowLabel('ally-universe', catalog)).toBe(
        'Little John - 4 Combat → 5 Energy',
      );
    });

    it('uses catalog name for power cards', () => {
      const catalog = { name: '5 - Energy', value: 5, power_type: 'Energy' } as unknown as CatalogCard;
      expect(formatDeckListRowLabel('power', catalog)).toBe('5 - Energy');
    });
  });

  describe('attackIconsForDeckCard', () => {
    it('returns single primary for power card', () => {
      expect(
        attackIconsForDeckCard('power', { power_type: 'Energy' } as unknown as CatalogCard),
      ).toEqual(['Energy']);
    });

    it('returns all primaries for multi-power', () => {
      expect(
        attackIconsForDeckCard('power', { power_type: 'Multi-Power' } as unknown as CatalogCard),
      ).toEqual(['Energy', 'Combat', 'Brute Force', 'Intelligence']);
    });

    it('returns Any-Power icon for Any-Power teamwork', () => {
      expect(
        attackIconsForDeckCard('teamwork', { to_use: 'Any-Power' } as unknown as CatalogCard),
      ).toEqual(['Any-Power']);
    });

    it('returns ordered icons from special card icons array', () => {
      expect(
        attackIconsForDeckCard('special', {
          icons: ['Intelligence', 'Energy', 'Combat'],
        } as unknown as CatalogCard),
      ).toEqual(['Energy', 'Combat', 'Intelligence']);
    });
  });

  describe('buildDeckListSection', () => {
    it('builds character groups for special cards', () => {
      const index = buildDeckCardIndex(
        ['special'],
        [[{ id: 's1', name: 'Test', character: 'Any Character' } as CatalogCard]],
      );
      const section = buildDeckListSection(
        'special-cards',
        'Special Cards',
        'special',
        [entry('special', 's1', 'i1')],
        index,
      );
      expect(section.characterGroups).toHaveLength(1);
      expect(section.rows).toHaveLength(0);
      expect(sectionRowCount(section)).toBe(1);
    });
  });
});
