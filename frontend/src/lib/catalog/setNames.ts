import type { SetInfo } from '../api/types';

/** Map uppercased set code → friendly display name. */
export function buildSetNameLookup(sets: SetInfo[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const { code, name } of sets) {
    lookup.set(code.trim().toUpperCase(), name || code);
  }
  return lookup;
}

export function resolveSetDisplayName(
  code: string | undefined | null,
  lookup: Map<string, string>,
): string | undefined {
  if (!code) return undefined;
  const key = String(code).trim().toUpperCase();
  return lookup.get(key) ?? String(code);
}
