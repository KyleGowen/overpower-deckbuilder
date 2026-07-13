import { DashboardTile, type DashboardTileVariant } from '../dashboard';
import type { ColumbusPodiumDeckEntry } from '../../lib/tournaments/columbusPodiumDecks';
import { TournamentPodiumDeckRows } from './TournamentPodiumDeckRows';
import './TournamentCharts.css';

interface TournamentPodiumDecksTileProps {
  entries: ColumbusPodiumDeckEntry[];
  onOpenDeck: (deckId: string, userId: string) => void;
  variant?: DashboardTileVariant;
}

/** Standalone podium tile — retained for export compatibility; View All uses placard footer instead. */
export function TournamentPodiumDecksTile({
  entries,
  onOpenDeck,
  variant = 'md',
}: TournamentPodiumDecksTileProps) {
  return (
    <DashboardTile
      variant={variant}
      layout="text"
      title="Podium Finishes"
      className="stats-chart-tile tournament-podium-tile"
    >
      <TournamentPodiumDeckRows entries={entries} onOpenDeck={onOpenDeck} />
    </DashboardTile>
  );
}
