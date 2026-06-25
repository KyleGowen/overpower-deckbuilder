import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import type { CatalogType } from '../../lib/api/types';
import { FoilCard, type FoilCardSize } from '../FoilCard';
import {
  catalogTypeUsesPortraitThumb,
  isLandscapeCatalogType,
} from '../../lib/catalog/catalogTypeMap';
import {
  canProgressiveLoad,
  imageElementMatchesUrl,
  resolveImageUrl,
  resolveThumbUrl,
  placeholderImageUrl,
} from '../../lib/images/cardImages';
import {
  isFullResRevealed,
  preloadAndRevealFullRes,
  shouldSkipFullResUpgrade,
  type ProgressiveImageSessionScope,
} from '../../lib/images/progressiveImageLoad';
import './CardImage.css';

interface CardImageProps {
  /** Raw card path (card.image_path / card.image). */
  imagePath?: string | null;
  alt: string;
  /** Use the thumbnail variant (lists, tiles, ribbons). Default true. */
  useThumbnail?: boolean;
  /**
   * Thumbnail-first, then fade in full-res on a second layer (database grid).
   * Falls back to single-layer when thumb and full paths are identical.
   */
  progressive?: boolean;
  /** Database grid catalog tab — gates portrait vs landscape progressive thumb. */
  catalogType?: CatalogType;
  className?: string;
  style?: CSSProperties;
  /** Native loading hint; defaults to lazy for perf. */
  loading?: 'lazy' | 'eager';
  /** Fired when thumb + full-res both fail (single-layer mode only). */
  onImageFailed?: () => void;
  /** Session cache scope for progressive full-res reveal (e.g. deck editor tab switches). */
  progressiveSessionScope?: ProgressiveImageSessionScope;
  /** When true, wraps the image in the v2 Prismatic Laminate foil overlay. */
  isFoil?: boolean;
  /** Seed for per-card foil uniqueness; defaults to imagePath. */
  foilSeed?: string;
  foilSize?: FoilCardSize;
  /** Start foil intro on mount (detail hero) instead of waiting for intersection. */
  foilEagerIntro?: boolean;
}

function wrapWithFoil(
  node: ReactNode,
  opts: {
    isFoil?: boolean;
    foilSeed?: string;
    imagePath?: string | null;
    foilSize?: FoilCardSize;
    foilEagerIntro?: boolean;
  },
): ReactNode {
  if (!opts.isFoil) return node;
  const seed = opts.foilSeed ?? opts.imagePath ?? 'foil-default';
  return (
    <FoilCard seed={seed} size={opts.foilSize ?? 'thumb'} eagerIntro={opts.foilEagerIntro}>
      {node}
    </FoilCard>
  );
}

function catalogTypeSupportsProgressiveThumb(type?: CatalogType): boolean {
  if (!type) return true;
  return isLandscapeCatalogType(type) || catalogTypeUsesPortraitThumb(type);
}

function useInView(rootMargin = '200px', eager = false): [RefObject<HTMLSpanElement | null>, boolean] {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(eager);

  useEffect(() => {
    if (eager) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return [ref, inView];
}

function syncImageLoaded(img: HTMLImageElement | null): boolean {
  return Boolean(img?.complete && img.naturalWidth > 0);
}

export function CardImage({
  imagePath,
  alt,
  useThumbnail = true,
  progressive = false,
  catalogType,
  className = '',
  style,
  loading = 'lazy',
  onImageFailed,
  progressiveSessionScope = 'database',
  isFoil,
  foilSeed,
  foilSize,
  foilEagerIntro,
}: CardImageProps) {
  const useProgressive =
    progressive && canProgressiveLoad(imagePath, catalogType) && !shouldSkipFullResUpgrade();
  const progressiveThumb = catalogTypeSupportsProgressiveThumb(catalogType);
  const foilWrap = (node: ReactNode) =>
    wrapWithFoil(node, { isFoil, foilSeed, imagePath, foilSize, foilEagerIntro });

  if (useProgressive) {
    return foilWrap(
      <ProgressiveCardImage
        key={`${imagePath ?? ''}|${catalogType ?? ''}`}
        imagePath={imagePath}
        catalogType={catalogType}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        progressiveThumb={progressiveThumb}
        progressiveSessionScope={progressiveSessionScope}
      />,
    );
  }

  return foilWrap(
    <SingleLayerCardImage
      key={`${imagePath ?? ''}|${catalogType ?? ''}`}
      imagePath={imagePath}
      catalogType={catalogType}
      alt={alt}
      useThumbnail={useThumbnail}
      className={className}
      style={style}
      loading={loading}
      onImageFailed={onImageFailed}
    />,
  );
}

function SingleLayerCardImage({
  imagePath,
  catalogType,
  alt,
  useThumbnail,
  className,
  style,
  loading,
  onImageFailed,
}: {
  imagePath?: string | null;
  catalogType?: CatalogType;
  alt: string;
  useThumbnail: boolean;
  className: string;
  style?: CSSProperties;
  loading: 'lazy' | 'eager';
  onImageFailed?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  const useFullRes = !useThumbnail || thumbFailed;
  const src = failed
    ? placeholderImageUrl()
    : useFullRes
      ? resolveImageUrl(imagePath, catalogType)
      : resolveThumbUrl(imagePath, catalogType);

  useLayoutEffect(() => {
    setFailed(false);
    setThumbFailed(false);
    setLoaded(syncImageLoaded(imgRef.current));
  }, [imagePath, catalogType, useThumbnail]);

  // Thumb→full fallback changes src without resetting thumbFailed; still sync cache hits.
  useLayoutEffect(() => {
    if (syncImageLoaded(imgRef.current)) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <span className={`card-image ${loaded ? 'card-image--loaded' : 'card-image--loading'} ${className}`} style={style}>
      <img
        ref={imgRef}
        className="card-image__img"
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (useThumbnail && !thumbFailed) {
            setThumbFailed(true);
            setLoaded(false);
            return;
          }
          if (!failed) {
            setFailed(true);
            setLoaded(true);
            onImageFailed?.();
          }
        }}
        draggable={false}
      />
    </span>
  );
}

function ProgressiveCardImage({
  imagePath,
  catalogType,
  alt,
  className,
  style,
  loading,
  progressiveThumb,
  progressiveSessionScope,
}: {
  imagePath?: string | null;
  catalogType?: CatalogType;
  alt: string;
  className: string;
  style?: CSSProperties;
  loading: 'lazy' | 'eager';
  progressiveThumb: boolean;
  progressiveSessionScope: ProgressiveImageSessionScope;
}) {
  const [wrapperRef, inView] = useInView('200px', loading === 'eager');
  const thumbRef = useRef<HTMLImageElement>(null);
  const fullImgRef = useRef<HTMLImageElement>(null);
  const [thumbLoaded, setThumbLoaded] = useState(!progressiveThumb);
  const [thumbFailed, setThumbFailed] = useState(false);
  const fullSrc = resolveImageUrl(imagePath, catalogType);
  const [fullLoaded, setFullLoaded] = useState(() =>
    isFullResRevealed(fullSrc, progressiveSessionScope),
  );

  const thumbSrc = thumbFailed ? placeholderImageUrl() : resolveThumbUrl(imagePath, catalogType);

  const markThumbLoaded = () => setThumbLoaded(true);
  const showLoadedState = progressiveThumb ? thumbLoaded || fullLoaded : fullLoaded;

  useLayoutEffect(() => {
    if (!progressiveThumb) return;
    if (syncImageLoaded(thumbRef.current)) {
      markThumbLoaded();
    }
  }, [thumbSrc, progressiveThumb]);

  useLayoutEffect(() => {
    if (!isFullResRevealed(fullSrc, progressiveSessionScope)) return;
    const fullImg = fullImgRef.current;
    if (!fullImg) return;

    if (!imageElementMatchesUrl(fullImg, fullSrc)) {
      fullImg.src = fullSrc;
    }
    if (syncImageLoaded(fullImg)) {
      setFullLoaded(true);
      return;
    }
    fullImg
      .decode()
      .then(() => setFullLoaded(true))
      .catch(() => setFullLoaded(true));
  }, [fullSrc, progressiveSessionScope]);

  const revealFullIfReady = (img: HTMLImageElement | null) => {
    if (!img || !imageElementMatchesUrl(img, fullSrc) || !syncImageLoaded(img)) return;
    img
      .decode()
      .then(() => setFullLoaded(true))
      .catch(() => setFullLoaded(true));
  };

  useEffect(() => {
    if (fullLoaded || isFullResRevealed(fullSrc, progressiveSessionScope)) return undefined;
    if (!inView) return undefined;

    const fullImg = fullImgRef.current;
    if (!fullImg) return undefined;

    if (imageElementMatchesUrl(fullImg, fullSrc) && syncImageLoaded(fullImg)) {
      revealFullIfReady(fullImg);
      return undefined;
    }

    const handle = preloadAndRevealFullRes(fullSrc, fullImg, () => setFullLoaded(true), {
      scope: progressiveSessionScope,
    });
    return () => {
      handle.cancel();
      revealFullIfReady(fullImg);
    };
  }, [inView, fullSrc, fullLoaded, imagePath, progressiveSessionScope]);

  return (
    <span
      ref={wrapperRef}
      className={`card-image card-image--progressive ${showLoadedState ? 'card-image--loaded' : 'card-image--loading'} ${className}`}
      style={style}
    >
      {progressiveThumb ? (
        <img
          ref={thumbRef}
          className="card-image__img card-image__img--thumb"
          src={thumbSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={markThumbLoaded}
          onError={() => {
            if (!thumbFailed) {
              setThumbFailed(true);
              markThumbLoaded();
            }
          }}
          draggable={false}
        />
      ) : null}
      <img
        ref={fullImgRef}
        className={`card-image__img card-image__img--full ${fullLoaded ? 'card-image__full--loaded' : ''}`}
        alt={progressiveThumb ? '' : alt}
        aria-hidden={progressiveThumb || undefined}
        draggable={false}
      />
    </span>
  );
}
