import { assetUrl } from '../../lib/images/cardImages';
import {
  STAT_ICON_PATHS,
  buildStatIconBadgeLabel,
  type StatIconType,
} from '../../lib/icons/statIconTypes';
import './StatIconBadge.css';

export { buildStatIconBadgeLabel } from '../../lib/icons/statIconTypes';

export interface StatIconBadgeProps {
  type: StatIconType;
  value: number | string;
  size?: 'sm' | 'md';
  title?: string;
  className?: string;
}

export function StatIconBadge({
  type,
  value,
  size = 'md',
  title,
  className,
}: StatIconBadgeProps) {
  const displayValue = String(value);
  const ariaLabel = buildStatIconBadgeLabel(type, value);
  const tooltip = title ?? ariaLabel;
  const isWide = displayValue.length >= 2;

  return (
    <span
      className={[
        'stat-icon-badge',
        `stat-icon-badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      title={tooltip}
    >
      <img
        src={assetUrl(STAT_ICON_PATHS[type])}
        alt=""
        className="stat-icon-badge__icon"
        width={size === 'sm' ? 18 : 32}
        height={size === 'sm' ? 18 : 32}
      />
      <span
        className={[
          'stat-icon-badge__value',
          isWide ? 'stat-icon-badge__value--wide' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {displayValue}
      </span>
    </span>
  );
}
