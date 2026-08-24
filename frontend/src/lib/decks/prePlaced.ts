import type { DeckCardEntry } from '../api/types';
import { cardDisplayName } from '../catalog/catalogTypeMap';
import { isOnePerDeckCatalogCard } from './deckCardControls';
import { resolveDeckCatalogCard, type DeckCardIndex } from './deckCardCatalog';

/**
 * "Pre-Placed" lets a playable card start the game already placed (under a
 * location or with a character) instead of in the random draw pile. It is
 * stored as `exclude_from_draw` on the deck card; Draw Hand skips those rows.
 * They do not count toward the Cards in Deck metric, but still count toward
 * the ≥8-card Draw Hand eligibility threshold.
 *
 * Eligibility is client-only (the backend stores the flag without validating
 * which card types may set it):
 *   - Training card        → deck contains Spartan Training Ground or Teen Team Headquarters
 *   - Basic Universe card  → deck contains Dracula's Armory or The Sanctuary
 *   - Named start-in-play Special → deck contains its enabling character
 */

const SPARTAN_TRAINING_GROUND = 'Spartan Training Ground';
const TEEN_TEAM_HEADQUARTERS = 'Teen Team Headquarters';
const DRACULAS_ARMORY = "Dracula's Armory";
const THE_SANCTUARY = 'The Sanctuary';
const LANCELOT = 'Lancelot';
const IMMORTAL_NAMES = ['Immortal', 'The Immortal'];
const MAULER_TWINS_NAMES = ['Mauler Twins', 'The Mauler Twins'];
const EZEKIEL = 'Ezekiel';
const SWORD_AND_SHIELD = 'Sword and Shield';
const I_AM_IMMORTAL = 'I am Immortal';
const MY_BROTHER = 'My Brother';
const SHIVA = 'Shiva';

export interface PrePlacedFlags {
  /** Deck contains the Spartan Training Ground location (enables Training pre-place). */
  spartanTrainingGround: boolean;
  /** Deck contains Teen Team Headquarters (also enables Training pre-place). */
  teenTeamHeadquarters: boolean;
  /** Deck contains Dracula's Armory location (enables Basic Universe pre-place). */
  draculasArmory: boolean;
  /** Deck contains The Sanctuary (also enables Basic Universe pre-place). */
  sanctuary: boolean;
  /** Deck contains the character Lancelot (enables Sword and Shield pre-place). */
  lancelot: boolean;
  /** Deck contains Immortal / The Immortal (enables I am Immortal pre-place). */
  immortal: boolean;
  /** Deck contains Mauler Twins / The Mauler Twins (enables My Brother pre-place). */
  maulerTwins: boolean;
  /** Deck contains Ezekiel (enables Shiva pre-place). */
  ezekiel: boolean;
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

export function hasTeenTeamHeadquarters(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
): boolean {
  return deckHasNamedCard(cards, cardIndex, 'location', TEEN_TEAM_HEADQUARTERS);
}

export function hasDraculasArmory(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return deckHasNamedCard(cards, cardIndex, 'location', DRACULAS_ARMORY);
}

export function hasSanctuary(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return deckHasNamedCard(cards, cardIndex, 'location', THE_SANCTUARY);
}

function normalizedCardName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function hasNamedCharacter(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
  names: string[],
): boolean {
  const normalizedNames = new Set(names.map(normalizedCardName));
  return cards.some((entry) => {
    if (entry.type !== 'character') return false;
    if (normalizedNames.has(normalizedCardName(entryCatalogName(entry, cardIndex)))) return true;
    const normalizedId = normalizedCardName(entry.cardId);
    return [...normalizedNames].some((name) => normalizedId.includes(name));
  });
}

export function hasLancelot(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return hasNamedCharacter(cards, cardIndex, [LANCELOT]);
}

export function hasImmortal(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return hasNamedCharacter(cards, cardIndex, IMMORTAL_NAMES);
}

export function hasMaulerTwins(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return hasNamedCharacter(cards, cardIndex, MAULER_TWINS_NAMES);
}

export function hasEzekiel(cards: DeckCardEntry[], cardIndex: DeckCardIndex): boolean {
  return hasNamedCharacter(cards, cardIndex, [EZEKIEL]);
}

/** True when the special card entry is "Sword and Shield" (name or legacy id). */
export function isSwordAndShield(entry: DeckCardEntry, cardIndex: DeckCardIndex): boolean {
  if (entryCatalogName(entry, cardIndex) === SWORD_AND_SHIELD) return true;
  const id = entry.cardId.toLowerCase();
  return id.includes('sword_and_shield') || id.includes('sword-and-shield');
}

function isNamedSpecial(
  entry: DeckCardEntry,
  cardIndex: DeckCardIndex,
  name: string,
): boolean {
  const normalizedName = normalizedCardName(name);
  if (normalizedCardName(entryCatalogName(entry, cardIndex)) === normalizedName) return true;
  return normalizedCardName(entry.cardId).includes(normalizedName);
}

/** Compute deck-level pre-placed enablers once per render (avoids O(n²) scans). */
export function computePrePlacedFlags(
  cards: DeckCardEntry[],
  cardIndex: DeckCardIndex,
): PrePlacedFlags {
  return {
    spartanTrainingGround: hasSpartanTrainingGround(cards, cardIndex),
    teenTeamHeadquarters: hasTeenTeamHeadquarters(cards, cardIndex),
    draculasArmory: hasDraculasArmory(cards, cardIndex),
    sanctuary: hasSanctuary(cards, cardIndex),
    lancelot: hasLancelot(cards, cardIndex),
    immortal: hasImmortal(cards, cardIndex),
    maulerTwins: hasMaulerTwins(cards, cardIndex),
    ezekiel: hasEzekiel(cards, cardIndex),
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
    return (
      (flags.spartanTrainingGround || flags.teenTeamHeadquarters)
      && !isOnePerDeckEntry(entry, cardIndex)
    );
  }
  if (entry.type === 'basic-universe') {
    return (flags.draculasArmory || flags.sanctuary) && !isOnePerDeckEntry(entry, cardIndex);
  }
  if (entry.type === 'special') {
    return (
      (flags.lancelot && isSwordAndShield(entry, cardIndex))
      || (flags.immortal && isNamedSpecial(entry, cardIndex, I_AM_IMMORTAL))
      || (flags.maulerTwins && isNamedSpecial(entry, cardIndex, MY_BROTHER))
      || (flags.ezekiel && isNamedSpecial(entry, cardIndex, SHIVA))
    );
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
