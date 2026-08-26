import { useSearchParams, Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { IconTrophy } from '../../components/icons';
import { useScrollToTopOnMount } from '../../lib/layout/useScrollToTopOnMount';
import {
  FEATURED_TOURNAMENT_ID,
  getRegionalTournament,
  REGIONAL_TOURNAMENTS,
} from '../../lib/tournaments/regionalTournaments';
import { TournamentStatsRail } from './TournamentStatsRail';
import './TournamentStatsRail.css';

export default function RegionalsPage() {
  useScrollToTopOnMount();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTournament = getRegionalTournament(
    searchParams.get('event') ?? FEATURED_TOURNAMENT_ID,
  );

  return (
    <div className="regionals-page">
      <div className="regionals-page__inner">
        <header className="regionals-page__head">
          <Link className="regionals-page__back" to="/home">
            ← Back to Home
          </Link>
          <div className="regionals-page__title-row">
            <h1 className="regionals-page__title">
              <span className="regionals-page__title-icon" aria-hidden="true">
                <IconTrophy />
              </span>
              Regionals
            </h1>
            <label className="regionals-page__event-picker">
              <span>Tournament</span>
              <select
                aria-label="Tournament"
                value={selectedTournament.id}
                onChange={(event) => setSearchParams({ event: event.target.value })}
              >
                {REGIONAL_TOURNAMENTS.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.selectorLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="regionals-page__subtitle">
            {selectedTournament.stats.meta.subtitle} · {selectedTournament.stats.meta.playerCount} players
          </p>
        </header>
        <Separator className="bg-border" />
        <TournamentStatsRail expanded tournamentId={selectedTournament.id} />
      </div>
    </div>
  );
}
