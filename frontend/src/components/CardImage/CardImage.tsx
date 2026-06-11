import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { CatalogType } from '../../lib/api/types';
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
import { preloadAndRevealFullRes } from '../../lib/images/progressiveImageLoad';
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
}

function catalogTypeSupportsProgressiveThumb(type?: CatalogType): boolean {
  if (!type) return true;
  return isLandscapeCatalogType(type) || catalogTypeUsesPortraitThumb(type);
}

function useInView(rootMargin = '200px'): [RefObject<HTMLSpanElement | null>, boolean] {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
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
  }, []);

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
}: CardImageProps) {
  const useProgressive = progressive && canProgressiveLoad(imagePath);
  const progressiveThumb = catalogTypeSupportsProgressiveThumb(catalogType);

  if (useProgressive) {
    return (
      <ProgressiveCardImage
        key={imagePath ?? ''}
        imagePath={imagePath}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        progressiveThumb={progressiveThumb}
      />
    );
  }

  return (
    <SingleLayerCardImage
      imagePath={imagePath}
      alt={alt}
      useThumbnail={useThumbnail}
      className={className}
      style={style}
      loading={loading}
    />
  );
}

function SingleLayerCardImage({
  imagePath,
  alt,
  useThumbnail,
  className,
  style,
  loading,
}: {
  imagePath?: string | null;
  alt: string;
  useThumbnail: boolean;
  className: string;
  style?: CSSProperties;
  loading: 'lazy' | 'eager';
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const src = failed
    ? placeholderImageUrl()
    : useThumbnail
      ? resolveThumbUrl(imagePath)
      : resolveImageUrl(imagePath);

  return (
    <span className={`card-image ${loaded ? 'card-image--loaded' : 'card-image--loading'} ${className}`} style={style}>
      <img
        className="card-image__img"
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!failed) {
            setFailed(true);
            setLoaded(true);
          }
        }}
        draggable={false}
      />
    </span>
  );
}

function ProgressiveCardImage({
  imagePath,
  alt,
  className,
  style,
  loading,
  progressiveThumb,
}: {
  imagePath?: string | null;
  alt: string;
  className: string;
  style?: CSSProperties;
  loading: 'lazy' | 'eager';
  progressiveThumb: boolean;
}) {
  const [wrapperRef, inView] = useInView();
  const thumbRef = useRef<HTMLImageElement>(null);
  const fullImgRef = useRef<HTMLImageElement>(null);
  const [thumbLoaded, setThumbLoaded] = useState(!progressiveThumb);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);

  const thumbSrc = thumbFailed ? placeholderImageUrl() : resolveThumbUrl(imagePath);
  const fullSrc = resolveImageUrl(imagePath);

  const markThumbLoaded = () => setThumbLoaded(true);
  const showLoadedState = progressiveThumb ? thumbLoaded : fullLoaded;

  useLayoutEffect(() => {
    if (!progressiveThumb) return;
    if (syncImageLoaded(thumbRef.current)) {
      markThumbLoaded();
    }
  }, [thumbSrc, progressiveThumb]);

  const revealFullIfReady = (img: HTMLImageElement | null) => {
    if (!img || !imageElementMatchesUrl(img, fullSrc) || !syncImageLoaded(img)) return;
    img
      .decode()
      .then(() => setFullLoaded(true))
      .catch(() => setFullLoaded(true));
  };

  useEffect(() => {
    if (!inView) return undefined;

    const fullImg = fullImgRef.current;
    if (!fullImg) return undefined;

    if (imageElementMatchesUrl(fullImg, fullSrc) && syncImageLoaded(fullImg)) {
      revealFullIfReady(fullImg);
      return undefined;
    }

    if (fullLoaded) return undefined;

    const handle = preloadAndRevealFullRes(fullSrc, fullImg, () => setFullLoaded(true));
    return () => {
      handle.cancel();
      revealFullIfReady(fullImg);
    };
  }, [inView, fullSrc, fullLoaded, imagePath]);

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
