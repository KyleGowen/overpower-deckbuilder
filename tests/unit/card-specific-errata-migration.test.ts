import * as fs from 'fs';
import * as path from 'path';

describe('card-specific errata display migration', () => {
  const migration = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V345__Add_card_specific_errata_display_text.sql'),
    'utf8',
  );
  const canonicalSeed = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V343__Create_and_seed_errata.sql'),
    'utf8',
  );

  it('adds a validated optional display override without changing canonical source text', () => {
    expect(migration).toContain('ADD COLUMN display_text TEXT');
    expect(migration).toContain('card_errata_display_text_not_blank_chk');
    expect(migration).toContain('Expected 8 card-specific errata display rows');
    expect(canonicalSeed).toContain('Allen the Alien - When Allen the Alien is KO’d');
    expect(canonicalSeed).toContain('Immortal - When Immortal is KO’d');
    expect(canonicalSeed).toContain('Mauler Twins - Their Special card “My Brother”');
    expect(canonicalSeed).toContain('Walkers: Herd - Their Inherent Ability');
  });

  it('scopes Absolute KO to the shared paragraph and each linked card case', () => {
    expect(migration.match(/normal KO process is followed/g)).toHaveLength(5);
    expect(migration.match(/Allen the Alien - When Allen the Alien is KO’d/g)).toHaveLength(1);
    expect(migration.match(/Immortal - When Immortal is KO’d/g)).toHaveLength(1);
    expect(migration.match(/Mauler Twins - Their Special card “My Brother”/g)).toHaveLength(1);
    expect(migration.match(/Walkers: Herd - Their Inherent Ability/g)).toHaveLength(2);
  });

  it('removes sibling cases from Friendly Manipulation and the Lancelot specials', () => {
    expect(migration).toContain('Allen the Alien’s “Friendly Manipulation”');
    expect(migration).not.toContain('The Flaxans “City Leveling Invasion”');
    expect(migration.match(/“For Guinevere’s Love” may now be played/g)).toHaveLength(1);
    expect(migration.match(/“Knight of the Round Table” must remove a hit/g)).toHaveLength(1);
  });
});
