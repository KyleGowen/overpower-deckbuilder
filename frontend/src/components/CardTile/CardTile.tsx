import type { ReactNode } from 'react';
import { CardImage } from '../CardImage';
import { cardDisplayName } from '../../lib/catalog/catalogTypeMap';
import type { CatalogCard } from '../../lib/api/types';
import './CardTile.css';

interface CardTileProps {
  card: CatalogCard;
  onClick?: () => void;
  /** Top-right overlay (e.g. owned quantity badge). */
  overlay?: ReactNode;
  /** Footer action area (e.g. +Deck button or quantity stepper). */
  footer?: ReactNode;
  /** Dim the art (e.g. unowned cards in the collection view). */
  dimmed?: boolean;
  showMeta?: boolean;
}

export function CardTile({ card, onClick, overlay, footer, dimmed = false, showMeta = true }: CardTileProps) {
  const name = cardDisplayName(card);
  const imagePath = (card.image_path as string) || (card.image as string);

  return (
    <article className={`card-tile ${dimmed ? 'card-tile--dimmed' : ''}`}>
      <button type="button" className="card-tile__art" onClick={onClick} aria-label={`View ${name}`}>
        <CardImage imagePath={imagePath} alt={name} useThumbnail />
        {overlay ? <span className="card-tile__overlay">{overlay}</span> : null}
      </button>
      {showMeta ? (
        <div className="card-tile__meta">
          <span className="card-tile__name" title={name}>{name}</span>
          <span className="card-tile__sub">
            {card.set ? <span>{card.set}</span> : null}
            {card.rarity ? <span className="card-tile__rarity">{card.rarity}</span> : null}
          </span>
        </div>
      ) : null}
      {footer ? <div className="card-tile__footer">{footer}</div> : null}
    </article>
  );
}
