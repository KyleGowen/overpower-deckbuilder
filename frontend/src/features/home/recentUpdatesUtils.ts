export function formatUpdateTypeLabel(type: string): string {
  if (type === 'new_cards') return 'NEW CARDS';
  return type.replace(/_/g, ' ').toUpperCase();
}
