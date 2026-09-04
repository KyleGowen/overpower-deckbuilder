import * as fs from 'fs';
import * as path from 'path';

describe('Season 1 errata migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V343__Create_and_seed_errata.sql'),
    'utf8',
  );

  it('creates normalized errata and card association tables', () => {
    expect(sql).toContain('CREATE TABLE errata');
    expect(sql).toContain('entry_text TEXT NOT NULL');
    expect(sql).toContain('source_url TEXT NOT NULL UNIQUE');
    expect(sql).toContain('CREATE TABLE card_errata');
    expect(sql).toContain('errata_id UUID NOT NULL REFERENCES errata(id) ON DELETE CASCADE');
    expect(sql).toContain('UNIQUE (errata_id, card_type, card_id)');
    expect(sql).toContain('update_errata_updated_at');
    expect(sql).toContain('update_card_errata_updated_at');
  });

  it('seeds all 23 official source sections and deep links', () => {
    const sourceUrls =
      sql.match(/'https:\/\/overpowercardgame\.com\/errata\/#s\d+'/g) ?? [];

    expect(sourceUrls).toHaveLength(23);
    expect(new Set(sourceUrls).size).toBe(23);
    for (let section = 1; section <= 23; section += 1) {
      expect(sql).toContain(`'https://overpowercardgame.com/errata/#s${section}'`);
    }
  });

  it('stores official display text for the formerly ambiguous rules sections', () => {
    expect(sql).toContain(
      'Absolute KO ensures that a defeated character goes to the Defeated Characters Pile',
    );
    expect(sql).toContain(
      'If the Player is playing with Barsoom/Mars as their Homebase, this would trigger the fetch of a Power card.',
    );
  });

  it('links Absolute KO to every named card and both Walkers printings', () => {
    expect(sql).toContain(
      "(1, 'SKY', '048', 'Allen The Alien', 'Near Death Experience')",
    );
    expect(sql).toContain("(1, 'SKY', '073', 'Immortal', 'I am Immortal')");
    expect(sql).toContain("(1, 'SKY', '059', 'Mauler Twins', 'My Brother')");
    expect(sql).toContain("(1, 'SKY', '226', 'Walkers: Herd')");
    expect(sql).toContain("(1, 'SKY', '450', 'Walkers: Herd')");
  });

  it('links the location ruling to both Barsoom and Mars', () => {
    expect(sql).toContain("(6, 'ERB', '468', 'Barsoom')");
    expect(sql).toContain("(6, 'SKY', '384', 'Mars')");
  });

  it('links inherent rulings to every current character printing', () => {
    expect(sql).toContain("(9, 'SKY', '170', 'Glenn')");
    expect(sql).toContain("(9, 'SKY', '442', 'Glenn')");
    expect(sql).toContain("(9, 'SKY', '442F', 'Glenn')");
    expect(sql).toContain("(18, 'SKY', '226', 'Walkers: Herd')");
    expect(sql).toContain("(18, 'SKY', '450', 'Walkers: Herd')");
  });

  it('fails migration when source or association counts drift', () => {
    expect(sql).toContain('Expected 23 errata entries');
    expect(sql).toContain('Expected 32 card errata associations');
    expect(sql).toContain(
      'One or more errata associations do not resolve to the declared card type',
    );
  });
});
