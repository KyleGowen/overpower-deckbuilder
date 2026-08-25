const COLLECTION_CARD_TYPES = new Set([
  'character',
  'special',
  'power',
  'location',
  'battleground',
  'mission',
  'event',
  'aspect',
  'advanced_universe',
  'teamwork',
  'ally_universe',
  'training',
  'basic_universe',
]);

export function isValidCollectionCardType(value: unknown): value is string {
  return typeof value === 'string' && COLLECTION_CARD_TYPES.has(value);
}
