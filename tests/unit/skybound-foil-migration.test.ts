import * as fs from 'fs';
import * as path from 'path';

describe('Skybound foil migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V313__Add_skybound_foil_character_mappings.sql'),
    'utf8',
  );

  it('declares exactly the 19 F-suffixed workbook collectors', () => {
    const expected = [
      '227F', '419F', '423F', '424F', '425F', '427F', '432F', '436F', '437F',
      '438F', '442F', '446F', '452F', '456F', '461F', '465F', '466F', '467F', '471F',
    ];
    const declared = new Set(sql.match(/'\d{3}F'/g)?.map((value) => value.slice(1, -1)) ?? []);
    expect([...declared].sort()).toEqual(expected.slice().sort());
  });

  it('copies base image paths and populates the standard character foil map', () => {
    expect(sql).toContain('base.image_path');
    expect(sql).toContain("INSERT INTO foil_card_map (foil_card_id, base_card_id, card_type)");
    expect(sql).toContain("'character'");
    expect(sql).toContain('mismatched_images <> 0');
  });

  it('does not reference any F-suffixed Skybound image asset', () => {
    expect(sql).not.toMatch(/sky\/characters\/\d{3}f_/i);
  });
});
