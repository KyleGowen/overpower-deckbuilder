import type { CatalogCard } from '../../frontend/src/lib/api/types';
import {
  cardMatchesDbvFilters,
  collectMissionSetOptions,
  matchesFunctionIconFilters,
  matchesIconsPowerTypeFilters,
} from '../../frontend/src/features/database/filters/dbvFilterPredicates';
import { EMPTY_DBV_FILTER_STATE } from '../../frontend/src/features/database/filters/dbvFilterTypes';

const char = (overrides: Partial<CatalogCard> = {}): CatalogCard => ({
  id: '1',
  name: 'Test',
  energy: 5,
  combat: 4,
  brute_force: 3,
  intelligence: 2,
  threat_level: 16,
  ...overrides,
});

describe('matchesIconsPowerTypeFilters', () => {
  it('returns true when no types selected', () => {
    expect(matchesIconsPowerTypeFilters(['Combat'], [])).toBe(true);
  });

  it('matches specific power type', () => {
    expect(matchesIconsPowerTypeFilters(['Combat'], ['Combat'])).toBe(true);
    expect(matchesIconsPowerTypeFilters(['Energy'], ['Combat'])).toBe(false);
  });

  it('Multi-Power requires two or more icons', () => {
    expect(matchesIconsPowerTypeFilters(['Combat', 'Energy'], ['Multi-Power'])).toBe(true);
    expect(matchesIconsPowerTypeFilters(['Combat'], ['Multi-Power'])).toBe(false);
  });
});

describe('matchesFunctionIconFilters', () => {
  it('OR semantics across selected function icons', () => {
    const card = { id: '1', icon_offensive_swords: true, icon_defensive_shield: false };
    expect(matchesFunctionIconFilters(card, ['icon_offensive_swords'])).toBe(true);
    expect(matchesFunctionIconFilters(card, ['icon_defensive_shield'])).toBe(false);
    expect(
      matchesFunctionIconFilters(card, ['icon_defensive_shield', 'icon_offensive_swords']),
    ).toBe(true);
  });
});

describe('cardMatchesDbvFilters — characters', () => {
  it('filters by energy gte and threat eq (AND)', () => {
    const state = {
      ...EMPTY_DBV_FILTER_STATE,
      numeric: [
        { field: 'energy', op: 'gte' as const, value: 4 },
        { field: 'threat_level', op: 'eq' as const, value: 16 },
      ],
    };
    expect(cardMatchesDbvFilters(char({ energy: 5, threat_level: 16 }), 'characters', state)).toBe(true);
    expect(cardMatchesDbvFilters(char({ energy: 3, threat_level: 16 }), 'characters', state)).toBe(false);
    expect(cardMatchesDbvFilters(char({ energy: 5, threat_level: 17 }), 'characters', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — locations', () => {
  it('filters threat level', () => {
    const state = {
      ...EMPTY_DBV_FILTER_STATE,
      numeric: [{ field: 'threat_level', op: 'lte' as const, value: 2 }],
    };
    const loc = { id: '1', name: 'L', threat_level: 2 };
    expect(cardMatchesDbvFilters(loc, 'locations', state)).toBe(true);
    expect(cardMatchesDbvFilters({ ...loc, threat_level: 3 }, 'locations', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — power cards', () => {
  it('OR across power-type value constraints', () => {
    const state = {
      ...EMPTY_DBV_FILTER_STATE,
      numeric: [
        { field: 'Energy', op: 'eq' as const, value: 8 },
        { field: 'Combat', op: 'eq' as const, value: 5 },
      ],
    };
    expect(
      cardMatchesDbvFilters({ id: '1', power_type: 'Energy', value: 8 }, 'power-cards', state),
    ).toBe(true);
    expect(
      cardMatchesDbvFilters({ id: '2', power_type: 'Combat', value: 5 }, 'power-cards', state),
    ).toBe(true);
    expect(
      cardMatchesDbvFilters({ id: '3', power_type: 'Energy', value: 7 }, 'power-cards', state),
    ).toBe(false);
  });
});

describe('cardMatchesDbvFilters — specials', () => {
  it('ANDs power type and function icon filters', () => {
    const state = {
      ...EMPTY_DBV_FILTER_STATE,
      powerTypes: ['Energy'],
      functionIcons: ['icon_offensive_swords' as const],
    };
    const match = {
      id: '1',
      icons: ['Energy'],
      icon_offensive_swords: true,
    };
    const noIcon = { ...match, icon_offensive_swords: false };
    const wrongType = { ...match, icons: ['Combat'] };
    expect(cardMatchesDbvFilters(match, 'special-cards', state)).toBe(true);
    expect(cardMatchesDbvFilters(noIcon, 'special-cards', state)).toBe(false);
    expect(cardMatchesDbvFilters(wrongType, 'special-cards', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — advanced universe', () => {
  it('filters by function icon booleans', () => {
    const state = {
      ...EMPTY_DBV_FILTER_STATE,
      functionIcons: ['icon_defensive_shield' as const],
    };
    const match = { id: '1', icon_defensive_shield: true };
    const noMatch = { id: '2', icon_defensive_shield: false };
    expect(cardMatchesDbvFilters(match, 'advanced-universe', state)).toBe(true);
    expect(cardMatchesDbvFilters(noMatch, 'advanced-universe', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — teamwork', () => {
  it('matches to_use power type', () => {
    const state = { ...EMPTY_DBV_FILTER_STATE, powerTypes: ['Energy'] };
    expect(cardMatchesDbvFilters({ id: '1', to_use: '3 Energy' }, 'teamwork', state)).toBe(true);
    expect(cardMatchesDbvFilters({ id: '2', to_use: '3 Combat' }, 'teamwork', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — ally', () => {
  it('matches stat or attack type', () => {
    const state = { ...EMPTY_DBV_FILTER_STATE, powerTypes: ['Combat'] };
    expect(
      cardMatchesDbvFilters({ id: '1', stat_type_to_use: 'Energy', attack_type: 'Combat' }, 'ally-universe', state),
    ).toBe(true);
    expect(
      cardMatchesDbvFilters({ id: '2', stat_type_to_use: 'Energy', attack_type: 'Energy' }, 'ally-universe', state),
    ).toBe(false);
  });
});

describe('cardMatchesDbvFilters — training', () => {
  it('matches type_1 or type_2', () => {
    const state = { ...EMPTY_DBV_FILTER_STATE, powerTypes: ['Intelligence'] };
    expect(cardMatchesDbvFilters({ id: '1', type_1: 'Combat', type_2: 'Intelligence' }, 'training', state)).toBe(
      true,
    );
  });
});

describe('cardMatchesDbvFilters — basic universe', () => {
  it('matches card type field', () => {
    const state = { ...EMPTY_DBV_FILTER_STATE, powerTypes: ['Brute Force'] };
    expect(cardMatchesDbvFilters({ id: '1', type: 'Brute Force' }, 'basic-universe', state)).toBe(true);
    expect(cardMatchesDbvFilters({ id: '2', type: 'Energy' }, 'basic-universe', state)).toBe(false);
  });
});

describe('cardMatchesDbvFilters — missions/events', () => {
  it('filters by mission set', () => {
    const state = { ...EMPTY_DBV_FILTER_STATE, missionSet: 'ERB Missions' };
    expect(cardMatchesDbvFilters({ id: '1', mission_set: 'ERB Missions' }, 'missions', state)).toBe(true);
    expect(cardMatchesDbvFilters({ id: '2', mission_set: 'Other' }, 'missions', state)).toBe(false);
  });
});

describe('collectMissionSetOptions', () => {
  it('returns sorted unique mission sets', () => {
    const cards = [
      { id: '1', mission_set: 'B' },
      { id: '2', mission_set: 'A' },
      { id: '3', mission_set: 'B' },
      { id: '4', mission_set: '' },
    ];
    expect(collectMissionSetOptions(cards)).toEqual(['A', 'B']);
  });
});
