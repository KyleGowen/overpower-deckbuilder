import * as fs from 'fs';
import * as path from 'path';

describe('Card detail errata styling', () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), 'frontend/src/components/CardDetailPanel/CardDetailPanel.css'),
    'utf8',
  );
  const component = fs.readFileSync(
    path.join(process.cwd(), 'frontend/src/components/CardDetailPanel/CardDetailPanel.tsx'),
    'utf8',
  );

  const entryRule = css.match(/\.card-detail__errata-entry\s*\{([^}]*)\}/)?.[1] ?? '';
  const textRule = css.match(/\.card-detail__errata-text\s*\{([^}]*)\}/)?.[1] ?? '';
  const mobileSlideoutRule = css.match(
    /\.layout-mobile \.card-detail-slideout \.slideout__body\s*\{([^}]*)\}/,
  )?.[1] ?? '';

  it('uses flat divider rows instead of nested accented cards', () => {
    expect(entryRule).toContain('border-bottom: 1px solid var(--color-border)');
    expect(entryRule).not.toContain('border-left');
    expect(entryRule).not.toContain('border-radius');
    expect(entryRule).not.toContain('background');
  });

  it('matches the readable body treatment used elsewhere in the slide panel', () => {
    expect(textRule).toContain('color: var(--color-text)');
    expect(textRule).toContain('line-height: 1.6');
  });

  it('reserves mobile bottom-nav and safe-area clearance for the final errata row', () => {
    expect(component).toContain('className="card-detail-slideout"');
    expect(mobileSlideoutRule).toContain('padding-bottom: calc(');
    expect(mobileSlideoutRule).toContain('var(--bottom-nav-height)');
    expect(mobileSlideoutRule).toContain('env(safe-area-inset-bottom, 0px)');
    expect(mobileSlideoutRule).toContain('scroll-padding-bottom: calc(');
  });
});
