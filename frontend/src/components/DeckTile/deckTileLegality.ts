import type { DeckMetadata } from '../../lib/api/types';

export type LegalityBadgeVariant = 'legal' | 'limited' | 'not-legal';

export interface LegalityBadgeInfo {
  label: string;
  variant: LegalityBadgeVariant;
}

/**
 * Single source of truth for the legality chip on EVERY surface (deck tiles,
 * home/community rails, and the deck editor). Precedence: Limited > Not Legal >
 * Legal. The in-app "Limited" toggle always wins and suppresses legality.
 * Always returns a badge so legality is shown explicitly everywhere.
 */
export function deckLegalityBadge(
  meta: Pick<DeckMetadata, 'is_valid' | 'is_limited'>,
): LegalityBadgeInfo {
  if (meta.is_limited) {
    return { label: 'Limited', variant: 'limited' };
  }
  if (!meta.is_valid) {
    return { label: 'Not Legal', variant: 'not-legal' };
  }
  return { label: 'Legal', variant: 'legal' };
}

/**
 * Build a legality badge from an explicit validity result (e.g. the deck editor's
 * live `POST /decks/validate`) while still honoring the Limited toggle. Keeps the
 * editor badge identical to tile badges for the same deck.
 */
export function deckLegalityBadgeFromValidity(
  isLimited: boolean | undefined,
  isValid: boolean,
): LegalityBadgeInfo {
  return deckLegalityBadge(
    isLimited ? { is_limited: true, is_valid: isValid } : { is_valid: isValid },
  );
}

/** Map a legality variant to its global badge color class (shared by all surfaces). */
export function legalityBadgeClass(variant: LegalityBadgeVariant): string {
  if (variant === 'legal') return 'badge-legal';
  if (variant === 'limited') return 'badge-limited';
  return 'badge-not-legal';
}

export type VisibilityBadgeVariant = 'private' | 'public';

export interface VisibilityBadgeInfo {
  label: string;
  variant: VisibilityBadgeVariant;
}

/** Public/Unlisted chip (independent of legality). Defaults to unlisted when unknown. */
export function deckTileVisibilityBadge(
  meta: Pick<DeckMetadata, 'is_private'>,
): VisibilityBadgeInfo {
  return (meta.is_private ?? true)
    ? { label: 'Unlisted', variant: 'private' }
    : { label: 'Public', variant: 'public' };
}
