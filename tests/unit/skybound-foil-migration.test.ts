import * as fs from 'fs';
import * as path from 'path';

describe('Skybound foil migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V313__Add_skybound_foil_character_mappings.sql'),
    'utf8',
  );
  const completionSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V337__Complete_skybound_character_foil_mappings.sql'),
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
    expect(completionSql).not.toMatch(/sky\/characters\/\d{3}f_/i);
  });

  it('completes the source-derived map for all 53 foil filenames', () => {
    const expected = [
      '227F',
      '419F', '420F', '421F', '422F', '423F', '424F', '425F', '426F', '427F',
      '428F', '429F', '430F', '431F', '432F', '433F', '434F', '435F', '436F',
      '437F', '438F', '439F', '440F', '441F', '442F', '443F', '444F', '445F',
      '446F', '447F', '449F', '451F', '452F', '453F', '454F', '455F', '456F',
      '457F', '458F', '459F', '460F', '461F', '462F', '463F', '464F', '465F',
      '466F', '467F', '468F', '469F', '470F', '471F', '472F',
    ];
    const declared = new Set(
      completionSql.match(/'\d{3}F'/g)?.map((value) => value.slice(1, -1)) ?? [],
    );

    expect([...declared].sort()).toEqual(expected.slice().sort());
    expect(completionSql).toContain("('430', '430F')");
    expect(completionSql).not.toContain("('448', '448F')");
    expect(completionSql).not.toContain("('450', '450F')");
    expect(completionSql).toContain('expected 53 foil rows');
    expect(completionSql).toContain('expected 53 mappings');
  });
});
