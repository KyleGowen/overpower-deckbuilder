import type { ReactNode } from 'react';
import type { CatalogCard } from '../../lib/api/types';
import type { CountEntry, SpotlightEntry, TournamentEventStats } from '../../lib/tournaments/types';
import type { DashboardTileVariant } from '../../components/dashboard';
import type { ColumbusDashboardTileId } from './columbusDashboardLayout';
import {
  StatsChartTile,
  TournamentBarChart,
  TournamentCharacterListTile,
  TournamentPieChart,
  TournamentSummaryTile,
} from '../../components/TournamentCharts';

const HOME_CHART_LIMIT = 5;
const RAIL_BAR_MAX_ROWS = 5;

export interface BuildColumbusTilesOptions {
  stats: TournamentEventStats;
  expanded: boolean;
  tileVariant?: DashboardTileVariant;
  tileId?: ColumbusDashboardTileId;
  charFootnote?: string;
  homebaseTooltip: (entry: CountEntry) => string[] | undefined;
  openEntry: (entry: CountEntry) => void;
  isClickable: (entry: CountEntry) => boolean;
  resolveCard: (entry: CountEntry) => CatalogCard | null;
  renderSpotlight: (spot: SpotlightEntry | null, key: string) => ReactNode;
}

function resolveVariant(
  expanded: boolean,
  tileVariant?: DashboardTileVariant,
): DashboardTileVariant {
  return tileVariant ?? (expanded ? 'md' : 'rail');
}

export function buildColumbusTileById(
  id: ColumbusDashboardTileId,
  options: BuildColumbusTilesOptions,
): ReactNode {
  const {
    stats,
    expanded,
    tileVariant,
    charFootnote,
    homebaseTooltip,
    openEntry,
    isClickable,
    resolveCard,
    renderSpotlight,
  } = options;

  const variant = resolveVariant(expanded, tileVariant);
  const limit = expanded ? undefined : HOME_CHART_LIMIT;
  const barMaxRows = expanded ? 12 : RAIL_BAR_MAX_ROWS;
  const chartCompact = variant === 'rail';

  switch (id) {
    case 'meta':
      return <TournamentSummaryTile meta={stats.meta} variant={variant} />;

    case 'characterAppearances':
      return (
        <StatsChartTile
          variant={variant}
          title="Character Appearances"
          subtitle="Front line + reserve"
          footnote={charFootnote}
        >
          <TournamentBarChart
            data={stats.characterAppearances}
            limit={limit}
            compact={chartCompact}
            fillContainer
            maxRows={barMaxRows}
            tileVariant={variant}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      );

    case 'top8Characters':
      return (
        <StatsChartTile variant={variant} title="Top 8 Characters" subtitle="Finishing decks 1st–8th">
          <TournamentBarChart
            data={stats.top8CharacterAppearances}
            limit={limit}
            compact={chartCompact}
            fillContainer
            maxRows={barMaxRows}
            tileVariant={variant}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      );

    case 'mostPlaysWithoutTop8':
      return renderSpotlight(stats.mostPlaysWithoutTop8, 'mostPlaysWithoutTop8');

    case 'highestTop8Rate':
      return renderSpotlight(stats.highestTop8Rate, 'highestTop8Rate');

    case 'newWinningCharacters':
      return (
        <TournamentCharacterListTile
          variant={variant}
          title="New Winning Characters"
          entries={stats.newWinningCharacters}
          compact={chartCompact}
          onEntryClick={openEntry}
          resolveCard={resolveCard}
          isClickable={isClickable}
        />
      );

    case 'newTop8Characters':
      return (
        <TournamentCharacterListTile
          variant={variant}
          title="New Top 8 Characters"
          entries={stats.newTop8Characters}
          compact={chartCompact}
          onEntryClick={openEntry}
          resolveCard={resolveCard}
          isClickable={isClickable}
        />
      );

    case 'topReservists':
      return (
        <StatsChartTile variant={variant} title="Top Reservists">
          <TournamentBarChart
            data={stats.topReserves}
            limit={limit}
            compact={chartCompact}
            fillContainer
            maxRows={barMaxRows}
            tileVariant={variant}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      );

    case 'topHomebases':
      return (
        <StatsChartTile variant={variant} title="Top Homebases">
          <TournamentBarChart
            data={stats.topHomebases}
            limit={expanded ? undefined : 5}
            compact={chartCompact}
            fillContainer
            maxRows={barMaxRows}
            tileVariant={variant}
            onSegmentClick={openEntry}
            isClickable={isClickable}
            tooltipExtra={homebaseTooltip}
          />
        </StatsChartTile>
      );

    case 'topCataclysms':
      return (
        <StatsChartTile
          variant={variant}
          title="Top Cataclysms"
          subtitle={`${stats.cataclysmReportedCount} of ${stats.meta.playerCount} decks reported`}
        >
          <TournamentPieChart
            data={stats.topCataclysms}
            compact={chartCompact}
            fillContainer
            showLegend={expanded}
            tileVariant={variant}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      );

    default:
      return null;
  }
}

export { HOME_CHART_LIMIT, RAIL_BAR_MAX_ROWS };
