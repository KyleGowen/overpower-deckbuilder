import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { IconTrophy } from '../../components/icons';
import { useScrollToTopOnMount } from '../../lib/layout/useScrollToTopOnMount';
import { TournamentStatsRail } from './TournamentStatsRail';
import './TournamentStatsRail.css';

export default function ColumbusRegionalPage() {
  useScrollToTopOnMount();

  return (
    <div className="columbus-regional">
      <div className="columbus-regional__inner">
        <header className="columbus-regional__head">
          <Link className="columbus-regional__back" to="/home">
            ← Back to Home
          </Link>
          <h1 className="columbus-regional__title">
            <span className="columbus-regional__title-icon" aria-hidden="true">
              <IconTrophy />
            </span>
            Columbus Regional - June 2026
          </h1>
        </header>
        <Separator className="bg-border" />
        <TournamentStatsRail expanded />
      </div>
    </div>
  );
}
