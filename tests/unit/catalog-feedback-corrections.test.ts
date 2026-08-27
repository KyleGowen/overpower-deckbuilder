import * as fs from 'fs';
import * as path from 'path';

describe('G.D.A. and card catalog feedback migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V331__Correct_GDA_and_card_catalog_feedback.sql'),
    'utf8',
  );

  it('removes false One Per Deck flags caused by rules-text references', () => {
    expect(sql).toContain("set_number IN ('172', '214')");
    expect(sql).toContain('SET one_per_deck = FALSE');
    expect(sql).toContain('corrected_skybound_specials <> 2');
  });

  it('corrects All For One to match the printed card', () => {
    expect(sql).toContain('The Three Musketeers may place and play any Teamwork card');
    expect(sql).toContain('may make 1 or both follow-up attacks');
    expect(sql).toContain('corrected_all_for_one <> 1');
  });

  it('invalidates decks against the full Skybound G.D.A. Any Character range', () => {
    expect(sql.match(/BETWEEN 349 AND 374/g)).toHaveLength(2);
    expect(sql).toContain("b.name = 'Global Defense Agency'");
  });
});
