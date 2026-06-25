import type { CSSProperties } from 'react';

export interface FoilVars {
  lusterAngle: number;
  facetRotate: number;
  warmHue: number;
  coolHue: number;
  hotspot1X: number;
  hotspot1Y: number;
  hotspot1Scale: number;
  hotspot2X: number;
  hotspot2Y: number;
  hotspot2Scale: number;
  hotspot3X: number;
  hotspot3Y: number;
  hotspot3Scale: number;
  sheenShift: number;
  introOrigin: number;
  introDuration: number;
}

/** Seeds that have already played their one-shot intro this page session. */
export const foilIntroPlayedKeys = new Set<string>();

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function deriveFoilVars(seed: string): FoilVars {
  const rng = mulberry32(hashString(seed));
  return {
    lusterAngle: range(rng, 0, 360),
    facetRotate: range(rng, 0, 360),
    warmHue: range(rng, 35, 55),
    coolHue: range(rng, 175, 220),
    hotspot1X: range(rng, 8, 72),
    hotspot1Y: range(rng, 8, 72),
    hotspot1Scale: range(rng, 0.35, 0.85),
    hotspot2X: range(rng, 20, 88),
    hotspot2Y: range(rng, 20, 88),
    hotspot2Scale: range(rng, 0.25, 0.7),
    hotspot3X: range(rng, 5, 90),
    hotspot3Y: range(rng, 5, 90),
    hotspot3Scale: range(rng, 0.2, 0.55),
    sheenShift: range(rng, 40, 60),
    introOrigin: Math.floor(rng() * 4),
    introDuration: range(rng, 0.5, 0.85),
  };
}

export function deriveFoilStyle(seed: string): CSSProperties {
  const v = deriveFoilVars(seed);
  return {
    '--foil-luster-angle': `${v.lusterAngle}deg`,
    '--foil-facet-rotate': `${v.facetRotate}deg`,
    '--foil-warm-hue': String(Math.round(v.warmHue)),
    '--foil-cool-hue': String(Math.round(v.coolHue)),
    '--foil-hotspot-1-x': `${v.hotspot1X.toFixed(1)}%`,
    '--foil-hotspot-1-y': `${v.hotspot1Y.toFixed(1)}%`,
    '--foil-hotspot-1-scale': v.hotspot1Scale.toFixed(3),
    '--foil-hotspot-2-x': `${v.hotspot2X.toFixed(1)}%`,
    '--foil-hotspot-2-y': `${v.hotspot2Y.toFixed(1)}%`,
    '--foil-hotspot-2-scale': v.hotspot2Scale.toFixed(3),
    '--foil-hotspot-3-x': `${v.hotspot3X.toFixed(1)}%`,
    '--foil-hotspot-3-y': `${v.hotspot3Y.toFixed(1)}%`,
    '--foil-hotspot-3-scale': v.hotspot3Scale.toFixed(3),
    '--foil-sheen-shift': `${v.sheenShift.toFixed(1)}%`,
    '--foil-intro-origin': String(v.introOrigin),
    '--foil-intro-duration': `${v.introDuration.toFixed(2)}s`,
  } as CSSProperties;
}

export function buildFoilSeed(cardId: string, instanceId?: string): string {
  return instanceId ? `${cardId}::${instanceId}` : cardId;
}

export function shouldShowFoilEffect(opts: {
  isFoilFlag?: boolean;
  cardId?: string;
  foilToBase?: Map<string, string>;
}): boolean {
  if (opts.isFoilFlag) return true;
  if (opts.cardId && opts.foilToBase?.has(opts.cardId)) return true;
  return false;
}

export function markFoilIntroPlayed(seed: string): void {
  foilIntroPlayedKeys.add(seed);
}

export function hasFoilIntroPlayed(seed: string): boolean {
  return foilIntroPlayedKeys.has(seed);
}

/** Stable fingerprint for tests — compares full derived var set. */
export function foilVarsFingerprint(seed: string): string {
  return JSON.stringify(deriveFoilVars(seed));
}
