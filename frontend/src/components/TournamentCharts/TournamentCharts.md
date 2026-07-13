# TournamentCharts — Preview Data Tiles

Reusable tiles for tournament metagame stats. **Home rail** uses `DashboardTile` variant `rail`
(deck-tile dimensions: 380×280 art + compact body). **View All** (`/home/columbus-regional`) uses
larger dashboard variants on a 12-column grid — see [`DashboardGrid.md`](../dashboard/DashboardGrid.md).

Shell: shadcn **Card** via [`DashboardTile`](../dashboard/DashboardTile.tsx). Setup: [`SHADCN_UI.md`](../../../../docs/current/SHADCN_UI.md).

Visual spec: [`STYLE_GUIDE_V2.md`](../../../../STYLE_GUIDE_V2.md) § Home — Columbus Regional stats rail.

## Shell: `StatsChartTile` → `DashboardTile`

Chart-based tiles compose `DashboardTile` (`layout="chart"`):

- `dashboard-tile__art` — chart or card visual; `rail` = `aspect-ratio: 380/280`; dashboard variants use fluid `min-height`
- `dashboard-tile__body` — shadcn `CardFooter` caption (title, detail, subtitle, footnote badge)

Props: `title`, `subtitle?`, `footnote?`, `detail?`, `captionAlign?`, `variant?` (`rail` | `sm` | `md` | `lg` | `wide` | `tall`).

## Text tile: `PreviewTextTile`

Generic text-only preview tile (no chart art zone). Single content column with title hierarchy:

- `#` title (`h1`), `##` subtitle (`h2`), spacer, then labeled sections (`h3` label + value)
- Height matches deck tiles: `min-height: calc(100cqw * 280/380 + 4.875rem)`

## Tile types

| Type | Component | When to use |
|------|-----------|-------------|
| Event placard | `TournamentPlacardTile` (`TournamentSummaryTile` alias) | Tournament meta: name, season, location, date, players; winner on Home rail; View All adds podium deck links in placard footer |
| Bar chart | `StatsChartTile` + `TournamentBarChart` | Ranked counts (characters, homebases, reserves, …) |
| Pie chart | `StatsChartTile` + `TournamentPieChart` | Small categorical sets (cataclysms, ≤4 character groups) |
| Card spotlight | `TournamentHighlightTile` | Single highlighted card + stat label |
| Character list | `TournamentCharacterListTile` | Auto-routes by entry count (see below) |

### `TournamentCharacterListTile` routing

| `entries.length` | Preview |
|------------------|---------|
| 0 | Empty message in art |
| 1 | `TournamentHighlightTile` |
| 2–4 | Pie chart (no legend in preview) |
| 5+ | Bar chart (max 5 rows) |

## Chart props (preview mode)

**`TournamentBarChart`:** pass `fillContainer`, `maxRows={5}` on rails; `compact` for smaller ticks.
Axis labels use `#a8b8d8`, truncated with ellipsis (no wrap).

**`TournamentPieChart`:** pass `fillContainer`, `showLegend={false}` on rails. Portion labels (small text + colored leader lines) render on slices by default when the legend is hidden; tooltips show full names on hover/click.

## Example (new tournament rail)

```tsx
import {
  StatsChartTile,
  TournamentBarChart,
  TournamentSummaryTile,
  TournamentCharacterListTile,
} from '../../components/TournamentCharts';

<StatsChartTile title="Top Characters" footnote="+12 more">
  <TournamentBarChart
    data={stats.topCharacters}
    limit={5}
    compact
    fillContainer
    maxRows={5}
    onSegmentClick={openEntry}
    isClickable={isClickable}
  />
</StatsChartTile>
```

## Data

Columbus Regional uses static JSON from `npm run build:regional-stats` →
`frontend/src/data/tournaments/s1-columbus.json`. Card slideout resolution:
`resolveTournamentCard` + `useAllCatalogCards()`.

## Files

| File | Role |
|------|------|
| `PreviewTextTile.tsx` | Generic text-only preview tile |
| `TournamentPlacardTile.tsx` | Tournament event placard (optional podium link footer on View All) |
| `StatsChartTile.tsx` | Chart shell + caption |
| `TournamentSummaryTile.tsx` | Re-export alias of `TournamentPlacardTile` |
| `TournamentHighlightTile.tsx` | Single-card spotlight |
| `TournamentPodiumDeckRows.tsx` | 1st/2nd/3rd deck link rows (placard footer) |
| `TournamentPodiumDecksTile.tsx` | Standalone podium tile (legacy export; View All uses placard footer) |
| `TournamentCharacterListTile.tsx` | List auto-routing |
| `TournamentBarChart.tsx` / `TournamentPieChart.tsx` | Recharts previews |
| `TournamentCharts.css` | Layout + `.preview-tile__*` tokens |
| `chartTheme.ts` | Colors and axis tick theme |
