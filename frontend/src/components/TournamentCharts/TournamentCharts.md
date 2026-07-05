# TournamentCharts — Preview Data Tiles

Reusable **preview** tiles for tournament metagame stats on Home rails and similar surfaces.
Each tile matches **deck-tile dimensions** (380×280 art zone + compact body). Full-size
charts on View All pages are separate; these components are the rail-sized summaries.

Visual spec: [`STYLE_GUIDE_V2.md`](../../../../STYLE_GUIDE_V2.md) § Home — Columbus Regional stats rail.

## Shell: `StatsChartTile`

All chart-based previews use this wrapper:

- `__art` — chart or card visual (`aspect-ratio: 380/280`, full tile width)
- `__body` — caption (title, optional detail/subtitle/footnote)

Props: `title`, `subtitle?`, `footnote?`, `detail?`, `captionAlign?` (`center` | `start`).

## Text tile: `PreviewTextTile`

Generic text-only preview tile (no chart art zone). Single content column with title hierarchy:

- `#` title (`h1`), `##` subtitle (`h2`), spacer, then labeled sections (`h3` label + value)
- Height matches deck tiles: `min-height: calc(100cqw * 280/380 + 4.875rem)`

## Tile types

| Type | Component | When to use |
|------|-----------|-------------|
| Event placard | `TournamentPlacardTile` (`TournamentSummaryTile` alias) | Tournament meta: name, season, location, date, players, winner |
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
| `TournamentPlacardTile.tsx` | Tournament event placard |
| `StatsChartTile.tsx` | Chart shell + caption |
| `TournamentSummaryTile.tsx` | Re-export alias of `TournamentPlacardTile` |
| `TournamentHighlightTile.tsx` | Single-card spotlight |
| `TournamentCharacterListTile.tsx` | List auto-routing |
| `TournamentBarChart.tsx` / `TournamentPieChart.tsx` | Recharts previews |
| `TournamentCharts.css` | Layout + `.preview-tile__*` tokens |
| `chartTheme.ts` | Colors and axis tick theme |
