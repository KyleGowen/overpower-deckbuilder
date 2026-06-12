import { mapAdvancedUniverseRow, mapSpecialCardRow } from '../../src/database/card/mappers';

describe('mapSpecialCardRow', () => {
  it('maps function icon booleans with defaults', () => {
    const mapped = mapSpecialCardRow({
      id: 'special-1',
      name: 'Test Special',
      card_type: 'special',
      character_name: 'Test Character',
      card_effect: 'Test effect',
      image_path: 'specials/test_special.webp',
      set: 'ERB',
      set_number: '001',
      cataclysm: false,
      assist: false,
      ambush: false,
      one_per_deck: true,
      icon_offensive_swords: true,
      icon_remainder_of_battle: true,
    });

    expect(mapped.icon_offensive_swords).toBe(true);
    expect(mapped.icon_remainder_of_battle).toBe(true);
    expect(mapped.icon_defensive_shield).toBe(false);
    expect(mapped.icon_remainder_of_game).toBe(false);
    expect(mapped.icon_attached_paperclip).toBe(false);
    expect(mapped.icon_astral_plane).toBe(false);
    expect(mapped.icon_first_action_only).toBe(false);
  });
});

describe('mapAdvancedUniverseRow', () => {
  it('maps function icon booleans with defaults', () => {
    const mapped = mapAdvancedUniverseRow({
      id: 'advanced_universe_shards_of_the_staff',
      name: 'Shards of the Staff',
      card_type: 'advanced_universe',
      character: 'Ra',
      card_effect: 'Test effect',
      image_path: 'advanced-universe/shards_of_the_staff.webp',
      one_per_deck: true,
      icon_offensive_swords: true,
      icon_defensive_shield: true,
      icon_remainder_of_game: true,
    });

    expect(mapped.icon_offensive_swords).toBe(true);
    expect(mapped.icon_defensive_shield).toBe(true);
    expect(mapped.icon_remainder_of_game).toBe(true);
    expect(mapped.icon_remainder_of_battle).toBe(false);
    expect(mapped.icon_astral_plane).toBe(false);
  });
});
