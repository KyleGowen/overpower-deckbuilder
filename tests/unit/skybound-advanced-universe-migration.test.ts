import * as fs from 'fs';
import * as path from 'path';

describe('Skybound advanced-universe correction migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V314__Reclassify_skybound_advanced_universe_cards.sql'),
    'utf8',
  );
  const firstActionSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V315__Add_advanced_universe_first_action_icon.sql'),
    'utf8',
  );

  it('moves exactly the four confirmed collector numbers', () => {
    const expected = ['112', '126', '131', '242'];
    const declared = new Set(
      sql.match(/'\d{3}'/g)?.map((value) => value.slice(1, -1)) ?? [],
    );
    expect([...declared].sort()).toEqual(expected);
  });

  it('preserves ids and shared metadata while changing tables', () => {
    expect(sql).toContain('INSERT INTO advanced_universe_cards');
    expect(sql).toContain('SELECT\n  id,');
    expect(sql).toContain('card_effect');
    expect(sql).toContain('character_name');
    expect(sql).toContain('icon_offensive_swords');
    expect(sql).toContain('icon_defensive_shield');
    expect(sql).toContain('DELETE FROM special_cards');
  });

  it('remaps existing deck and collection card types', () => {
    expect(sql).toContain("SET card_type = 'advanced-universe'");
    expect(sql).toContain("SET card_type = 'advanced_universe'");
    expect(sql).toContain("WHERE card_type = 'special'");
  });

  it('fails migration if all four rows were not moved', () => {
    expect(sql).toContain('IF moved_count <> 4 OR remaining_special_count <> 0');
    expect(sql).toContain('RAISE EXCEPTION');
  });

  it('preserves the first-action-only icon on Skybound #112', () => {
    expect(firstActionSql).toContain('ADD COLUMN IF NOT EXISTS icon_first_action_only');
    expect(firstActionSql).toContain("set_number = '112'");
    expect(firstActionSql).toContain('icon_first_action_only = TRUE');
    expect(firstActionSql).toContain('RAISE EXCEPTION');
  });
});
