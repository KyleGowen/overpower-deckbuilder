/**
 * Select Art modal caption: friendly set name, optional checklist #, optional rarity.
 * Mirrors public/js/alternate-art-modal.js — keep behavior in sync.
 * Rarity is usually Common / Uncommon / Rare / Ultra Rare from the DB; empty string is treated like missing.
 */
export function formatAlternateArtCaption(
  friendlySet: string,
  setNumber: string | null | undefined,
  rarity: string | null | undefined
): string {
  let s = (friendlySet != null ? String(friendlySet) : '').trim();
  if (!s) s = 'ERB';
  const sn = setNumber != null ? String(setNumber).trim() : '';
  const r = rarity != null ? String(rarity).trim() : '';
  if (sn) s += ` - ${sn}`;
  if (r) s += ` (${r})`;
  return s;
}
