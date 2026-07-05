import { CardImage } from '../CardImage';
import type { CatalogCard } from '../../lib/api/types';
import type { CountEntry } from '../../lib/tournaments/types';
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
  onEntryClick: (entry: CountEntry) => void;
  resolveCard: (entry: CountEntry) => CatalogCard | null;
  isClickable: (entry: CountEntry) => boolean;
}

export function TournamentCharacterListTile({
  title,
  entries,
  compact = true,
  onEntryClick,
  resolveCard,
  isClickable,
}: TournamentCharacterListTileProps) {
  if (entries.length === 0) {
    return (
      <StatsChartTile title={title}>
        <p className="tournament-tile-empty">None this event</p>
      </StatsChartTile>
    );
  }

  if (entries.length === 1) {
    const entry = entries[0]!;
    const card = resolveCard(entry);
    return (
      <TournamentHighlightTile
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
      <StatsChartTile title={title}>
        <TournamentPieChart
          data={entries}
          compact={compact}
          fillContainer
          showLegend={false}
          onSegmentClick={onEntryClick}
          isClickable={isClickable}
        />
      </StatsChartTile>
    );
  }

  return (
    <StatsChartTile title={title}>
      <TournamentBarChart
        data={entries}
        compact={compact}
        fillContainer
        maxRows={5}
        onSegmentClick={onEntryClick}
        isClickable={isClickable}
      />
    </StatsChartTile>
  );
}
