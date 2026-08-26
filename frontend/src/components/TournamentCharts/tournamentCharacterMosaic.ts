export function getTournamentCharacterMosaicColumns(entryCount: number): number {
  if (entryCount <= 1) return 1;
  return entryCount > 8 ? 3 : 2;
}
