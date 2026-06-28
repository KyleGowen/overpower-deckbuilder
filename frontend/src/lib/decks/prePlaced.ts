import type { DeckCardEntry } from '../api/types';
import { cardDisplayName } from '../catalog/catalogTypeMap';
import { isOnePerDeckCatalogCard } from './deckCardControls';
import { resolveDeckCatalogCard, type DeckCardIndex } from './deckCardCatalog';

/**
 * "Pre-Placed" lets a playable card start the game already placed (under a
 * location or with a character) instead of in the random draw pile. It is
 * stored as `exclude_from_draw` on the deck card; Draw Hand skips those rows
 * while they still count toward deck size and the ≥8 playable threshold.
 *
 * Eligibility is client-only (the backend stores the flag without validating
 * which card types may set it) and mirrors the legacy v1 rules in
 * `public/js/game-logic.js`:
 *   - Training card        → deck contains the "Spartan Training Ground" location
 *   - Basic Universe card  → deck contains the "Dracula's Armory" location
 *   - "Sword and Shield"   → deck contains the character "Lancelot"
 */

const SPARTAN_TRAINING_GROUND = 'Spartan Training Ground';
const DRACULAS_ARMORY = "Dracula's Armory";
const LANCELOT = 'Lancelot';
const SWORD_AND_SHIELD = 'Sword and Shield';

export interface PrePlacedFlags {
  /** Deck contains the Spartan Training Ground location (enables Training pre-place). */
  spartanTrainingGround: boolean;
  /** Deck contains Dracula's Armory location (enables Basic Universe pre-place). */
  draculasArmory: boolean;
  /** Deck contains the character Lancelot (enables Sword and Shield pre-place). */
  lancelot: boolean;
}

function entryCatalogName(entry: DeckCardEntry, cardIndex: DeckCardIndex): string {
  if (entry.name?.trim()) return entry.name.trim();
  const catalogCard = resolveDeckCatalogCard(entry, cardIndex);
  return catalogCard ? cardDisplayName(catalogCard) : '';
}

function deckHasNamedCard(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
  deckType: DeckCardEntry['type'],
  name: string,
): boolean {
  return cards.some(
    (entry) => entry.type === deckType && entryCatalogName(entry, cardIndex) === name,
  );
}

export function hasSpartanTrainingGround(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
): boolean {
  return deckHasNamedCard(cards, cardIndex, 'location', SPARTAN_TRAINING_GROUND);
}

export function hasDraculasArmory(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return deckHasNamedCard(cards, cardIndex, 'location', DRACULAS_ARMORY);
}

export function hasLancelot(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return cards.some((entry) => {
    if (entry.type !== 'character') return false;
    if (entryCatalogName(entry, cardIndex) === LANCELOT) return true;
    return entry.cardId.toLowerCase().includes('lancelot');
  });
}

/** True when the special card entry is "Sword and Shield" (name or legacy id). */
export function isSwordAndShield(entry: DeckCardEntry, cardIndex: DeckCardIndex): boolean {
  if (entryCatalogName(entry, cardIndex) === SWORD_AND_SHIELD) return true;
  const id = entry.cardId.toLowerCase();
  return id.includes('sword_and_shield') || id.includes('sword-and-shield');
}

/** Compute deck-level pre-placed enablers once per render (avoids O(n²) scans). */
export function computePrePlacedFlags(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
): PrePlacedFlags {
  return {
    spartanTrainingGround: hasSpartanTrainingGround(cards, cardIndex),
    draculasArmory: hasDraculasArmory(cards, cardIndex),
    lancelot: hasLancelot(cards, cardIndex),
  };
}

/** One-per-deck cards cannot be pre-placed to a location (e.g. Sekhmet). */
function isOnePerDeckEntry(entry: DeckCardEntry, cardIndex: DeckCardIndex): boolean {
  return isOnePerDeckCatalogCard(resolveDeckCatalogCard(entry, cardIndex));
}

/** Whether a specific deck card may be toggled Pre-Placed, given deck flags. */
export function isPrePlacedEligible(
  entry: DeckCardEntry,
  flags: PrePlacedFlags,
  cardIndex: DeckCardIndex,
): boolean {
  if (entry.type === 'training') {
    return flags.spartanTrainingGround && !isOnePerDeckEntry(entry, cardIndex);
  }
  if (entry.type === 'basic-universe') {
    return flags.draculasArmory && !isOnePerDeckEntry(entry, cardIndex);
  }
  if (entry.type === 'special') {
    return flags.lancelot && isSwordAndShield(entry, cardIndex);
  }
  return false;
}

/** Whether a card is currently marked Pre-Placed (excluded from Draw Hand). */
export function isPrePlaced(entry: DeckCardEntry): boolean {
  return entry.exclude_from_draw === true;
}

/**
 * Clear `exclude_from_draw` on any card that is no longer eligible to be
 * pre-placed (e.g. after the enabling location/character was removed). Returns
 * the same array reference when nothing changed so callers can skip re-renders.
 */
export function reconcilePrePlaced(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
): DeckCardEntry[] {
  const flags = computePrePlacedFlags(cards, cardIndex);
  let changed = false;
  const next = cards.map((c) => {
    if (c.exclude_from_draw === true && !isPrePlacedEligible(c, flags, cardIndex)) {
      changed = true;
      return { ...c, exclude_from_draw: false };
    }
    return c;
  });
  return changed ? next : cards;
}
