import * as fs from 'fs';
import * as path from 'path';

type SkyboundCard = {
  collector_number: string;
  table: string;
  image_path: string;
  reverse_image_path?: string;
  is_foil: boolean;
  name?: string;
  character_name?: string;
  mission_set?: string;
  one_per_deck?: boolean;
};

type SkyboundManifest = {
  counts: {
    base_cards: number;
    public_foil_cards: number;
    database_rows: number;
    public_source_assets: number;
    by_table_base: Record<string, number>;
  };
  cards: SkyboundCard[];
  assets: { source_file: string; target_path: string }[];
};

describe('Skybound import manifest', () => {
  const repoRoot = process.cwd();
  const localImageRoot = path.join(repoRoot, 'src/resources/cards/images/sky');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'scripts/skybound/skybound-manifest.json'), 'utf8'),
  ) as SkyboundManifest;

  it('has complete base coverage and all workbook-declared foil rows', () => {
    expect(manifest.counts).toMatchObject({
      base_cards: 472,
      public_foil_cards: 19,
      database_rows: 491,
      public_source_assets: 419,
    });
    expect(manifest.cards).toHaveLength(491);
    expect(manifest.assets).toHaveLength(419);
    const foilNumbers = [
      '227F', '419F', '423F', '424F', '425F', '427F', '432F', '436F', '437F',
      '438F', '442F', '446F', '452F', '456F', '461F', '465F', '466F', '467F', '471F',
    ];
    expect(new Set(manifest.cards.map((card) => card.collector_number))).toEqual(
      new Set([...Array.from({ length: 472 }, (_, i) => String(i + 1).padStart(3, '0')), ...foilNumbers]),
    );
  });

  it('normalizes the high-risk classifications and two-faced character', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    expect(byNumber.get('133')?.table).toBe('advanced_universe_cards');
    expect(byNumber.get('348')?.table).toBe('locations');
    expect(byNumber.get('226')).toMatchObject({
      table: 'characters',
      reverse_image_path: 'sky/characters/226_walkers.png',
    });
    expect(byNumber.get('227F')).toMatchObject({
      table: 'characters',
      is_foil: true,
      image_path: byNumber.get('227')?.image_path,
    });
  });

  it('does not infer One Per Deck from rules text that only references another card', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    expect(byNumber.get('057')).toMatchObject({ name: 'Portal To Dimensional Home' });
    expect(byNumber.get('057')?.one_per_deck).toBe(true);
    expect(byNumber.get('172')?.one_per_deck).toBe(false);
    expect(byNumber.get('214')?.one_per_deck).toBe(false);
  });

  it('keeps Walking Dead ownership and mission-set identity source-correct', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    for (const number of ['228', '229', '230', '231', '232', '233']) {
      expect(byNumber.get(number)?.character_name).toBe('Walkers: Herd');
    }
    for (const number of ['407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418']) {
      expect(byNumber.get(number)?.mission_set).toBe('The Walking Dead: All Out War');
    }
    expect(byNumber.get('082')).toMatchObject({
      name: 'Bite',
      character_name: 'Battle Beast',
      image_path: 'sky/specials/082_bite.png',
    });
  });

  it('documents the advanced-universe classifications corrected after the source import', () => {
    const correctionSql = fs.readFileSync(
      path.join(repoRoot, 'migrations/V314__Reclassify_skybound_advanced_universe_cards.sql'),
      'utf8',
    );
    for (const collectorNumber of ['112', '126', '131', '242']) {
      expect(correctionSql).toContain(`'${collectorNumber}'`);
    }
  });

  it('publishes only the card back for 419-472 and never lists their source art', () => {
    const hidden = manifest.cards.filter((card) => {
      const number = Number.parseInt(card.collector_number, 10);
      return number >= 419 && number <= 472;
    });
    expect(hidden.filter((card) => !card.is_foil)).toHaveLength(54);
    expect(new Set(hidden.map((card) => card.image_path))).toEqual(
      new Set(['sky/card-back/overpowerback.png']),
    );
    expect(manifest.assets.some((asset) => /^(?:419|4[2-6]\d|47[0-2])F?_/.test(asset.source_file))).toBe(false);
  });

  it('reuses non-foil art for every foil row and publishes no foil printing files', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    const foils = manifest.cards.filter((card) => card.is_foil);
    expect(foils).toHaveLength(19);
    for (const foil of foils) {
      const base = byNumber.get(foil.collector_number.replace(/F$/, ''));
      expect(base).toBeDefined();
      expect(foil.image_path).toBe(base?.image_path);
    }
    expect(manifest.assets.some((asset) => /^\d{3}F_/i.test(asset.source_file))).toBe(false);
  });

  const verifiesLocalImageTree = fs.existsSync(localImageRoot) ? it : it.skip;

  verifiesLocalImageTree('has every permitted source and thumbnail target in the local image tree', () => {
    for (const asset of manifest.assets) {
      expect(fs.existsSync(path.join(repoRoot, 'src/resources/cards/images', asset.target_path))).toBe(true);
      const parts = asset.target_path.split('/');
      const thumbPath = path.join(
        repoRoot,
        'src/resources/cards/images',
        parts[0],
        'thumb',
        ...parts.slice(1),
      ).replace(/\.[^.]+$/, '.webp');
      expect(fs.existsSync(thumbPath)).toBe(true);
    }
    expect(
      fs.existsSync(path.join(repoRoot, 'src/resources/cards/images/sky/card-back/overpowerback.png')),
    ).toBe(true);
  });
});
