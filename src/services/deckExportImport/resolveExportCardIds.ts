import type { DeckCatalogBundle } from '../deck-validation/build-available-cards-map';
import { buildAvailableCardsMap } from '../deck-validation/build-available-cards-map';
import type { ExportCardEntry, ResolveExportCardsResult, ResolvedDeckCard } from './types';

type CardMap = Map<string, Record<string, unknown>>;

function cardTypeOf(card: Record<string, unknown>): string | null {
  const t = card.type ?? card.card_type ?? card.cardType;
  return typeof t === 'string' ? t : null;
}

function cardNameOf(card: Record<string, unknown>): string | null {
  const n = card.name ?? card.card_name ?? card.to_use;
  return typeof n === 'string' ? n : null;
}

function normalizeType(type: string): string {
  return type.replace('-universe', '').replace('_universe', '');
}

function findTeamworkCardId(
  map: CardMap,
  cardName: string,
  followupTypes?: string
): string | null {
  for (const card of map.values()) {
    if (cardTypeOf(card) !== 'teamwork') continue;
    const name = cardNameOf(card);
    if (name !== cardName) continue;
    const cardFollowup = card.followup_attack_types ?? card.follow_up_attack_types;
    if (followupTypes) {
      if (
        typeof cardFollowup === 'string' &&
        cardFollowup.trim() === followupTypes.trim()
      ) {
        return String(card.id);
      }
    } else if (!cardFollowup || (typeof cardFollowup === 'string' && !cardFollowup.trim())) {
      return String(card.id);
    }
  }
  return null;
}

function findAllyCardId(
  map: CardMap,
  cardName: string,
  statToUse?: string | null,
  statTypeToUse?: string | null
): string | null {
  const norm = (v: string | null | undefined) =>
    v === null || v === undefined ? null : String(v).trim();
  for (const card of map.values()) {
    const t = cardTypeOf(card);
    if (t !== 'ally-universe' && t !== 'ally_universe') continue;
    if (cardNameOf(card) !== cardName) continue;
    const cStat = norm(card.stat_to_use as string | null);
    const cType = norm(card.stat_type_to_use as string | null);
    const sStat = norm(statToUse);
    const sType = norm(statTypeToUse);
    if (sStat !== null && sType !== null) {
      if (cStat === sStat && cType === sType) return String(card.id);
    } else if (sType !== null) {
      if (cType === sType) return String(card.id);
    } else if (sStat !== null) {
      if (cStat === sStat) return String(card.id);
    } else if (!cStat && !cType) {
      return String(card.id);
    }
  }
  return null;
}

function findTrainingCardId(
  map: CardMap,
  cardName: string,
  type1?: string | null,
  type2?: string | null,
  bonus?: string | null
): string | null {
  const norm = (v: string | null | undefined) =>
    !v || typeof v !== 'string' ? null : v.trim();
  for (const card of map.values()) {
    if (cardTypeOf(card) !== 'training') continue;
    if (cardNameOf(card) !== cardName) continue;
    const c1 = norm(card.type_1 as string | null);
    const c2 = norm(card.type_2 as string | null);
    const cb = norm(card.bonus as string | null);
    const s1 = norm(type1);
    const s2 = norm(type2);
    const sb = norm(bonus);
    const fields = [s1, s2, sb].filter((f) => f !== null);
    if (fields.length === 0) {
      if (!c1 && !c2 && !cb) return String(card.id);
      continue;
    }
    if (s1 !== null && c1 !== s1) continue;
    if (s2 !== null && c2 !== s2) continue;
    if (sb !== null && cb !== sb) continue;
    return String(card.id);
  }
  return null;
}

function findBasicUniverseCardId(
  map: CardMap,
  cardName: string,
  typeField?: string | null,
  valueToUse?: string | null,
  bonus?: string | null
): string | null {
  const norm = (v: string | null | undefined) =>
    !v || typeof v !== 'string' ? null : v.trim();
  for (const card of map.values()) {
    const t = cardTypeOf(card);
    if (t !== 'basic-universe' && t !== 'basic_universe') continue;
    if (cardNameOf(card) !== cardName) continue;
    const ct = norm(card.type as string | null);
    const cv = norm(card.value_to_use as string | null);
    const cb = norm(card.bonus as string | null);
    const st = norm(typeField);
    const sv = norm(valueToUse);
    const sb = norm(bonus);
    if (st !== null && ct !== st) continue;
    if (sv !== null && cv !== sv) continue;
    if (sb !== null && cb !== sb) continue;
    if (st === null && sv === null && sb === null) {
      return String(card.id);
    }
    if (st !== null || sv !== null || sb !== null) {
      return String(card.id);
    }
  }
  return null;
}

function findPowerCardId(map: CardMap, cardName: string): string | null {
  const powerMatch = cardName.match(/^(\d+)\s*-\s*(.+)$/);
  if (!powerMatch) return null;
  const value = parseInt(powerMatch[1], 10);
  const powerType = powerMatch[2].trim();
  for (const card of map.values()) {
    if (
      card.value === value &&
      typeof card.power_type === 'string' &&
      card.power_type.trim() === powerType
    ) {
      return String(card.id);
    }
  }
  return null;
}

function findCardIdByName(map: CardMap, cardName: string, cardType: string): string | null {
  if (cardType === 'teamwork') {
    return findTeamworkCardId(map, cardName);
  }
  if (cardType === 'power') {
    return findPowerCardId(map, cardName);
  }
  const requested = normalizeType(cardType);
  for (const card of map.values()) {
    const name = cardNameOf(card);
    if (name !== cardName) continue;
    const t = cardTypeOf(card);
    if (!t) continue;
    if (normalizeType(t) !== requested) continue;
    return String(card.id);
  }
  return null;
}

function resolveEntry(map: CardMap, entry: ExportCardEntry): string | null {
  switch (entry.type) {
    case 'teamwork':
      return findTeamworkCardId(map, entry.name, entry.followup_attack_types);
    case 'ally-universe':
      return findAllyCardId(map, entry.name, entry.stat_to_use, entry.stat_type_to_use);
    case 'training':
      return findTrainingCardId(map, entry.name, entry.type_1, entry.type_2, entry.bonus);
    case 'basic-universe':
      return findBasicUniverseCardId(
        map,
        entry.name,
        entry.type_field,
        entry.value_to_use,
        entry.bonus
      );
    default:
      return findCardIdByName(map, entry.name, entry.type);
  }
}

export function resolveExportCardIds(
  bundle: DeckCatalogBundle,
  entries: ExportCardEntry[]
): ResolveExportCardsResult {
  const map = buildAvailableCardsMap(bundle);
  const quantityMap = new Map<string, ResolvedDeckCard>();
  const unresolved: ExportCardEntry[] = [];

  for (const entry of entries) {
    const cardId = resolveEntry(map, entry);
    if (!cardId) {
      unresolved.push(entry);
      continue;
    }
    const key = `${entry.type}:${cardId}`;
    const existing = quantityMap.get(key);
    if (existing) {
      existing.quantity += 1;
    } else {
      quantityMap.set(key, { cardType: entry.type, cardId, quantity: 1 });
    }
  }

  return { resolved: Array.from(quantityMap.values()), unresolved };
}
