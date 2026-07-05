import type { CatalogCard } from '../../lib/api/types';
import type { CountEntry } from '../../lib/tournaments/types';
import type { DashboardTileVariant } from '../dashboard';
import { isDashboardRailVariant } from '../dashboard/dashboardTileVariants';
import { StatsChartTile } from './StatsChartTile';
import { TournamentHighlightTile } from './TournamentHighlightTile';
import { TournamentPieChart } from './TournamentPieChart';
import { TournamentBarChart } from './TournamentBarChart';
import './TournamentCharts.css';

const PREVIEW_PIE_MAX = 4;

interface TournamentCharacterListTileProps {
  title: string;
  entries: CountEntry[];
  compact?: boolean;
  variant?: DashboardTileVariant;
  onEntryClick: (entry: CountEntry) => void;
  resolveCard: (entry: CountEntry) => CatalogCard | null;
  isClickable: (entry: CountEntry) => boolean;
}

export function TournamentCharacterListTile({
  title,
  entries,
  compact = true,
  variant = 'rail',
  onEntryClick,
  resolveCard,
  isClickable,
}: TournamentCharacterListTileProps) {
  const chartCompact = compact ?? isDashboardRailVariant(variant);

  if (entries.length === 0) {
    return (
      <StatsChartTile variant={variant} title={title}>
        <p className="tournament-tile-empty">None this event</p>
      </StatsChartTile>
    );
  }

  if (entries.length === 1) {
    const entry = entries[0]!;
    const card = resolveCard(entry);
    return (
      <TournamentHighlightTile
        variant={variant}
        label={title}
        cardName={entry.name}
        card={card}
        catalogType={entry.catalogType}
        onClick={card && isClickable(entry) ? () => onEntryClick(entry) : undefined}
      />
    );
  }

  if (entries.length <= PREVIEW_PIE_MAX) {
    return (
      <StatsChartTile variant={variant} title={title}>
        <TournamentPieChart
          data={entries}
          compact={chartCompact}
          fillContainer
          showLegend={false}
          tileVariant={variant}
          onSegmentClick={onEntryClick}
          isClickable={isClickable}
        />
      </StatsChartTile>
    );
  }

  return (
    <StatsChartTile variant={variant} title={title}>
      <TournamentBarChart
        data={entries}
        compact={chartCompact}
        fillContainer
        maxRows={5}
        tileVariant={variant}
        onSegmentClick={onEntryClick}
        isClickable={isClickable}
      />
    </StatsChartTile>
  );
}
