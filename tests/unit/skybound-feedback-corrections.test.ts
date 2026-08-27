import * as fs from 'fs';
import * as path from 'path';

describe('Skybound launch feedback migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V321__Correct_skybound_catalog_feedback.sql'),
    'utf8',
  );
  const teamworkSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V332__Correct_skybound_energy_teamwork_cards.sql'),
    'utf8',
  );

  it('reassigns all six Walkers specials by collector number', () => {
    for (const number of ['228', '229', '230', '231', '232', '233']) {
      expect(sql).toContain(`'${number}'`);
    }
    expect(sql).toContain("character_name = 'Walkers: Herd'");
  });

  it('renames the seven missions and five events to the source mission-set title', () => {
    expect(sql).toContain("mission_set = 'The Walking Dead: All Out War'");
    expect(sql).toContain("set_number BETWEEN '407' AND '413'");
    expect(sql).toContain("set_number BETWEEN '414' AND '418'");
  });

  it('fails migration if the corrected row counts are incomplete', () => {
    expect(sql).toContain('walker_specials <> 6');
    expect(sql).toContain('walking_dead_missions <> 7');
    expect(sql).toContain('walking_dead_events <> 5');
    expect(sql).toContain('RAISE EXCEPTION');
  });

  it('corrects Skybound Energy Teamwork cards 317 and 318 from their printed faces', () => {
    expect(teamworkSql).toContain("set_number = '317'");
    expect(teamworkSql).toContain("followup_attack_types = 'Brute Force + Intelligence'");
    expect(teamworkSql).toContain("image_path = 'sky/teamwork/317_7_energy.png'");
    expect(teamworkSql).toContain("set_number = '318'");
    expect(teamworkSql).toContain("followup_attack_types = 'Combat + Brute Force'");
    expect(teamworkSql).toContain("image_path = 'sky/teamwork/318_8_energy.png'");
    expect(teamworkSql).toContain('corrected_teamwork <> 2');
    expect(teamworkSql).toContain('RAISE EXCEPTION');
  });
});
