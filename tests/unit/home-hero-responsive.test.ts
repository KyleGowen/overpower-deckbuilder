import * as fs from 'fs';
import * as path from 'path';

describe('responsive home hero artwork', () => {
  const css = fs.readFileSync(
    path.join(__dirname, '../../frontend/src/features/home/HomePage.css'),
    'utf8',
  );

  it('sizes banner art from hero height instead of stretching it to viewport width', () => {
    const imageRule = css.match(/\.home__hero-art-image\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(imageRule).toContain('right: 0');
    expect(imageRule).toContain('width: auto');
    expect(imageRule).toContain('height: clamp(100%');
    expect(imageRule).toContain('140%');
    expect(imageRule).toContain('max-width: none');
    expect(imageRule).toContain('object-fit: contain');
    expect(imageRule).not.toContain('object-fit: cover');
  });

  it('keeps the mobile composition at the approved scale', () => {
    const mobileRule = css.match(/\.layout-mobile \.home__hero-art-image\s*\{([^}]*)\}/)?.[1] ?? '';
    const mirroredMobileRule = css.match(
      /\.layout-mobile \.home__hero-art-image--mirrored\s*\{([^}]*)\}/,
    )?.[1] ?? '';

    expect(mobileRule).toContain('height: 100%');
    expect(mirroredMobileRule).toContain('linear-gradient(270deg');
  });

  it('keeps the left fade on the rendered side when the active banner is mirrored', () => {
    const mirroredRule = css.match(/\.home__hero-art-image--mirrored\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(mirroredRule).toContain('scaleX(-1)');
    expect(mirroredRule).toContain('linear-gradient(270deg');
  });
});
