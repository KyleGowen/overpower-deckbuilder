import {
  MANUAL_TRUTH,
  buildManualTruthResult,
  generateSql,
  parseArgs,
  scanFile,
} from '../../src/scripts/scanSpecialFunctionIcons';

describe('scanSpecialFunctionIcons CLI helpers', () => {
  it('parses incremental files and output flags', () => {
    const parsed = parseArgs([
      '--files=300.webp,banishment.webp',
      '--out-sql=migrations/V999__test.sql',
      '--min-accept=0.6',
      '--uncertain-below=0.7',
    ]);

    expect(parsed.files).toEqual(['300.webp', 'banishment.webp']);
    // resolveOutPath uses path.join on Windows (backslashes); normalize for assertion
    expect(parsed.outSql.replace(/\\/g, '/').endsWith('migrations/V999__test.sql')).toBe(true);
    expect(parsed.minAccept).toBeCloseTo(0.6);
    expect(parsed.uncertainBelow).toBeCloseTo(0.7);
  });

  it('generates SQL updates for icon booleans', () => {
    const sql = generateSql([
      {
        filename: '300.webp',
        imagePath: 'specials/300.webp',
        detections: [],
        iconState: {
          icon_offensive_swords: true,
          icon_defensive_shield: true,
          icon_remainder_of_battle: false,
          icon_remainder_of_game: false,
          icon_attached_paperclip: false,
          icon_astral_plane: false,
          icon_first_action_only: false,
        },
        questionable: [],
      },
    ]);

    expect(sql).toContain("regexp_replace(image_path, '^.*/', '') = '300.webp'");
    expect(sql).toContain('icon_offensive_swords = TRUE');
    expect(sql).toContain('icon_defensive_shield = TRUE');
  });

  it('defines the 10 user-verified manual-truth cards', () => {
    expect(Object.keys(MANUAL_TRUTH).sort()).toEqual([
      '300.webp',
      'all_for_one.webp',
      'archimedes.webp',
      'athos.webp',
      'avenging_my_love.webp',
      'baptized_in_combat.webp',
      'burned_at_the_stake.webp',
      'call_of_cthulhu.webp',
      'champions_of_barsoom.webp',
      'chivalrous_protector.webp',
    ]);
  });

  it('buildManualTruthResult sets exact icon state and no questionable flags', () => {
    const result = buildManualTruthResult('call_of_cthulhu.webp', MANUAL_TRUTH['call_of_cthulhu.webp']);

    expect(result.iconState).toEqual({
      icon_offensive_swords: true,
      icon_defensive_shield: false,
      icon_remainder_of_battle: false,
      icon_remainder_of_game: true,
      icon_attached_paperclip: false,
      icon_astral_plane: true,
      icon_first_action_only: false,
    });
    expect(result.questionable).toEqual([]);
    expect(result.detections).toEqual([
      { label: 'icon_remainder_of_game', confidence: 1, assignedByHeuristic: false },
      { label: 'icon_offensive_swords', confidence: 1, assignedByHeuristic: false },
      { label: 'icon_astral_plane', confidence: 1, assignedByHeuristic: false },
    ]);
  });

  it('scanFile uses manual-truth override before heuristic/classifier path', () => {
    const result = scanFile(
      'chivalrous_protector.webp',
      [],
      {} as any,
      0.58,
      0.72
    );

    expect(result.iconState).toEqual({
      icon_offensive_swords: false,
      icon_defensive_shield: true,
      icon_remainder_of_battle: false,
      icon_remainder_of_game: false,
      icon_attached_paperclip: false,
      icon_astral_plane: false,
      icon_first_action_only: false,
    });
    expect(result.questionable).toEqual([]);
    expect(result.detections).toEqual([
      { label: 'icon_defensive_shield', confidence: 1, assignedByHeuristic: false },
    ]);
  });
});
