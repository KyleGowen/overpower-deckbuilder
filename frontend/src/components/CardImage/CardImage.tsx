import { useState, type CSSProperties } from 'react';
import { resolveImageUrl, resolveThumbUrl, placeholderImageUrl } from '../../lib/images/cardImages';
import './CardImage.css';

interface CardImageProps {
  /** Raw card path (card.image_path / card.image). */
  imagePath?: string | null;
  alt: string;
  /** Use the thumbnail variant (lists, tiles, ribbons). Default true. */
  useThumbnail?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Native loading hint; defaults to lazy for perf. */
  loading?: 'lazy' | 'eager';
}

export function CardImage({
  imagePath,
  alt,
  useThumbnail = true,
  className = '',
  style,
  loading = 'lazy',
}: CardImageProps) {
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
