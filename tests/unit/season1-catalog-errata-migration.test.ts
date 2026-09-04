import * as fs from 'fs';
import * as path from 'path';

describe('Season 1 catalog errata migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V344__Apply_Season_1_catalog_errata.sql'),
    'utf8',
  );

  it('adds the reserve-play text to Second Invasion', () => {
    expect(sql).toContain("set_number = '052'");
    expect(sql).toContain("name = 'Second Invasion'");
    expect(sql).toContain('May be played from Reserve.');
  });

  it('replaces the half-hourglass on I am Immortal with the full hourglass', () => {
    expect(sql).toContain("set_number = '073'");
    expect(sql).toContain("name = 'I am Immortal'");
    expect(sql).toContain('icon_remainder_of_battle = FALSE');
    expect(sql).toContain('icon_remainder_of_game = TRUE');
    expect(sql).toContain('icon_astral_plane = TRUE');
  });

  it('repairs the alternate Walkers inherent from the normal printing', () => {
    expect(sql).toContain("alternate.set_number = '450'");
    expect(sql).toContain("normal.set_number = '226'");
    expect(sql).toContain('alternate.special_abilities IS DISTINCT FROM normal.special_abilities');
    expect(sql).toContain('May not play Universe cards.');
  });

  it('corrects the For Guinevere\'s Love transcription', () => {
    expect(sql).toContain("set_number = '134'");
    expect(sql).toContain("name = 'For Guinevere''s Love'");
    expect(sql).toContain('This card may not be negated.');
    expect(sql).not.toContain('This card may be placed.');
  });

  it('fails when any corrected catalog target is missing or incorrect', () => {
    expect(sql).toContain('second_invasion_rows <> 1');
    expect(sql).toContain('immortal_rows <> 1');
    expect(sql).toContain('walkers_alt_rows <> 1');
    expect(sql).toContain('guinevere_rows <> 1');
    expect(sql).toContain('RAISE EXCEPTION');
  });
});
