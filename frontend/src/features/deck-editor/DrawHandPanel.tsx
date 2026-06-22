import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react';
import { CardImage } from '../../components/CardImage';
import { SlideOutPanel } from '../../components/SlideOutPanel';
import { imagePathFromCard } from '../../lib/images/cardImages';
import type { CatalogCard, CatalogType, DeckCardEntry } from '../../lib/api/types';
import {
  shouldDimDeckCard,
  type KoDimmingContext,
} from '../../lib/decks/simulateKo';
import {
  catalogSlugForDeckType,
  deckCardDisplayName,
  resolveDeckCatalogCard,
  type DeckCardIndex,
} from '../../lib/decks/deckCardCatalog';
import { useLayoutMode } from '../../lib/layout/LayoutModeProvider';
import { useDrawHandScale } from './useDrawHandScale';
import './DrawHandPanel.css';

/** Match deck grid: thumbs for portrait types; locations/events use full-res. */
function drawHandUsesThumbnail(catalogType?: CatalogType): boolean {
  return catalogType !== 'locations' && catalogType !== 'events';
}

function resolveDrawHandImagePath(
  entry: DeckCardEntry,
  catalogCard: CatalogCard | undefined,
): string {
  return entry.defaultImage || imagePathFromCard(catalogCard) || '';
}

function useFinePointer(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);
}

export interface DrawHandPanelProps {
  open: boolean;
  drawnCards: DeckCardEntry[];
  cardIndex: DeckCardIndex;
  koCtx: KoDimmingContext;
  onRedraw: () => void;
  onClose: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onCardClick?: (catalogCard: CatalogCard, catalogType: CatalogType, instanceId: string) => void;
}

export function DrawHandPanel({
  open,
  drawnCards,
  cardIndex,
  koCtx,
  onRedraw,
  onClose,
  onReorder,
  onCardClick,
}: DrawHandPanelProps) {
  const { isMobile } = useLayoutMode();
  const canDrag = useFinePointer();
  const rowRef = useRef<HTMLDivElement>(null);
  const scale = useDrawHandScale(rowRef, drawnCards.length);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [failedImageSlots, setFailedImageSlots] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (open) {
      setFailedImageSlots(new Set());
    }
  }, [open, drawnCards]);

  const markImageFailed = useCallback((index: number) => {
    setFailedImageSlots((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const rowInnerStyle = useMemo((): CSSProperties | undefined => {
    if (scale >= 1) return undefined;
    return { transform: `scale(${scale})` };
  }, [scale]);

  const handleDragStart = useCallback(
    (index: number) => (e: DragEvent<HTMLDivElement>) => {
      if (!canDrag) return;
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    },
    [canDrag],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback(
    (index: number) => (e: DragEvent<HTMLDivElement>) => {
      if (!canDrag || draggedIndex === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    },
    [canDrag, draggedIndex],
  );

  const handleDrop = useCallback(
    (targetIndex: number) => (e: DragEvent<HTMLDivElement>) => {
      if (!canDrag) return;
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== targetIndex) {
        onReorder(draggedIndex, targetIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [canDrag, draggedIndex, onReorder],
  );

  return (
    <SlideOutPanel
      open={open}
      onClose={onClose}
      side="top"
      position={isMobile ? 'fixed' : 'absolute'}
      className="draw-hand-slideout"
      title="Drawn hand"
      ariaLabel="Drawn hand"
      footer={
        <button type="button" className="btn btn-secondary draw-hand__redraw" onClick={onRedraw}>
          Draw again
        </button>
      }
    >
      {drawnCards.length === 0 ? (
        <p className="draw-hand__empty">No cards to display.</p>
      ) : (
        <div
          ref={rowRef}
          className={`draw-hand__row${dragOverIndex !== null ? ' draw-hand__row--drag-over' : ''}`}
          style={{ '--draw-hand-scale': scale } as CSSProperties}
        >
          <div className="draw-hand__row-inner" style={rowInnerStyle}>
            {drawnCards.map((entry, index) => {
              const catalogType = catalogSlugForDeckType(entry.type);
              const catalogCard = resolveDeckCatalogCard(entry, cardIndex);
              const imagePath = resolveDrawHandImagePath(entry, catalogCard);
              const cardName = deckCardDisplayName(entry, cardIndex);
              const missingArt = !imagePath;
              const showArtLabel = missingArt || failedImageSlots.has(index);
              const koDimmed = shouldDimDeckCard(entry, catalogCard, koCtx);
              const isEvent = entry.type === 'event';
              const canOpenDetail = Boolean(catalogCard && catalogType && entry.instanceId && onCardClick);
              const isDragging = draggedIndex === index;
              const isDragTarget = dragOverIndex === index && draggedIndex !== index;

              return (
                <div
                  key={`${entry.type}:${entry.cardId}:${index}`}
                  className={`draw-hand__slot${isDragging ? ' draw-hand__slot--dragging' : ''}${isDragTarget ? ' draw-hand__slot--drag-target' : ''}`}
                  draggable={canDrag}
                  onDragStart={handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver(index)}
                  onDrop={handleDrop(index)}
                >
                  <div
                    className={`deck-editor__card draw-hand__card${koDimmed ? ' deck-editor__card--ko-dimmed' : ''}`}
                  >
                    <div className="deck-editor__card-media">
                      <button
                        type="button"
                        className={`deck-editor__card-img deck-editor__card-img--portrait${isEvent ? ' draw-hand__event-portrait' : ''}`}
                        disabled={!canOpenDetail}
                        onClick={() => {
                          if (catalogCard && catalogType && entry.instanceId && onCardClick) {
                            onCardClick(catalogCard, catalogType, entry.instanceId);
                          }
                        }}
                        aria-label={cardName}
                        title={cardName}
                      >
                        {isEvent ? (
                          <span className="draw-hand__event-rotate">
                            <CardImage
                              imagePath={imagePath}
                              alt={cardName}
                              catalogType="events"
                              useThumbnail={false}
                              loading="eager"
                              className="card-image--contain"
                              onImageFailed={() => markImageFailed(index)}
                            />
                          </span>
                        ) : (
                          <CardImage
                            imagePath={imagePath}
                            alt={cardName}
                            catalogType={catalogType}
                            useThumbnail={drawHandUsesThumbnail(catalogType)}
                            loading="eager"
                            className="card-image--contain"
                            onImageFailed={() => markImageFailed(index)}
                          />
                        )}
                      </button>
                      {showArtLabel ? (
                        <p className="draw-hand__missing-art" title={cardName}>
                          {cardName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SlideOutPanel>
  );
}
