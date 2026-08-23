import type { CatalogCard, CatalogType } from '../../frontend/src/lib/api/types';
import {
  compareDbvAllSetsCatalogCards,
  compareDbvCatalogCards,
} from '../../frontend/src/lib/catalog/catalogTypeMap';
import { compareAllCatalogCards, compareCollectionCatalogCards } from '../../frontend/src/lib/catalog/allCatalogSort';

function card(id: string, fields: Partial<CatalogCard>): CatalogCard {
  return { id, ...fields };
}

function sortedIds(cards: CatalogCard[], type: CatalogType): string[] {
  return [...cards].sort((a, b) => compareDbvAllSetsCatalogCards(a, b, type)).map((c) => c.id);
}

describe('Database type tabs with All Sets selected', () => {
  it.each(['characters', 'locations'] as const)(
    'sorts %s alphabetically by card name without grouping by set',
    (type) => {
    const cards = [
      card('z', { name: 'Zulu', set: 'ERB', set_number: '001' }),
      card('a', { name: 'Alpha', set: 'SKY', set_number: '472' }),
    ];
    expect(sortedIds(cards, type)).toEqual(['a', 'z']);
    },
  );

  it('sorts specials and advanced universe by linked character, then card name', () => {
    const specials = [
      card('z', { name: 'First', character: 'Zulu', set: 'ERB', set_number: '001' }),
      card('a2', { name: 'Second', character: 'Alpha', set: 'SKY', set_number: '400' }),
      card('a1', { name: 'First', character: 'Alpha', set: 'MOM', set_number: '200' }),
    ];
    expect(sortedIds(specials, 'special-cards')).toEqual(['a1', 'a2', 'z']);
    expect(sortedIds(specials, 'advanced-universe')).toEqual(['a1', 'a2', 'z']);
  });

  it('sorts aspects by linked location, then aspect name', () => {
    const aspects = [
      card('z', { card_name: 'Alpha Aspect', location: 'Zulu Base', set: 'ERB' }),
      card('a', { card_name: 'Zulu Aspect', location: 'Alpha Base', set: 'SKY' }),
    ];
    expect(sortedIds(aspects, 'aspects')).toEqual(['a', 'z']);
  });

  it.each(['missions', 'events'] as const)('sorts %s by mission set, then card name', (type) => {
    const cards = [
      card('z', { name: 'First', mission_set: 'Zulu Mission', set: 'ERB' }),
      card('a2', { name: 'Second', mission_set: 'Alpha Mission', set: 'SKY' }),
      card('a1', { name: 'First', mission_set: 'Alpha Mission', set: 'MOM' }),
    ];
    expect(sortedIds(cards, type)).toEqual(['a1', 'a2', 'z']);
  });

  it.each([
    ['power-cards', { power_type: 'Energy', value: 2 }, { power_type: 'Combat', value: 1 }],
    ['ally-universe', { stat_type_to_use: 'Energy', stat_to_use: '7 or higher' }, { stat_type_to_use: 'Combat', stat_to_use: '5 or less' }],
    ['basic-universe', { type: 'Energy', value_to_use: '7 or greater' }, { type: 'Combat', value_to_use: '6 or greater' }],
    ['training', { type_1: 'Energy', type_2: 'Intelligence', value_to_use: '7 or less' }, { type_1: 'Combat', type_2: 'Brute Force', value_to_use: '5 or less' }],
    ['teamwork', { to_use: '7 Energy' }, { to_use: '6 Combat' }],
  ] as const)('sorts %s by OverPower type order before ascending value', (type, energy, combat) => {
    const cards = [
      card('combat', { name: 'Combat', set: 'ERB', ...combat }),
      card('energy-high', { name: 'Energy High', set: 'SKY', ...energy }),
      card('energy-low', {
        name: 'Energy Low',
        set: 'MOM',
        ...energy,
        ...(type === 'power-cards' ? { value: 1 } : {}),
        ...(type === 'ally-universe' ? { stat_to_use: '5 or less' } : {}),
        ...(type === 'basic-universe' || type === 'training' ? { value_to_use: '5 or less' } : {}),
        ...(type === 'teamwork' ? { to_use: '6 Energy' } : {}),
      }),
    ];
    expect(sortedIds(cards, type)).toEqual(['energy-low', 'energy-high', 'combat']);
  });

  it('keeps selected-set sorting on collector number', () => {
    const high = card('high', { name: 'Alpha', set: 'SKY', set_number: '200' });
    const low = card('low', { name: 'Zulu', set: 'SKY', set_number: '001' });
    expect([high, low].sort((a, b) => compareDbvCatalogCards(a, b, 'characters')).map((c) => c.id))
      .toEqual(['low', 'high']);
  });

  it('sorts selected-set power cards by type then value instead of collector number', () => {
    const cards = [
      card('combat-low-number', {
        name: 'Combat 1',
        set: 'SKY',
        set_number: '001',
        power_type: 'Combat',
        value: 1,
      }),
      card('energy-high-value', {
        name: 'Energy 8',
        set: 'SKY',
        set_number: '003',
        power_type: 'Energy',
        value: 8,
      }),
      card('energy-low-value', {
        name: 'Energy 2',
        set: 'SKY',
        set_number: '999',
        power_type: 'Energy',
        value: 2,
      }),
    ];

    expect(cards.sort((a, b) => compareDbvCatalogCards(a, b, 'power-cards')).map((c) => c.id))
      .toEqual(['energy-low-value', 'energy-high-value', 'combat-low-number']);
  });

  it('leaves Database All and Collection checklist sorting set-first', () => {
    const erb = card('erb', { name: 'Zulu', set: 'ERB', set_number: '100' });
    const sky = card('sky', { name: 'Alpha', set: 'SKY', set_number: '001' });
    expect([sky, erb].sort(compareAllCatalogCards).map((c) => c.id)).toEqual(['erb', 'sky']);
    expect([sky, erb].sort(compareCollectionCatalogCards).map((c) => c.id)).toEqual(['erb', 'sky']);
  });
});
