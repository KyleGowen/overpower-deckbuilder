/** Advance index by delta with wrap-around (cyclical). */
export function stepCyclicalIndex(current: number, length: number, delta: 1 | -1): number {
  if (length <= 0) return 0;
  return (current + delta + length) % length;
}

/** Keep active mobile deck type tab valid when deck types change. */
export function resolveMobileDeckTypeTab<T extends string>(
  prev: T | null,
  types: readonly T[],
): T | null {
  if (types.length === 0) return null;
  if (prev && types.includes(prev)) return prev;
  return types[0];
}
