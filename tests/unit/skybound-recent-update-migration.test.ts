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

  it('adds the requested update announcement', () => {
    expect(sql).toContain("'Skybound is here!'");
    expect(sql).toContain("'update'");
    expect(sql).toContain('The Skybound set has arrived in Excelsior.');
  });

  it('replaces the original Damien Darkblood thumbnail with Invincible', () => {
    expect(sql).toContain("'sky/specials/374_damien_darkblood.png'");
    expect(thumbnailSql).toContain("'sky/specials/003_i_am_invincible.png'");
    expect(fs.existsSync(
      path.join(process.cwd(), 'src/resources/cards/images/sky/specials/003_i_am_invincible.png'),
    )).toBe(true);
    expect(fs.existsSync(
      path.join(process.cwd(), 'src/resources/cards/images/sky/thumb/specials/003_i_am_invincible.webp'),
    )).toBe(true);
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
});
