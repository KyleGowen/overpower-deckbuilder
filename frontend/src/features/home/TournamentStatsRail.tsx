import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import {
  StatsChartTile,
  TournamentBarChart,
  TournamentCharacterListTile,
  TournamentHighlightTile,
  TournamentPieChart,
  TournamentSummaryTile,
} from '../../components/TournamentCharts';
import { IconChevronRight, IconTrophy } from '../../components/icons';
import { fetchFoilCardMap } from '../../lib/api/catalog';
import { buildFoilCardMapLookup } from '../../lib/catalog/foilCatalog';
import { useAllCatalogCards } from '../../lib/catalog/useAllCatalogCards';
import { useCardDetailHistory } from '../../lib/layout/useCardDetailHistory';
import { getColumbusRegionalStats } from '../../lib/tournaments/columbusStats';
import { resolveTournamentCard, isTournamentCardClickable } from '../../lib/tournaments/resolveTournamentCard';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import type { CountEntry, HomebaseCountEntry, SpotlightEntry } from '../../lib/tournaments/types';
import './TournamentStatsRail.css';

const HOME_CHART_LIMIT = 5;
const RAIL_BAR_MAX_ROWS = 5;
const VIEW_ALL_PATH = '/home/columbus-regional';

interface TournamentStatsRailProps {
  /** When true, show full data (View All page). */
  expanded?: boolean;
}

export function TournamentStatsRail({ expanded = false }: TournamentStatsRailProps) {
  const stats = getColumbusRegionalStats();
  const { cards: allCards } = useAllCatalogCards();
  const foilMapQuery = useQuery({
    queryKey: ['foil-card-map'],
    queryFn: () => fetchFoilCardMap(),
    staleTime: 60 * 60 * 1000,
  });
  const foilLookup = useMemo(
    () => buildFoilCardMapLookup(foilMapQuery.data ?? []),
    [foilMapQuery.data],
  );
  const [selected, setSelected] = useState<CatalogCard | null>(null);
  const [selectedCatalogType, setSelectedCatalogType] = useState<CatalogType>('characters');
  const { close: closeCardDetail } = useCardDetailHistory(Boolean(selected), () => setSelected(null));

  const openEntry = useCallback(
    (entry: { name: string; catalogType: CatalogType }) => {
      const hit = resolveTournamentCard(allCards, entry.name, entry.catalogType, { foilLookup });
      if (!hit) return;
      setSelected(hit.card);
      setSelectedCatalogType(hit.catalogType);
    },
    [allCards, foilLookup],
  );

  const isClickable = useCallback(
    (entry: CountEntry) => isTournamentCardClickable(allCards, entry.name, entry.catalogType),
    [allCards],
  );

  const limit = expanded ? undefined : HOME_CHART_LIMIT;
  const charFootnote = !expanded && stats.characterAppearances.length > HOME_CHART_LIMIT
    ? `+${stats.characterAppearances.length - HOME_CHART_LIMIT} more characters`
    : undefined;

  const homebaseTooltip = useMemo(
    () => (entry: CountEntry) => {
      const hb = stats.topHomebases.find((h: HomebaseCountEntry) => h.name === entry.name);
      if (!hb) return undefined;
      return [`Top 8: ${hb.top8}`, `Top 3: ${hb.top3}`, `Wins: ${hb.wins}`];
    },
    [stats.topHomebases],
  );

  const renderSpotlight = (spot: SpotlightEntry | null) => {
    if (!spot) return null;
    const hit = resolveTournamentCard(allCards, spot.name, spot.catalogType, { foilLookup });
    return (
      <div className="home__rail-item home__rail-item--stats" key={spot.label}>
        <TournamentHighlightTile
          label={spot.label}
          detail={spot.detail}
          cardName={spot.name}
          card={hit?.card ?? null}
          catalogType={spot.catalogType}
          onClick={hit ? () => openEntry(spot) : undefined}
        />
      </div>
    );
  };

  const resolveCard = useCallback(
    (entry: CountEntry) =>
      resolveTournamentCard(allCards, entry.name, entry.catalogType, { foilLookup })?.card ?? null,
    [allCards, foilLookup],
  );

  const renderCharacterListTile = (title: string, entries: CountEntry[], key: string) => (
    <div className="home__rail-item home__rail-item--stats" key={key}>
      <TournamentCharacterListTile
        title={title}
        entries={entries}
        compact={!expanded}
        onEntryClick={openEntry}
        resolveCard={resolveCard}
        isClickable={isClickable}
      />
    </div>
  );

  const tiles = (
    <>
      <div className="home__rail-item home__rail-item--stats">
        <TournamentSummaryTile meta={stats.meta} />
      </div>

      <div className="home__rail-item home__rail-item--stats">
        <StatsChartTile
          title="Character Appearances"
          subtitle="Front line + reserve"
          footnote={charFootnote}
        >
          <TournamentBarChart
            data={stats.characterAppearances}
            limit={limit}
            compact={!expanded}
            fillContainer
            maxRows={expanded ? 8 : RAIL_BAR_MAX_ROWS}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      </div>

      <div className="home__rail-item home__rail-item--stats">
        <StatsChartTile title="Top 8 Characters" subtitle="Finishing decks 1st–8th">
          <TournamentBarChart
            data={stats.top8CharacterAppearances}
            limit={limit}
            compact={!expanded}
            fillContainer
            maxRows={expanded ? 8 : RAIL_BAR_MAX_ROWS}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      </div>

      {renderSpotlight(stats.mostPlaysWithoutTop8)}
      {renderSpotlight(stats.highestTop8Rate)}

      {renderCharacterListTile('New Winning Characters', stats.newWinningCharacters, 'new-winners')}
      {renderCharacterListTile('New Top 8 Characters', stats.newTop8Characters, 'new-top8')}

      <div className="home__rail-item home__rail-item--stats">
        <StatsChartTile title="Top Reservists">
          <TournamentBarChart
            data={stats.topReserves}
            limit={limit}
            compact={!expanded}
            fillContainer
            maxRows={expanded ? 8 : RAIL_BAR_MAX_ROWS}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      </div>

      <div className="home__rail-item home__rail-item--stats">
        <StatsChartTile title="Top Homebases">
          <TournamentBarChart
            data={stats.topHomebases}
            limit={expanded ? undefined : 5}
            compact={!expanded}
            fillContainer
            maxRows={expanded ? 8 : RAIL_BAR_MAX_ROWS}
            onSegmentClick={openEntry}
            isClickable={isClickable}
            tooltipExtra={homebaseTooltip}
          />
        </StatsChartTile>
      </div>

      <div className="home__rail-item home__rail-item--stats">
        <StatsChartTile
          title="Top Cataclysms"
          subtitle={`${stats.cataclysmReportedCount} of ${stats.meta.playerCount} decks reported`}
        >
          <TournamentPieChart
            data={stats.topCataclysms}
            compact={!expanded}
            fillContainer
            showLegend={expanded}
            onSegmentClick={openEntry}
            isClickable={isClickable}
          />
        </StatsChartTile>
      </div>
    </>
  );

  if (expanded) {
    return (
      <>
        <div className="columbus-regional__grid">{tiles}</div>
        <CardDetailPanel
          card={selected}
          type={selected ? selectedCatalogType : null}
          open={Boolean(selected)}
          onClose={closeCardDetail}
        />
      </>
    );
  }

  return (
    <section className="home__section">
      <header className="home__section-head">
        <h2 className="home__section-title">
          <span className="home__section-icon"><IconTrophy /></span>
          Columbus Regional
        </h2>
        <Link className="home__view-all" to={VIEW_ALL_PATH}>
          View All <IconChevronRight />
        </Link>
      </header>
      <div className="home__rail home__rail--stats">{tiles}</div>
      <CardDetailPanel
        card={selected}
        type={selected ? selectedCatalogType : null}
        open={Boolean(selected)}
        onClose={closeCardDetail}
      />
    </section>
  );
}
