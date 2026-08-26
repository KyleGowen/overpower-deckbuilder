import type { TournamentEventLocation } from './types';

/** Display compact locations inline and complete street addresses on separate lines. */
export function formatEventLocation(location: TournamentEventLocation): string {
  const regionAndPostal = [location.region, location.postalCode].filter(Boolean).join(' ');
  const place = `${location.city}, ${regionAndPostal}${location.country ? `, ${location.country}` : ''}`;
  if (location.addressLine?.trim()) {
    return [location.venueName?.trim(), location.addressLine.trim(), place].filter(Boolean).join('\n');
  }
  if (location.country) {
    return [location.venueName?.trim(), place].filter(Boolean).join('\n');
  }
  if (location.venueName?.trim()) {
    return `${location.venueName.trim()} · ${place}`;
  }
  return place;
}
