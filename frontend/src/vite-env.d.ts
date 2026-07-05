/// <reference types="vite/client" />

declare module '*.json' {
  const value: unknown;
  export default value;
}

interface Window {
  LAYOUT_MOBILE_MAX_PX?: number;
  isLayoutMobile?: () => boolean;
  applyLayoutMode?: () => boolean;
  setPreferDesktopLayout?: (on: boolean) => void;
}
