import type { RibbonCharacter } from '../CharacterRibbon';
import { CardImage } from '../CardImage';
import { EmptyState } from '../EmptyState';
import { IconCards, IconDots, IconStar } from '../icons';
import type { DeckCardEntry, DeckListItem } from '../../lib/api/types';
import './DeckTile.css';

export interface DeckStatLine {
  energy: number;
  combat: number;
  bruteForce: number;
  intelligence: number;
}

interface DeckTileProps {
  deck: DeckListItem;
  variant?: 'compact' | 'full';
  /** Optional precomputed max-stat line (deck selection enriches from catalog). */
  maxStats?: DeckStatLine | null;
  rankLabel?: string;
  onOpen?: () => void;
  onMenu?: () => void;
  favorite?: boolean;
}

function deckCharacters(deck: DeckListItem): RibbonCharacter[] {
  const cards = deck.cards ?? [];
  return cards
    .filter((c) => c.type === 'character')
    .map((c) => ({ cardId: c.cardId, name: c.name, imagePath: c.defaultImage }));
}

function firstCardOfType(deck: DeckListItem, type: DeckCardEntry['type']): DeckCardEntry | undefined {
  return (deck.cards ?? []).find((c) => c.type === type);
}

const STAT_DEFS: Array<{ key: keyof DeckStatLine; label: string; cls: string }> = [
  { key: 'energy', label: 'Energy', cls: 'stat-energy' },
  { key: 'combat', label: 'Combat', cls: 'stat-combat' },
  { key: 'bruteForce', label: 'Brute Force', cls: 'stat-brute-force' },
  { key: 'intelligence', label: 'Intelligence', cls: 'stat-intelligence' },
];

export function DeckTile({
  deck,
  variant = 'full',
  maxStats,
  rankLabel,
  onOpen,
  onMenu,
  favorite,
}: DeckTileProps) {
  const meta = deck.metadata;
  const characters = deckCharacters(deck);
  const hero = characters[0];
  const isLegal = meta.is_valid;
  const location = firstCardOfType(deck, 'location');
  const mission = firstCardOfType(deck, 'mission');
  const updatedLabel = meta.lastModified
    ? new Date(meta.lastModified).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <article
      className={`deck-tile deck-tile--${variant}`}
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="deck-tile__art">
        {hero ? (
          <div className="deck-tile__hero" aria-hidden="true">
            <CardImage imagePath={hero.imagePath} alt={hero.name || 'Character'} useThumbnail />
          </div>
        ) : (
          <div className="deck-tile__art-empty">
            <IconCards />
          </div>
        )}
        <div className="deck-tile__art-veil" />

        {rankLabel ? <span className="deck-tile__rank">{rankLabel}</span> : null}
        {favorite ? (
          <span className="deck-tile__fav" aria-label="Favorite"><IconStar /></span>
        ) : null}
        {onMenu ? (
          <button
            type="button"
            className="deck-tile__menu"
            aria-label="Deck actions"
            onClick={(e) => {
              e.stopPropagation();
              onMenu();
            }}
          >
            <IconDots />
          </button>
        ) : null}

        <div className="deck-tile__overlay">
          <h3 className="deck-tile__name" title={meta.name}>{meta.name}</h3>
        </div>
      </div>

      <div className="deck-tile__body">
        <div className="deck-tile__numbers">
          <span className="deck-tile__count">
            <IconCards /> {meta.cardCount}
          </span>
          <span className="deck-tile__threat" title="Threat">
            {meta.threat ?? 0}
            <small>THREAT</small>
          </span>
        </div>

        <div className="deck-tile__badges">
          <span className={`badge ${isLegal ? 'badge-legal' : 'badge-not-legal'}`}>
            {isLegal ? 'Legal' : 'Not Legal'}
          </span>
          {meta.is_limited ? <span className="badge">Limited</span> : null}
        </div>

        {variant === 'full' && (location || mission) ? (
          <div className="deck-tile__chips">
            {location ? (
              <span className="deck-tile__chip" title={`Location: ${location.name ?? ''}`}>
                <span className="deck-tile__chip-thumb">
                  <CardImage imagePath={location.defaultImage} alt={location.name || 'Location'} useThumbnail />
                </span>
                <span className="deck-tile__chip-text">{location.name ?? 'Location'}</span>
              </span>
            ) : null}
            {mission ? (
              <span className="deck-tile__chip" title={`Mission: ${mission.name ?? ''}`}>
                <span className="deck-tile__chip-text">{mission.name ?? 'Mission'}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        {variant === 'full' && maxStats ? (
          <div className="deck-tile__stats">
            {STAT_DEFS.map((s) => (
              <div className="deck-tile__stat" key={s.key}>
                <span className={`deck-tile__stat-val ${s.cls}`}>{maxStats[s.key]}</span>
                <span className="deck-tile__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {updatedLabel ? (
          <div className="deck-tile__updated">Updated {updatedLabel}</div>
        ) : null}
      </div>
    </article>
  );
}

export function DeckTileEmpty({ message }: { message: string }) {
  return <EmptyState title="No decks yet" message={message} icon={<IconCards />} />;
}
