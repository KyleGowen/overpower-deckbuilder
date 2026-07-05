import type { TournamentEventLocation } from './types';

/** Display: "Heroes and Games · Columbus, OH" or "Columbus, OH" when no venue. */
export function formatEventLocation(location: TournamentEventLocation): string {
  const place = `${location.city}, ${location.region}`;
  if (location.venueName?.trim()) {
    return `${location.venueName.trim()} · ${place}`;
  }
  return place;
}
