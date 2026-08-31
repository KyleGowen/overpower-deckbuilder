import * as fs from 'fs';
import * as path from 'path';

type SkyboundCard = {
  collector_number: string;
  table: string;
  image_path: string;
  reverse_image_path?: string;
  set_number_foil?: string;
  base_collector_number?: string;
  is_foil: boolean;
  name?: string;
  character_name?: string;
  mission_set?: string;
  one_per_deck?: boolean;
  to_use?: string;
  acts_as?: string;
  followup_attack_types?: string;
  first_attack_bonus?: string;
  second_attack_bonus?: string;
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
  const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));

  it('has complete base coverage and all workbook-declared foil rows', () => {
    expect(manifest.counts).toMatchObject({
      base_cards: 472,
      public_foil_cards: 53,
      database_rows: 525,
      public_source_assets: 474,
    });
    expect(manifest.cards).toHaveLength(525);
    expect(manifest.assets).toHaveLength(474);
    const foilNumbers = [
      '227F',
      '419F', '420F', '421F', '422F', '423F', '424F', '425F', '426F', '427F',
      '428F', '429F', '430F', '431F', '432F', '433F', '434F', '435F', '436F',
      '437F', '438F', '439F', '440F', '441F', '442F', '443F', '444F', '445F',
      '446F', '447F', '449F', '451F', '452F', '453F', '454F', '455F', '456F',
      '457F', '458F', '459F', '460F', '461F', '462F', '463F', '464F', '465F',
      '466F', '467F', '468F', '469F', '470F', '471F', '472F',
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
    expect(byNumber.get('450')).toMatchObject({
      table: 'characters',
      image_path: 'sky/characters/450_walkers_herd.png',
      reverse_image_path: 'sky/characters/450_walkers.png',
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

  it('keeps the corrected Energy Teamwork cards aligned with their printed faces', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    expect(byNumber.get('317')).toMatchObject({
      name: '7 Energy',
      to_use: '7 Energy',
      acts_as: '4 Attack',
      followup_attack_types: 'Brute Force + Intelligence',
      first_attack_bonus: '1',
      second_attack_bonus: '1',
      image_path: 'sky/teamwork/317_7_energy.png',
    });
    expect(byNumber.get('318')).toMatchObject({
      name: '8 Energy',
      to_use: '8 Energy',
      acts_as: '4 Attack',
      followup_attack_types: 'Combat + Brute Force',
      first_attack_bonus: '1',
      second_attack_bonus: '2',
      image_path: 'sky/teamwork/318_8_energy.png',
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

  it('publishes every non-foil alternate-art source for 419-472', () => {
    const alternateArt = manifest.cards.filter((card) => {
      const number = Number.parseInt(card.collector_number, 10);
      return number >= 419 && number <= 472;
    });
    expect(alternateArt.filter((card) => !card.is_foil)).toHaveLength(54);
    expect(alternateArt.every((card) => card.image_path.startsWith('sky/characters/'))).toBe(true);
    expect(manifest.assets.filter((asset) => /^(?:419|4[2-6]\d|47[0-2])(?:_|_FRONT_|_BACK_)/.test(asset.source_file))).toHaveLength(55);
    expect(manifest.assets.some((asset) => /^\d{3}F_/i.test(asset.source_file))).toBe(false);
  });

  it('maps every released alternate-art printing through Flyway V334', () => {
    const revealSql = fs.readFileSync(
      path.join(repoRoot, 'migrations/V334__Reveal_skybound_alternate_art.sql'),
      'utf8',
    );
    const alternateArt = manifest.cards.filter((card) => {
      const number = Number.parseInt(card.collector_number, 10);
      return !card.is_foil && number >= 419 && number <= 472;
    });

    for (const card of alternateArt) {
      expect(revealSql).toContain(`('${card.collector_number}', '${card.image_path}',`);
    }
    expect(revealSql).toContain("'sky/characters/450_walkers.png'");
    expect(revealSql).toContain('Foil rows keep the existing application sheen');
  });

  it('reuses non-foil art for every foil row and publishes no foil printing files', () => {
    const byNumber = new Map(manifest.cards.map((card) => [card.collector_number, card]));
    const foils = manifest.cards.filter((card) => card.is_foil);
    expect(foils).toHaveLength(53);
    for (const foil of foils) {
      const base = byNumber.get(foil.collector_number.replace(/F$/, ''));
      expect(base).toBeDefined();
      expect(foil.image_path).toBe(base?.image_path);
    }
    expect(manifest.assets.some((asset) => /^\d{3}F_/i.test(asset.source_file))).toBe(false);
  });

  it('recognizes filename-only foil markers from the original workbook', () => {
    expect(byNumber.get('430')).toMatchObject({ set_number_foil: '430F' });
    expect(byNumber.get('430F')).toMatchObject({
      name: 'Angstrom Levy',
      base_collector_number: '430',
      is_foil: true,
      image_path: 'sky/characters/430_angstrom_levy.png',
    });
    expect(byNumber.has('448F')).toBe(false);
    expect(byNumber.has('450F')).toBe(false);
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
