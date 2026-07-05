/**
 * Maps Excel / informal tournament decklist names to canonical catalog `name` values.
 * Keys are trimmed; lookup is case-sensitive after trim.
 */
export const TOURNAMENT_NAME_ALIASES: Record<string, string> = {
  'Morgan Le Fay': 'Morgan le Fay',
  'Morgan la Fey': 'Morgan le Fay',
  'Asclepion': 'Asclepieion',
  'Sherlock': 'Sherlock Holmes',
  'Angry Mob: Middle Age': 'Angry Mob (Middle Ages)',
  'Angry Mob: Middle Ages': 'Angry Mob (Middle Ages)',
  'Angry Mob: Modern Age': 'Angry Mob (Modern Age)',
  'Angry Mob: Industrial Age': 'Angry Mob (Industrial Age)',
  'Mina': 'Mina Harker',
  'The Count of Monte Cristo': 'Count of Monte Cristo',
  'Three Muskateers': 'The Three Musketeers',
  'Three Musketeers': 'The Three Musketeers',
  'Round Table': 'The Round Table',
  'Land that Time Forgot': 'The Land That Time Forgot',
  'The land time forgot': 'The Land That Time Forgot',
  'The Land that Time Forgot': 'The Land That Time Forgot',
  '221-B Baker St': '221-B Baker St.',
  'Dejah Thorus': 'Dejah Thoris',
};

/** Catalog type for a canonical name when not inferable from slot context. */
export function catalogTypeForCanonicalName(
  _canonicalName: string,
  slot: 'character' | 'reserve' | 'homebase' | 'cataclysm',
): 'characters' | 'locations' | 'special-cards' {
  if (slot === 'homebase') return 'locations';
  if (slot === 'cataclysm') return 'special-cards';
  return 'characters';
}

export function normalizeTournamentName(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return TOURNAMENT_NAME_ALIASES[trimmed] ?? trimmed;
}
