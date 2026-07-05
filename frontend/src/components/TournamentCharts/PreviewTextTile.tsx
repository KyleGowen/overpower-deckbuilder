export interface PreviewTextTileSection {
  label: string;
  value: string;
  variant?: 'default' | 'accent';
  /** Allow value to wrap (e.g. long location lines). */
  wrap?: boolean;
}

export interface PreviewTextTileProps {
  title: string;
  subtitle?: string;
  sections: PreviewTextTileSection[];
  className?: string;
}

export function PreviewTextTile({
  title,
  subtitle,
  sections,
  className = '',
}: PreviewTextTileProps) {
  return (
    <article className={`stats-chart-tile panel preview-text-tile ${className}`.trim()}>
      <div className="preview-text-tile__content">
        <h1 className="preview-text-tile__h1">{title}</h1>
        {subtitle ? <h2 className="preview-text-tile__h2">{subtitle}</h2> : null}
        <div className="preview-text-tile__spacer" aria-hidden="true" />
        {sections.map((section) => (
          <div key={section.label} className="preview-text-tile__section">
            <h3 className="preview-text-tile__section-label">{section.label}</h3>
            <p
              className={[
                'preview-text-tile__section-value',
                section.variant === 'accent' ? 'preview-text-tile__section-value--accent' : '',
                section.wrap ? 'preview-text-tile__section-value--wrap' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {section.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
