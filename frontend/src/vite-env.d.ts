/// <reference types="vite/client" />

interface Window {
  LAYOUT_MOBILE_MAX_PX?: number;
  isLayoutMobile?: () => boolean;
  applyLayoutMode?: () => boolean;
  setPreferDesktopLayout?: (on: boolean) => void;
}
