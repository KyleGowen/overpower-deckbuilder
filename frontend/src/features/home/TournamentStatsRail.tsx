import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CardDetailPanel } from '../../components/CardDetailPanel';
import { DashboardGrid, DashboardRail, DashboardRailItem } from '../../components/dashboard';
import { IconChevronRight, IconTrophy } from '../../components/icons';
import { fetchFoilCardMap } from '../../lib/api/catalog';
import { buildFoilCardMapLookup } from '../../lib/catalog/foilCatalog';
import { useAllCatalogCards } from '../../lib/catalog/useAllCatalogCards';
import { useCardDetailHistory } from '../../lib/layout/useCardDetailHistory';
import { getColumbusRegionalStats } from '../../lib/tournaments/columbusStats';
import { resolveTournamentCard, isTournamentCardClickable } from '../../lib/tournaments/resolveTournamentCard';
import {
  COLUMBUS_DASHBOARD_LAYOUT,
  COLUMBUS_TILE_ORDER,
  getColumbusDashboardGridPlacements,
  getPlacementForTile,
  getStackedPlacements,
} from '../../lib/tournaments/columbusDashboardLayout';
import { buildColumbusTileById, HOME_CHART_LIMIT } from '../../lib/tournaments/buildColumbusStatsTiles';
import { TournamentHighlightTile } from '../../components/TournamentCharts';
import type { CatalogCard, CatalogType } from '../../lib/api/types';
import type { CountEntry, HomebaseCountEntry, SpotlightEntry } from '../../lib/tournaments/types';
import './TournamentStatsRail.css';

const VIEW_ALL_PATH = '/home/columbus-regional';

interface TournamentStatsRailProps {
  /** When true, show full data on the 12-column dashboard grid. */
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

  const resolveCard = useCallback(
    (entry: CountEntry) =>
      resolveTournamentCard(allCards, entry.name, entry.catalogType, { foilLookup })?.card ?? null,
    [allCards, foilLookup],
  );

  const renderSpotlight = useCallback(
    (spot: SpotlightEntry | null, key: string) => {
      if (!spot) return null;
      const hit = resolveTournamentCard(allCards, spot.name, spot.catalogType, { foilLookup });
      const placement = expanded ? getPlacementForTile(key as typeof COLUMBUS_TILE_ORDER[number]) : null;
      const variant = placement?.tileVariant ?? 'rail';
      return (
        <TournamentHighlightTile
          key={key}
          variant={variant}
          label={spot.label}
          detail={spot.detail}
          cardName={spot.name}
          card={hit?.card ?? null}
          catalogType={spot.catalogType}
          onClick={hit ? () => openEntry(spot) : undefined}
        />
      );
    },
    [allCards, expanded, foilLookup, openEntry],
  );

  const tileBuildOptions = useMemo(
    () => ({
      stats,
      expanded,
      charFootnote,
      homebaseTooltip,
      openEntry,
      isClickable,
      resolveCard,
      renderSpotlight,
    }),
    [stats, expanded, charFootnote, homebaseTooltip, openEntry, isClickable, resolveCard, renderSpotlight],
  );

  const cardPanel = (
    <CardDetailPanel
      card={selected}
      type={selected ? selectedCatalogType : null}
      open={Boolean(selected)}
      onClose={closeCardDetail}
    />
  );

  if (expanded) {
    const buildPlacementTile = (placement: (typeof COLUMBUS_DASHBOARD_LAYOUT)[number]) =>
      buildColumbusTileById(placement.id, {
        ...tileBuildOptions,
        tileVariant: placement.tileVariant,
      });

    const gridItems = getColumbusDashboardGridPlacements().map((placement) => {
      const stacked = getStackedPlacements(placement.id);
      const topRowStacked = stacked.filter((child) => child.stackRole === 'topRow');
      const belowStacked = stacked.filter((child) => child.stackRole !== 'topRow');

      let node = buildPlacementTile(placement);
      if (topRowStacked.length > 0) {
        node = (
          <div className="dashboard-grid__stack flex flex-col gap-4">
            <div className="dashboard-grid__stack-row grid grid-cols-2 gap-4">
              {node}
              {topRowStacked.map((child) => (
                <div key={child.id}>{buildPlacementTile(child)}</div>
              ))}
            </div>
            {belowStacked.map((child) => (
              <div key={child.id}>{buildPlacementTile(child)}</div>
            ))}
          </div>
        );
      } else if (belowStacked.length > 0) {
        node = (
          <div className="dashboard-grid__stack flex flex-col gap-4">
            {node}
            {belowStacked.map((child) => (
              <div key={child.id}>{buildPlacementTile(child)}</div>
            ))}
          </div>
        );
      }

      return {
        id: placement.id,
        colSpan: placement.colSpan,
        rowSpan: placement.rowSpan,
        colStart: placement.colStart,
        rowStart: placement.rowStart,
        node,
      };
    });

    return (
      <>
        <DashboardGrid items={gridItems} />
        {cardPanel}
      </>
    );
  }

  const railTiles = COLUMBUS_TILE_ORDER.map((id) => (
    <DashboardRailItem key={id}>
      {buildColumbusTileById(id, tileBuildOptions)}
    </DashboardRailItem>
  ));

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
      <DashboardRail>{railTiles}</DashboardRail>
      {cardPanel}
    </section>
  );
}
