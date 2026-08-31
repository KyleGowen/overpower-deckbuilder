import * as fs from 'fs';
import * as path from 'path';

describe('Skybound recent update migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V316__Add_skybound_recent_update.sql'),
    'utf8',
  );
  const revisionSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V317__Revise_skybound_recent_update_copy.sql'),
    'utf8',
  );
  const polishSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V318__Polish_skybound_recent_update_copy.sql'),
    'utf8',
  );
  const finalSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V319__Finalize_skybound_recent_update_copy.sql'),
    'utf8',
  );
  const thumbnailSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V320__Use_invincible_for_skybound_recent_update.sql'),
    'utf8',
  );
  const revealSql = fs.readFileSync(
    path.join(process.cwd(), 'migrations/V335__Announce_skybound_alternate_art_reveal.sql'),
    'utf8',
  );
  const revealOrderSql = fs.readFileSync(
    path.join(
      process.cwd(),
      'migrations/V336__Prioritize_skybound_alternate_art_reveal_update.sql',
    ),
    'utf8',
  );
  const revealThumbnailSql = fs.readFileSync(
    path.join(
      process.cwd(),
      'migrations/V338__Use_atom_eve_for_skybound_alt_art_update.sql',
    ),
    'utf8',
  );
  const revealOmniManThumbnailSql = fs.readFileSync(
    path.join(
      process.cwd(),
      'migrations/V339__Use_omni_man_for_skybound_alt_art_update.sql',
    ),
    'utf8',
  );
  const manifestJson = fs.readFileSync(
    path.join(process.cwd(), 'scripts/skybound/skybound-manifest.json'),
    'utf8',
  );

  it('adds the requested update announcement', () => {
    expect(sql).toContain("'Skybound is here!'");
    expect(sql).toContain("'update'");
    expect(sql).toContain('The Skybound set has arrived in Excelsior.');
  });

  it('replaces the original Damien Darkblood thumbnail with Invincible', () => {
    expect(sql).toContain("'sky/specials/374_damien_darkblood.png'");
    expect(thumbnailSql).toContain("'sky/specials/003_i_am_invincible.png'");
    expect(manifestJson).toContain('"target_path": "sky/specials/003_i_am_invincible.png"');
    expect(thumbnailSql).toContain('RAISE EXCEPTION');
  });

  it('is safely repeatable for the fixed update id', () => {
    expect(sql).toContain('ON CONFLICT (id) DO NOTHING');
  });

  it('revises the copy to preview a future alternate-art reveal', () => {
    expect(revisionSql).toContain('Alternate-art cards will be revealed in a future update.');
    expect(revisionSql).not.toContain('explore its new characters and strategies');
    expect(revisionSql).toContain('RAISE EXCEPTION');
  });

  it('adds the requested exclamation after the launch statement', () => {
    expect(polishSql).toContain('The Skybound set has arrived in Excelsior!');
    expect(polishSql).toContain('Alternate-art cards will be revealed in a future update.');
    expect(polishSql).toContain('RAISE EXCEPTION');
  });

  it('uses the final alternate-art reveal message', () => {
    expect(finalSql).toContain('Stay tuned for alternate-art card reveals in future updates.');
    expect(finalSql).toContain('RAISE EXCEPTION');
  });

  it('adds a distinct announcement when the alternate art is revealed', () => {
    expect(revealSql).toContain("'Skybound alternate art revealed!'");
    expect(revealSql).toContain("'new_cards'");
    expect(revealSql).toContain('turn off "Hide Alts"');
    expect(revealSql).toContain("'sky/characters/419_invincible.png'");
    expect(revealSql).toContain('ON CONFLICT (id) DO UPDATE');
    expect(revealSql).toContain('RAISE EXCEPTION');
  });

  it('retires the obsolete future-reveal teaser from the launch tile', () => {
    expect(revealSql).toContain(
      'The Skybound set has arrived in Excelsior! Browse the full release in the card database.',
    );
    expect(revealSql).toContain("description LIKE '%future update%'");
  });

  it('keeps the reveal ahead of the historical launch tile', () => {
    expect(revealOrderSql).toContain("'a1000001-0000-4000-8000-000000000009'");
    expect(revealOrderSql).toContain('reveal.updated_at >= launch.updated_at');
    expect(revealOrderSql).toContain('RAISE EXCEPTION');
  });

  it('retains the first thumbnail follow-up in migration history', () => {
    expect(revealThumbnailSql).toContain("'sky/characters/469_atom_eve.png'");
    expect(revealThumbnailSql).toContain("'a1000001-0000-4000-8000-000000000009'");
    expect(revealThumbnailSql).toContain('RAISE EXCEPTION');
  });

  it('uses Omni-Man for the final reveal thumbnail', () => {
    expect(revealOmniManThumbnailSql).toContain("'sky/characters/420_omni_man.png'");
    expect(revealOmniManThumbnailSql).toContain(
      "'a1000001-0000-4000-8000-000000000009'",
    );
    expect(revealOmniManThumbnailSql).toContain('RAISE EXCEPTION');
  });
});
