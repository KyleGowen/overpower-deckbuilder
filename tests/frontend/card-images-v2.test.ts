/**
 * v2 card image helpers — progressive load path detection and preload/reveal.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  canProgressiveLoad,
  imageElementMatchesUrl,
  normalizeRawImagePath,
  resolveImageUrl,
  resolveThumbUrl,
} from '../../frontend/src/lib/images/cardImages';
import {
  clearProgressiveImageSession,
  preloadAndRevealFullRes,
} from '../../frontend/src/lib/images/progressiveImageLoad';
import {
  catalogTypeUsesPortraitThumb,
  isLandscapeCatalogType,
} from '../../frontend/src/lib/catalog/catalogTypeMap';

/** Painted size for object-fit: contain (matches DB tile framing). */
function containPaintedSize(nw: number, nh: number, fw: number, fh: number) {
  const ia = nw / nh;
  const fa = fw / fh;
  if (ia > fa) return { pw: fw, ph: fw / ia };
  return { ph: fh, pw: fh * ia };
}

describe('normalizeRawImagePath for locations', () => {
  it('prepends locations/ for bare filenames and alternate subfolders', () => {
    expect(normalizeRawImagePath('barsoom.webp', 'locations')).toBe('locations/barsoom.webp');
    expect(normalizeRawImagePath('alternate/draculas_armory.png', 'locations')).toBe(
      'locations/alternate/draculas_armory.png',
    );
    expect(normalizeRawImagePath('/src/resources/cards/images/alternate/221_b_baker_st.png', 'locations')).toBe(
      '/src/resources/cards/images/locations/alternate/221_b_baker_st.png',
    );
  });

  it('leaves already-prefixed location paths unchanged', () => {
    expect(normalizeRawImagePath('locations/barsoom.webp', 'locations')).toBe('locations/barsoom.webp');
  });

  it('does not rewrite non-location catalog types', () => {
    expect(normalizeRawImagePath('barsoom.webp', 'characters')).toBe('barsoom.webp');
  });
});

describe('location progressive load paths', () => {
  it('resolves thumb and full URLs for bare location filenames', () => {
    expect(canProgressiveLoad('barsoom.webp', 'locations')).toBe(true);
    expect(resolveImageUrl('barsoom.webp', 'locations')).toBe(
      '/src/resources/cards/images/locations/barsoom.webp',
    );
    expect(resolveThumbUrl('barsoom.webp', 'locations')).toBe(
      '/src/resources/cards/images/locations/thumb/barsoom.webp',
    );
  });

  it('requires catalogType for deck-list location defaultImage (bare filename)', () => {
    expect(resolveThumbUrl('danger_room.webp')).not.toContain('/locations/');
    expect(resolveThumbUrl('danger_room.webp', 'locations')).toBe(
      '/src/resources/cards/images/locations/thumb/danger_room.webp',
    );
  });
});

describe('canProgressiveLoad', () => {
  it('returns true when thumb and full asset paths differ', () => {
    expect(canProgressiveLoad('characters/angry_mob.webp')).toBe(true);
    expect(resolveThumbUrl('characters/angry_mob.webp')).not.toBe(
      resolveImageUrl('characters/angry_mob.webp'),
    );
  });

  it('returns false for empty, absolute, or already-thumb paths', () => {
    expect(canProgressiveLoad('')).toBe(false);
    expect(canProgressiveLoad(null)).toBe(false);
    expect(canProgressiveLoad('https://cdn.example.com/foo.webp')).toBe(false);
    expect(canProgressiveLoad('characters/thumb/foo.webp')).toBe(false);
  });

  it('returns false when thumbify cannot derive a distinct path', () => {
    expect(canProgressiveLoad('not-a-card-path')).toBe(false);
  });
});

describe('imageElementMatchesUrl', () => {
  it('matches absolute browser src to site-relative asset path', () => {
    const img = { src: 'http://localhost:5173/src/resources/cards/images/characters/foo.webp' } as HTMLImageElement;
    expect(imageElementMatchesUrl(img, '/src/resources/cards/images/characters/foo.webp')).toBe(true);
  });
});

describe('preloadAndRevealFullRes', () => {
  const OriginalImage = global.Image;

  beforeEach(() => {
    clearProgressiveImageSession('database');
  });

  afterEach(() => {
    global.Image = OriginalImage;
    jest.restoreAllMocks();
  });

  it('sets target src, decodes, and calls onRevealed after preload onload', async () => {
    type PreloadMock = { onload: (() => void) | null; _src: string };
    let preloadInstance: PreloadMock | null = null;

    global.Image = jest.fn().mockImplementation(() => {
      preloadInstance = { onload: null, _src: '' };
      Object.defineProperty(preloadInstance, 'src', {
        set(value: string) {
          (preloadInstance as PreloadMock)._src = value;
        },
        get() {
          return (preloadInstance as PreloadMock)._src;
        },
      });
      return preloadInstance;
    }) as unknown as typeof Image;

    const decode = jest.fn().mockResolvedValue(undefined);
    const target = { src: '', decode };
    const onRevealed = jest.fn();

    const handle = preloadAndRevealFullRes('/src/resources/cards/images/characters/foo.webp', target, onRevealed);

    expect(preloadInstance).not.toBeNull();
    preloadInstance!.onload?.();

    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(target.src).toBe('/src/resources/cards/images/characters/foo.webp');
    expect(decode).toHaveBeenCalled();
    await Promise.resolve();
    expect(onRevealed).toHaveBeenCalled();
    handle.cancel();
  });

  it('does not reveal after cancel', () => {
    let preloadInstance: { onload: (() => void) | null; src: string } | null = null;

    global.Image = jest.fn().mockImplementation(() => {
      preloadInstance = { onload: null, src: '' };
      return preloadInstance;
    }) as unknown as typeof Image;

    const decode = jest.fn().mockResolvedValue(undefined);
    const target = { src: '', decode };
    const onRevealed = jest.fn();

    const handle = preloadAndRevealFullRes('/full.webp', target, onRevealed);
    handle.cancel();
    preloadInstance!.onload?.();

    return decode().then(() => {
      expect(onRevealed).not.toHaveBeenCalled();
    });
  });
});

describe('CardImage progressive CSS', () => {
  it('defines two-layer progressive classes', () => {
    const cssPath = path.join(__dirname, '../../frontend/src/components/CardImage/CardImage.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    expect(css).toContain('.card-image__img--thumb');
    expect(css).toContain('.card-image__img--full');
    expect(css).toContain('.card-image__full--loaded');
    expect(css).toContain('.card-image--progressive');
    expect(css).not.toContain('visibility: hidden');
    expect(css).toContain('.card-image--progressive.card-image--loading .card-image__img--thumb');
    expect(css).toContain('.card-image--contain.card-image--progressive .card-image__img--full');
  });
});

describe('contain painted size parity', () => {
  it('portrait thumb and full paint to similar height in a 5:7 frame', () => {
    const frame = { w: 197, h: 276 };
    const thumb = containPaintedSize(350, 490, frame.w, frame.h);
    const full = containPaintedSize(819, 1114, frame.w, frame.h);
    expect(Math.abs(thumb.ph - full.ph)).toBeLessThan(12);
  });

  it('location full art letterboxes in a 236:151 frame (contain thumbs must match, not cover-fill)', () => {
    const frame = { w: 304, h: 195 };
    const full = containPaintedSize(1114, 819, frame.w, frame.h);
    expect(full.ph).toBeCloseTo(frame.h, 0);
    expect(full.pw).toBeLessThan(frame.w);
  });
});

describe('catalogTypeUsesPortraitThumb', () => {
  it('returns true for portrait DB tabs and false for landscape tabs', () => {
    expect(catalogTypeUsesPortraitThumb('special-cards')).toBe(true);
    expect(catalogTypeUsesPortraitThumb('missions')).toBe(true);
    expect(isLandscapeCatalogType('characters')).toBe(true);
    expect(catalogTypeUsesPortraitThumb('characters')).toBe(false);
  });
});

describe('CardTile database progressive wiring', () => {
  it('passes progressive and catalogType for database grid', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/components/CardTile/CardTile.tsx'),
      'utf8',
    );
    expect(source).toContain('progressive={Boolean(catalogType)}');
    expect(source).toContain('catalogType={catalogType}');
    expect(source).not.toContain('catalogTypeUsesFullImageInDbGrid');
  });
});
