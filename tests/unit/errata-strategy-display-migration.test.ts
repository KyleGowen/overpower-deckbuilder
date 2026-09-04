import * as fs from 'fs';
import * as path from 'path';

describe('errata strategy display migration', () => {
  const migration = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V346__Remove_Glenn_strategy_from_errata_display.sql'),
    'utf8',
  );
  const remainingStrategyMigration = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V347__Remove_remaining_strategy_from_errata_display.sql'),
    'utf8',
  );
  const canonicalSeed = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V343__Create_and_seed_errata.sql'),
    'utf8',
  );

  it('retains Glenn rules while excluding strategy from all three display rows', () => {
    expect(migration).toContain('The practical implication is that Glenn can use an 8');
    expect(migration).not.toContain('Strategically, look for Glenn');
    expect(migration).toContain("c.set_number IN ('170', '442', '442F')");
    expect(migration).toContain('Expected 3 strategy-free Glenn errata display rows');
  });

  it('preserves the complete official transcription', () => {
    expect(canonicalSeed).toContain(
      'Strategically, look for Glenn to be played with the GDA Battleground Any Character Special card “Shapesmith”',
    );
  });

  it('keeps the section 7 rule consequence but removes its strategy judgment', () => {
    expect(remainingStrategyMigration).toContain(
      'This does mean that occasionally the Player may have 4 Front Line characters!',
    );
    expect(remainingStrategyMigration).not.toContain(
      'Generally speaking, this is rarely a strategic advantage',
    );
    expect(canonicalSeed).toContain('Generally speaking, this is rarely a strategic advantage');
  });

  it('keeps the section 19 ruling but removes its power-level judgment', () => {
    expect(remainingStrategyMigration).toContain('Yes - It does prevent itself from being removed.');
    expect(remainingStrategyMigration).toContain(
      'a higher class card’s effect could override “Salamander\'s Toxikinesis” effect',
    );
    expect(remainingStrategyMigration).not.toContain('This is a powerful effect for this Max 6');
    expect(canonicalSeed).toContain('This is a powerful effect for this Max 6');
  });
});
