import type { DeckMetadata } from '../../lib/api/types';

export type LegalityBadgeVariant = 'limited' | 'not-legal';

export interface LegalityBadgeInfo {
  label: string;
  variant: LegalityBadgeVariant;
}

/** Single legality chip for deck tiles: Limited > Not Legal > none (legal implied). */
export function deckTileLegalityBadge(
  meta: Pick<DeckMetadata, 'is_valid' | 'is_limited'>,
): LegalityBadgeInfo | null {
  if (meta.is_limited) {
    return { label: 'Limited', variant: 'limited' };
  }
  if (!meta.is_valid) {
    return { label: 'Not Legal', variant: 'not-legal' };
  }
  return null;
}
