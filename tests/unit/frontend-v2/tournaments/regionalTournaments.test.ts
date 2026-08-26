import {
  buildRegionalEventPath,
  FEATURED_TOURNAMENT_ID,
  getRegionalTournament,
  REGIONAL_TOURNAMENTS,
} from '../../../../frontend/src/lib/tournaments/regionalTournaments';

describe('regionalTournaments', () => {
  it('features Niagara while retaining Columbus in the archive', () => {
    expect(FEATURED_TOURNAMENT_ID).toBe('s1-niagara');
    expect(getRegionalTournament(undefined).stats.meta.title).toBe('Niagara Regional');
    expect(REGIONAL_TOURNAMENTS.map((event) => event.id)).toEqual([
      's1-niagara',
      's1-columbus',
    ]);
  });

  it('builds a shareable event URL and falls back to the featured tournament', () => {
    expect(buildRegionalEventPath('s1-columbus')).toBe('/home/regionals?event=s1-columbus');
    expect(getRegionalTournament('unknown').id).toBe('s1-niagara');
  });
});
