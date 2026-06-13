import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardImage } from '../CardImage';
import { EmptyState } from '../EmptyState';
import { IconCards, IconDots, IconStar } from '../icons';
import type { DeckCardEntry, DeckListItem, CatalogType } from '../../lib/api/types';
import { assetUrl } from '../../lib/images/cardImages';
import { deckTileLegalityBadge } from './deckTileLegality';
import './DeckTile.css';

const THREAT_ICON_URL = assetUrl('/src/resources/images/icons/threat.png');

const ART_CYCLE_MS = 1500;
/** Wait before first advance — current slide is already visible on hover enter. */
const ART_CYCLE_HOVER_DELAY_MS = 1000;

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
  /** Mission set name from catalog lookup (not the display mission card name). */
  missionSetName?: string | null;
  rankLabel?: string;
  onOpen?: () => void;
  onMenu?: () => void;
  favorite?: boolean;
}

interface ArtSlide {
  cardId: string;
  name?: string;
  imagePath?: string | null;
  catalogType?: CatalogType;
}

function deckCharacters(deck: DeckListItem): ArtSlide[] {
  const cards = deck.cards ?? [];
  return cards
    .filter((c) => c.type === 'character')
    .map((c) => ({
      cardId: c.cardId,
      name: c.name,
      imagePath: c.defaultImage,
      catalogType: 'characters',
    }));
}

function firstCardOfType(deck: DeckListItem, type: DeckCardEntry['type']): DeckCardEntry | undefined {
  return (deck.cards ?? []).find((c) => c.type === type);
}

function deckArtSlides(deck: DeckListItem): ArtSlide[] {
  const slides = deckCharacters(deck);
  const location = firstCardOfType(deck, 'location');
  if (location?.defaultImage) {
    slides.push({
      cardId: location.cardId,
      name: location.name ?? 'Location',
      imagePath: location.defaultImage,
      catalogType: 'locations',
    });
  }
  return slides;
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
  missionSetName,
  rankLabel,
  onOpen,
  onMenu,
  favorite,
}: DeckTileProps) {
  const meta = deck.metadata;
  const artSlides = useMemo(() => deckArtSlides(deck), [deck]);
  const legalityBadge = deckTileLegalityBadge(meta);
  const [slideIndex, setSlideIndex] = useState(0);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownSlide = artSlides[slideIndex] ?? artSlides[0];
  const isLocationSlide = shownSlide?.catalogType === 'locations';

  const stopArtCycle = useCallback(() => {
    if (cycleTimer.current != null) {
      clearInterval(cycleTimer.current);
      cycleTimer.current = null;
    }
    if (cycleDelayTimer.current != null) {
      clearTimeout(cycleDelayTimer.current);
      cycleDelayTimer.current = null;
    }
  }, []);

  const handleArtPointerEnter = useCallback(() => {
    if (artSlides.length <= 1) return;
    stopArtCycle();
    cycleDelayTimer.current = setTimeout(() => {
      cycleDelayTimer.current = null;
      setSlideIndex((i) => (i + 1) % artSlides.length);
      cycleTimer.current = setInterval(() => {
        setSlideIndex((i) => (i + 1) % artSlides.length);
      }, ART_CYCLE_MS);
    }, ART_CYCLE_HOVER_DELAY_MS);
  }, [artSlides.length, stopArtCycle]);

  const handleArtPointerLeave = useCallback(() => {
    stopArtCycle();
  }, [stopArtCycle]);

  useEffect(() => () => stopArtCycle(), [stopArtCycle]);

  const mission = firstCardOfType(deck, 'mission');
  const missionChipLabel = missionSetName?.trim() || mission?.name?.trim() || null;
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
      <div
        className="deck-tile__art"
        onPointerEnter={handleArtPointerEnter}
        onPointerLeave={handleArtPointerLeave}
      >
        {shownSlide ? (
          <div
            className={`deck-tile__hero${isLocationSlide ? ' deck-tile__hero--location' : ''}`}
            aria-hidden="true"
          >
            <CardImage
              imagePath={shownSlide.imagePath}
              catalogType={shownSlide.catalogType}
              alt={shownSlide.name || 'Character'}
              useThumbnail={!isLocationSlide}
              className={isLocationSlide ? undefined : 'card-image--contain'}
            />
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
        <div className="deck-tile__meta-bar" aria-label="Deck summary">
          <span className="deck-tile__metric deck-tile__metric--start" title="Cards">
            <span className="deck-tile__metric-icon" aria-hidden="true">
              <IconCards />
            </span>
            {meta.cardCount}
          </span>
          {missionChipLabel ? (
            <span className="deck-tile__chip" title={`Mission set: ${missionChipLabel}`}>
              <span className="deck-tile__chip-text">{missionChipLabel}</span>
            </span>
          ) : null}
          <span className="deck-tile__metric deck-tile__metric--end" title="Threat">
            <span className="deck-tile__metric-icon" aria-hidden="true">
              <img src={THREAT_ICON_URL} alt="" className="deck-tile__metric-img" width={18} height={18} />
            </span>
            {meta.threat ?? 0}
          </span>
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

        {updatedLabel || legalityBadge ? (
          <div className="deck-tile__footer">
            {updatedLabel ? (
              <span className="deck-tile__updated">Updated {updatedLabel}</span>
            ) : (
              <span className="deck-tile__footer-spacer" aria-hidden="true" />
            )}
            {legalityBadge ? (
              <span
                className={`badge ${
                  legalityBadge.variant === 'not-legal' ? 'badge-not-legal' : ''
                }`}
              >
                {legalityBadge.label}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DeckTileEmpty({ message }: { message: string }) {
  return <EmptyState title="No decks yet" message={message} icon={<IconCards />} />;
}
