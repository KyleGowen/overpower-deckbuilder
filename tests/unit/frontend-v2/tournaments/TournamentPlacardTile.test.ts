import { getTournamentPlacardSections } from '../../../../frontend/src/lib/tournaments/tournamentPlacardSections';
import type { TournamentEventMeta } from '../../../../frontend/src/lib/tournaments/types';

const meta: TournamentEventMeta = {
  id: 's1-columbus',
  title: 'Columbus Regional',
  subtitle: 'Season One Regional',
  seasonLabel: '1st Season One Regional',
  location: { venueName: 'Heroes and Games', city: 'Columbus', region: 'OH' },
  date: '2026-06-27',
  playerCount: 53,
  winnerName: 'Justin Sadaie',
};

describe('getTournamentPlacardSections', () => {
  it('includes Winner Name when podium links are not shown', () => {
    const sections = getTournamentPlacardSections(meta, false);
    const labels = sections.map((section) => section.label);
    expect(labels).toEqual(['Location', 'Date', 'Players', 'Winner Name']);
    expect(sections.find((section) => section.label === 'Winner Name')?.value).toBe('Justin Sadaie');
  });

  it('omits Winner Name when podium links are shown', () => {
    const sections = getTournamentPlacardSections(meta, true);
    const labels = sections.map((section) => section.label);
    expect(labels).toEqual(['Location', 'Date', 'Players']);
    expect(labels).not.toContain('Winner Name');
  });
});
