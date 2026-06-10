import { CardImage } from '../CardImage';
import './CharacterRibbon.css';

export interface RibbonCharacter {
  cardId: string;
  name?: string;
  imagePath?: string | null;
}

interface CharacterRibbonProps {
  characters: RibbonCharacter[];
  /** Visual style: 'strip' (equal slots) or 'fan' (overlapping). */
  variant?: 'strip' | 'fan';
  /** Max characters to render (OverPower decks have up to 4). */
  max?: number;
  /** Show an "R" reserve badge in the corner. */
  hasReserve?: boolean;
  className?: string;
}

/**
 * Renders a deck's characters as a polished image ribbon. OverPower decks are
 * built around their (up to four) characters, so this gives an at-a-glance read
 * of a deck's identity. Uses real card thumbnails only.
 */
export function CharacterRibbon({
  characters,
  variant = 'strip',
  max = 4,
  hasReserve = false,
  className = '',
}: CharacterRibbonProps) {
  const shown = characters.slice(0, max);
  if (shown.length === 0) return null;

  return (
    <div
      className={`character-ribbon character-ribbon--${variant} ${className}`}
      data-count={shown.length}
      aria-hidden="true"
    >
      {shown.map((c, i) => (
        <div className="character-ribbon__slot" key={c.cardId || i} style={{ zIndex: shown.length - i }}>
          <CardImage imagePath={c.imagePath} alt={c.name || 'Character'} useThumbnail />
        </div>
      ))}
      {hasReserve ? <span className="character-ribbon__reserve">R</span> : null}
    </div>
  );
}
