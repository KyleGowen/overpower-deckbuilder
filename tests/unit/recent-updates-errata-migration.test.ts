import * as fs from 'fs';
import * as path from 'path';

describe('card errata Recent Updates migration', () => {
  const seedMigration = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V348__Announce_card_errata_feature.sql'),
    'utf8',
  );
  const copyMigration = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V349__Refine_card_errata_feature_announcement.sql'),
    'utf8',
  );

  it('announces the card-scoped errata feature with the approved artwork', () => {
    expect(seedMigration).toContain("'Official errata, right on the card'");
    expect(seedMigration).toContain("'feature'");
    expect(seedMigration).toContain("'sky/specials/374_damien_darkblood.png'");
  });

  it('is idempotent and verifies the seeded row', () => {
    expect(seedMigration).toContain('ON CONFLICT (id) DO UPDATE SET');
    expect(seedMigration).toContain('Card errata feature recent update was not applied');
  });

  it('refines the display copy without season or implementation detail', () => {
    expect(copyMigration).toContain(
      'Cards with official errata now show the relevant ruling at the bottom of their detail panel, along with a direct link to LRG’s official source.',
    );
    expect(copyMigration).not.toContain('Season 1');
    expect(copyMigration).not.toContain('Multi-card entries');
    expect(copyMigration).not.toContain('LRG’s source');
    expect(copyMigration).toContain('Card errata feature announcement copy was not updated');
  });
});
