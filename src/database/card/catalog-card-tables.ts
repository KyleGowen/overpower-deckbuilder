/**
 * Single map from logical card type (underscore keys, matching collection code) to PostgreSQL table names.
 * Deck APIs use hyphenated variants (e.g. advanced-universe); use resolveCatalogTable.
 */
export const CATALOG_CARD_TABLE: Record<string, string> = {
  character: 'characters',
  special: 'special_cards',
  power: 'power_cards',
  location: 'locations',
  battleground: 'battlegrounds',
  mission: 'missions',
  event: 'events',
  aspect: 'aspects',
  advanced_universe: 'advanced_universe_cards',
  teamwork: 'teamwork_cards',
  ally_universe: 'ally_universe_cards',
  training: 'training_cards',
  basic_universe: 'basic_universe_cards'
};

export function resolveCatalogTable(cardType: string): string | undefined {
  const key = cardType.replace(/-/g, '_');
  return CATALOG_CARD_TABLE[key];
}

/** Tables where deck validation uses try/catch around uuid/text id matching. */
export function catalogTableUsesIdTextFallback(table: string): boolean {
  return table === 'characters' || table === 'special_cards' || table === 'power_cards';
}
