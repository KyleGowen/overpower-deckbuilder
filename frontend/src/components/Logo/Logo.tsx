import { assetUrl } from '../../lib/images/cardImages';
import './Logo.css';

const LOGO_PATH = '/src/resources/images/logo/logo5.png';

interface LogoProps {
  className?: string;
  /** Rendered height in px (width auto). */
  height?: number;
  alt?: string;
}

/** The Excelsior wordmark logo (existing repo asset, served via CDN in prod). */
export function Logo({ className = '', height = 34, alt = 'Excelsior' }: LogoProps) {
  return (
    <img
      className={`app-logo ${className}`}
      src={assetUrl(LOGO_PATH)}
      alt={alt}
      height={height}
      style={{ height }}
      draggable={false}
    />
  );
}
