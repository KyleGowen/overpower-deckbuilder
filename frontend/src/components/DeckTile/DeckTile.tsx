import { CharacterRibbon, type RibbonCharacter } from '../CharacterRibbon';
import { EmptyState } from '../EmptyState';
import { IconCards, IconDots, IconStar } from '../icons';
import type { DeckListItem } from '../../lib/api/types';
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
  const isLegal = meta.is_valid;

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
        {characters.length > 0 ? (
          <CharacterRibbon characters={characters} hasReserve={Boolean(meta.reserve_character)} />
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
      </div>

      <div className="deck-tile__body">
        <div className="deck-tile__heading">
          <h3 className="deck-tile__name" title={meta.name}>{meta.name}</h3>
          <div className="deck-tile__numbers">
            <span className="deck-tile__count">
              <IconCards /> {meta.cardCount}
            </span>
            <span className="deck-tile__threat" title="Threat">
              {meta.threat ?? 0}
              <small>THREAT</small>
            </span>
          </div>
        </div>

        <div className="deck-tile__badges">
          <span className={`badge ${isLegal ? 'badge-legal' : 'badge-not-legal'}`}>
            {isLegal ? 'Legal' : 'Not Legal'}
          </span>
          {meta.is_limited ? <span className="badge">Limited</span> : null}
        </div>

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

        {variant === 'full' && meta.lastModified ? (
          <div className="deck-tile__updated">
            Updated {new Date(meta.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DeckTileEmpty({ message }: { message: string }) {
  return <EmptyState title="No decks yet" message={message} icon={<IconCards />} />;
}
