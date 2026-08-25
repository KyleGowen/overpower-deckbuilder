import type { CatalogType } from '../../lib/api/types';

/** Location/Battleground/event thumbs bake contain letterbox incompatible with cover framing. */
export function deckEditorUsesThumbnail(catalogType?: CatalogType): boolean {
  return catalogType !== 'locations' && catalogType !== 'battlegrounds' && catalogType !== 'events';
}

/** Shared CardImage loading props for deck grid tiles and Draw Hand (events excepted). */
export function deckEditorCardImageLoadingProps(catalogType?: CatalogType): {
  useThumbnail: boolean;
  progressive: boolean;
  progressiveSessionScope: 'deck-editor';
  loading: 'eager';
  className: string;
} {
  const useThumbnail = deckEditorUsesThumbnail(catalogType);
  return {
    useThumbnail,
    progressive: useThumbnail,
    progressiveSessionScope: 'deck-editor',
    loading: 'eager',
    className: 'card-image--contain',
  };
}
