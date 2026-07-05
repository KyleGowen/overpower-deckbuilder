import { CardImage } from '../CardImage';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import './TournamentCharts.css';

interface TournamentHighlightTileProps {
  label: string;
  detail?: string;
  cardName: string;
  card: CatalogCard | null;
  catalogType: CatalogType;
  onClick?: () => void;
}

export function TournamentHighlightTile({
  label,
  detail,
  cardName,
  card,
  catalogType,
  onClick,
}: TournamentHighlightTileProps) {
  const clickable = Boolean(card && onClick);

  return (
    <article className="stats-chart-tile panel tournament-highlight-tile">
      <div className="stats-chart-tile__art">
        {card ? (
          <button
            type="button"
            className="tournament-highlight-tile__art"
            onClick={onClick}
            disabled={!clickable}
            aria-label={`View ${cardName}`}
          >
            <CardImage
              imagePath={card.image_path ?? card.image}
              alt={cardName}
              catalogType={catalogType}
              useThumbnail
              loading="eager"
            />
          </button>
        ) : (
          <div className="tournament-highlight-tile__placeholder">{cardName}</div>
        )}
      </div>
      <footer className="stats-chart-tile__body preview-tile__caption stats-chart-tile__body--center">
        <p className="preview-tile__title preview-tile__title--caps">{label}</p>
        {detail ? <p className="preview-tile__detail">{detail}</p> : null}
        <p className="preview-tile__subtitle tournament-highlight-tile__name">{cardName}</p>
      </footer>
    </article>
  );
}
