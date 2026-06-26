import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CardImage } from '../CardImage';
import { EmptyState } from '../EmptyState';
import { IconCards, IconDots } from '../icons';
import { StatIconBadge } from '../StatIconBadge';
import type { DeckCardEntry, DeckListItem, CatalogType } from '../../lib/api/types';
import type { StatIconType } from '../../lib/icons/statIconTypes';
import { formatThreatTooltip } from '../../lib/decks/deckThreat';
import { deckTileLegalityBadge } from './deckTileLegality';
import './DeckTile.css';

const ART_CYCLE_MS = 1500;
/** Hover (desktop): current slide is already visible, so wait before the first advance. */
const ART_CYCLE_HOVER_DELAY_MS = 1000;
/**
 * Touch hold: engage cycling after a brief delay so a press-and-hold cycles without needing the OS
 * long-press (the "hold till the phone vibrates" gesture). Long enough that a quick tap opens the
 * deck and a hold-then-scroll drag scrolls cleanly before the cycle would start.
 */
const ART_TOUCH_HOLD_DELAY_MS = 750;

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
}

interface ArtSlide {
  cardId: string;
  name?: string;
  imagePath?: string | null;
  catalogType?: CatalogType;
  isFoil?: boolean;
}

function deckCharacters(deck: DeckListItem): ArtSlide[] {
  const cards = deck.cards ?? [];
  return cards
    .filter((c) => c.type === 'character')
    .map((c) => ({
      cardId: c.cardId,
      name: c.name,
      imagePath: c.defaultImage,
      catalogType: 'characters' as const,
      isFoil: Boolean(c.is_foil),
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

const STAT_DEFS: Array<{ key: keyof DeckStatLine; iconKey: StatIconType }> = [
  { key: 'energy', iconKey: 'energy' },
  { key: 'combat', iconKey: 'combat' },
  { key: 'bruteForce', iconKey: 'brute_force' },
  { key: 'intelligence', iconKey: 'intelligence' },
];

export function DeckTile({
  deck,
  variant = 'full',
  maxStats,
  missionSetName,
  rankLabel,
  onOpen,
  onMenu,
}: DeckTileProps) {
  const meta = deck.metadata;
  const artSlides = useMemo(() => deckArtSlides(deck), [deck]);
  const legalityBadge = deckTileLegalityBadge(meta);
  const [slideIndex, setSlideIndex] = useState(0);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdEngagedRef = useRef(false);
  const suppressOpenClickRef = useRef(false);
  const touchHoldActiveRef = useRef(false);
  const artRef = useRef<HTMLDivElement>(null);
  const startArtCycleRef = useRef<(delayMs?: number) => void>(() => {});
  const stopArtCycleRef = useRef<() => void>(() => {});
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

  const startArtCycle = useCallback(
    (delayMs: number = ART_CYCLE_HOVER_DELAY_MS) => {
      if (artSlides.length <= 1) return;
      stopArtCycle();
      cycleDelayTimer.current = setTimeout(() => {
        cycleDelayTimer.current = null;
        holdEngagedRef.current = true;
        setSlideIndex((i) => (i + 1) % artSlides.length);
        cycleTimer.current = setInterval(() => {
          setSlideIndex((i) => (i + 1) % artSlides.length);
        }, ART_CYCLE_MS);
      }, delayMs);
    },
    [artSlides.length, stopArtCycle],
  );

  startArtCycleRef.current = startArtCycle;
  stopArtCycleRef.current = stopArtCycle;

  const handleArtPointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return;
      startArtCycle();
    },
    [startArtCycle],
  );

  const handleArtPointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return;
      stopArtCycle();
    },
    [stopArtCycle],
  );

  useEffect(() => {
    const el = artRef.current;
    if (!el) return;

    const finishTouchHold = () => {
      if (!touchHoldActiveRef.current) return;
      touchHoldActiveRef.current = false;
      const wasCycling = holdEngagedRef.current;
      stopArtCycleRef.current();
      if (wasCycling) {
        suppressOpenClickRef.current = true;
      }
    };

    const onTouchStart = () => {
      touchHoldActiveRef.current = true;
      holdEngagedRef.current = false;
      // Engage cycling on a short hold (no OS long-press needed). touch-action: pan-x pan-y lets a
      // drag in either axis scroll instead (vertical lists, horizontal Home rails) — the browser
      // fires touchcancel when it claims the gesture for scrolling, which stops the cycle so the
      // page/rail can scroll freely.
      startArtCycleRef.current(ART_TOUCH_HOLD_DELAY_MS);
    };

    const onTouchEnd = () => finishTouchHold();
    const onContextMenu = (e: Event) => e.preventDefault();

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  const handleTileClick = useCallback(() => {
    if (suppressOpenClickRef.current) {
      suppressOpenClickRef.current = false;
      return;
    }
    onOpen?.();
  }, [onOpen]);

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
      onClick={onOpen ? handleTileClick : undefined}
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
        ref={artRef}
        className="deck-tile__art"
        onPointerEnter={handleArtPointerEnter}
        onPointerLeave={handleArtPointerLeave}
        onContextMenu={(e) => e.preventDefault()}
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
              loading="eager"
              className={isLocationSlide ? undefined : 'card-image--contain'}
              isFoil={shownSlide.isFoil}
              foilSeed={shownSlide.cardId}
              foilSize="hero"
            />
          </div>
        ) : (
          <div className="deck-tile__art-empty">
            <IconCards />
          </div>
        )}
        <div className="deck-tile__art-veil" />

        {rankLabel ? <span className="deck-tile__rank">{rankLabel}</span> : null}
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
          {legalityBadge ? (
            <span
              className={`deck-tile__legality deck-tile__legality--meta badge ${
                legalityBadge.variant === 'not-legal' ? 'badge-not-legal' : ''
              }`}
            >
              {legalityBadge.label}
            </span>
          ) : null}
          <span className="deck-tile__metric deck-tile__metric--end">
            <StatIconBadge
              type="threat_level"
              value={meta.threat ?? 0}
              size="sm"
              title={formatThreatTooltip(meta.threat ?? 0)}
            />
          </span>
        </div>

        {variant === 'full' && maxStats ? (
          <div className="deck-tile__stats" aria-label="Character maximums">
            {STAT_DEFS.map((s) => (
              <StatIconBadge
                key={s.key}
                type={s.iconKey}
                value={maxStats[s.key]}
                size="md"
              />
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
                className={`deck-tile__legality deck-tile__legality--footer badge ${
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
