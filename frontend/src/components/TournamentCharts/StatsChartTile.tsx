import type { ReactNode } from 'react';
import './TournamentCharts.css';

interface StatsChartTileProps {
  title: string;
  subtitle?: string;
  footnote?: string;
  /** Stat value line for spotlight-style captions. */
  detail?: string;
  children: ReactNode;
  className?: string;
  /** Caption alignment in body; charts/cards default center. */
  captionAlign?: 'center' | 'start';
}

export function StatsChartTile({
  title,
  subtitle,
  footnote,
  detail,
  children,
  className = '',
  captionAlign = 'center',
}: StatsChartTileProps) {
  const bodyAlignClass =
    captionAlign === 'start'
      ? 'stats-chart-tile__body--start'
      : 'stats-chart-tile__body--center';

  return (
    <article className={`stats-chart-tile panel ${className}`.trim()}>
      <div className="stats-chart-tile__art">{children}</div>
      <footer className={`stats-chart-tile__body preview-tile__caption ${bodyAlignClass}`.trim()}>
        <h3 className="preview-tile__title stats-chart-tile__title">{title}</h3>
        {detail ? <p className="preview-tile__detail">{detail}</p> : null}
        {subtitle ? <p className="preview-tile__subtitle stats-chart-tile__subtitle">{subtitle}</p> : null}
        {footnote ? <p className="preview-tile__footnote stats-chart-tile__footnote">{footnote}</p> : null}
      </footer>
    </article>
  );
}
