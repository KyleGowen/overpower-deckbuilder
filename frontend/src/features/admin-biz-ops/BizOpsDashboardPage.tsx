import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/ui/card';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { IconChartBar } from '../../components/icons';
import { fetchBizOpsDashboard, type BizOpsDashboardData } from '../../lib/api/adminBizOps';
import { formatCurrencyAmount } from '../../lib/formatCurrencyAmount';
import { useScrollToTopOnMount } from '../../lib/layout/useScrollToTopOnMount';
import './BizOpsDashboardPage.css';

interface MonthlyChartDatum {
  month: string;
  amount: number;
  estimated: boolean;
  finalizedAmount: number | null;
  estimatedAmount: number | null;
  changeFromPrevious: number | null;
}

interface ServiceTrendDatum {
  month: string;
  amount: number;
  estimated: boolean;
  finalizedAmount: number | null;
  estimatedAmount: number | null;
}

const SERVICE_LABELS: Record<string, string> = {
  'Amazon EC2 Container Registry (ECR)': 'ECR',
  'Amazon Relational Database Service': 'RDS',
  'Amazon Virtual Private Cloud': 'VPC',
  'Amazon Elastic Compute Cloud - Compute': 'EC2 Compute',
  'EC2 - Other': 'EC2 Other',
  'Amazon Route 53': 'Route 53',
  'Amazon Simple Storage Service': 'S3',
  'Amazon CloudFront': 'CloudFront',
};

function formatMonth(value: string, includeYear = true): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    ...(includeYear ? { year: 'numeric' as const } : {}),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, 1)));
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function buildMonthlyChartData(analytics: BizOpsDashboardData): MonthlyChartDatum[] {
  return analytics.monthlyCosts.map((entry, index, entries) => {
    const previous = entries[index - 1];
    return {
      ...entry,
      finalizedAmount: entry.estimated ? null : entry.amount,
      estimatedAmount: entry.estimated || entries[index + 1]?.estimated ? entry.amount : null,
      changeFromPrevious: previous && previous.amount !== 0
        ? ((entry.amount - previous.amount) / previous.amount) * 100
        : null,
    };
  });
}

function buildServiceTrendData(
  points: BizOpsDashboardData['serviceTrends'][number]['points'],
): ServiceTrendDatum[] {
  const visiblePoints = points.slice(-12);
  return visiblePoints.map((point, index, entries) => ({
    ...point,
    finalizedAmount: point.estimated ? null : point.amount,
    estimatedAmount: point.estimated || entries[index + 1]?.estimated ? point.amount : null,
  }));
}

function ServiceTrendChart({
  trend,
  currency,
}: {
  trend: BizOpsDashboardData['serviceTrends'][number];
  currency: string;
}) {
  const data = buildServiceTrendData(trend.points);
  const label = SERVICE_LABELS[trend.service] ?? trend.service;

  return (
    <Card className="biz-ops-service-trend-card">
      <div className="biz-ops-service-trend-heading">
        <div>
          <h3 title={trend.service}>{label}</h3>
          <p>Monthly invoice row</p>
        </div>
        <strong>{formatCurrencyAmount(trend.currentAmount, currency)}</strong>
      </div>
      <div
        className="biz-ops-service-trend-chart"
        role="img"
        aria-label={`${trend.service} monthly AWS invoice row history, with a current estimate of ${formatCurrencyAmount(trend.currentAmount, currency)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="month"
              interval="preserveStartEnd"
              minTickGap={28}
              tickFormatter={(month: string) => formatMonth(month, false)}
              axisLine={{ stroke: 'var(--color-border-strong)' }}
              tickLine={false}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip
              cursor={{ stroke: 'var(--color-border-accent)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                const entry = payload?.[0]?.payload as ServiceTrendDatum | undefined;
                return active && entry ? (
                  <div className="biz-ops-chart-tooltip biz-ops-service-chart-tooltip">
                    <strong>{formatMonth(entry.month)}</strong>
                    <span>{entry.estimated ? 'Current Cost Explorer estimate' : 'Finalized invoice row'}</span>
                    <b>{formatCurrencyAmount(entry.amount, currency)}</b>
                  </div>
                ) : null;
              }}
            />
            <Line
              type="linear"
              dataKey="finalizedAmount"
              stroke="var(--color-accent-bright)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="estimatedAmount"
              stroke="var(--color-warning)"
              strokeDasharray="5 4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function BizOpsDashboardPage() {
  useScrollToTopOnMount();
  const dashboardQuery = useQuery({
    queryKey: ['admin', 'biz-ops-dashboard', 'monthly-service-trends'],
    queryFn: ({ signal }) => fetchBizOpsDashboard(signal),
    staleTime: 5 * 60 * 1000,
  });

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Loading business operations dashboard..." />;
  }

  const analytics = dashboardQuery.data;
  if (!analytics || dashboardQuery.isError) {
    return (
      <EmptyState
        title="Biz Ops Dashboard unavailable"
        message="Excelsior could not load the protected AWS cost snapshot."
      />
    );
  }

  const chartData = buildMonthlyChartData(analytics);
  const maximumCost = Math.max(...chartData.map((entry) => entry.amount), 1);
  const chartMaximum = Math.max(25, Math.ceil(maximumCost / 25) * 25);
  const maximumServiceCost = Math.max(...analytics.serviceCosts.map((entry) => entry.amount), 1);
  const serviceTrendStartMonth = analytics.serviceTrends[0]?.points.slice(-12)[0]?.month
    ?? analytics.currentMonth.month;
  const paceDirection = analytics.currentMonth.projectedDeltaPercentage <= 0 ? 'below' : 'above';

  return (
    <div className="biz-ops-page">
      <article className="biz-ops-dashboard">
        <header className="biz-ops-hero">
          <div className="biz-ops-title-block">
            <div className="biz-ops-title-icon" aria-hidden="true"><IconChartBar /></div>
            <div>
              <div className="biz-ops-eyebrow">EXCELSIOR · BUSINESS OPERATIONS</div>
              <h1>Biz Ops Dashboard</h1>
              <p>Finalized AWS invoices plus the current Cost Explorer estimate.</p>
            </div>
          </div>
          <Card className="biz-ops-ytd-card">
            <span>{analytics.yearToDate.year} tracked spend</span>
            <strong>{formatCurrencyAmount(analytics.yearToDate.trackedTotal, analytics.currency)}</strong>
            <small>
              {formatCurrencyAmount(analytics.yearToDate.finalizedTotal, analytics.currency)} final +{' '}
              {formatCurrencyAmount(analytics.yearToDate.estimatedTotal, analytics.currency)} estimated
            </small>
          </Card>
        </header>

        <section className="biz-ops-kpis" aria-label="AWS cost summary">
          <Card className="biz-ops-kpi-card">
            <div className="biz-ops-kpi-heading">
              <span>{formatMonth(analytics.currentMonth.month)} MTD</span>
              <span className="biz-ops-badge biz-ops-badge--estimated">Estimated</span>
            </div>
            <strong>{formatCurrencyAmount(analytics.currentMonth.estimatedTotal, analytics.currency)}</strong>
            <p>
              Through {formatDay(analytics.currentMonth.throughDate)} ·{' '}
              <b>{analytics.currentMonth.percentOfPrevious.toFixed(1)}%</b> of the previous final invoice
            </p>
          </Card>

          <Card className="biz-ops-kpi-card">
            <div className="biz-ops-kpi-heading">
              <span>{formatMonth(analytics.currentMonth.previousFinalizedMonth)} invoice</span>
              <span className="biz-ops-badge biz-ops-badge--final">Final</span>
            </div>
            <strong>{formatCurrencyAmount(analytics.currentMonth.previousFinalizedTotal, analytics.currency)}</strong>
            <p>
              {analytics.currentMonth.previousIsHistoricHigh
                ? `Highest finalized month in the ${analytics.coverage.finalizedInvoiceCount}-invoice history`
                : 'Most recent finalized AWS invoice'}
            </p>
          </Card>

          <Card className="biz-ops-kpi-card">
            <div className="biz-ops-kpi-heading">
              <span>Current daily average</span>
              <span className="biz-ops-badge biz-ops-badge--estimated">Pace</span>
            </div>
            <strong>{formatCurrencyAmount(analytics.currentMonth.dailyAverage, analytics.currency)}</strong>
            <p>
              Simple month-end pace: <b>{formatCurrencyAmount(analytics.currentMonth.projectedTotal, analytics.currency)}</b>
              {' '}· {Math.abs(analytics.currentMonth.projectedDeltaPercentage).toFixed(1)}% {paceDirection} the previous month
            </p>
          </Card>
        </section>

        <section className="biz-ops-main-grid">
          <Card className="biz-ops-panel biz-ops-trend-panel">
            <div className="biz-ops-panel-heading">
              <div>
                <h2>Monthly hosting cost</h2>
                <p>{formatMonth(chartData[0]?.month ?? analytics.currentMonth.month)}–{formatMonth(analytics.currentMonth.month)} · {analytics.currency}</p>
              </div>
              <div className="biz-ops-legend" aria-label="Cost chart legend">
                <span><i className="is-final" />Final invoice</span>
                <span><i className="is-estimate" />MTD estimate</span>
              </div>
            </div>
            <div
              className="biz-ops-cost-chart"
              role="img"
              aria-label={`Monthly finalized AWS costs through ${formatMonth(analytics.currentMonth.previousFinalizedMonth)}, plus an estimate of ${formatCurrencyAmount(analytics.currentMonth.estimatedTotal, analytics.currency)} through ${formatDay(analytics.currentMonth.throughDate)}.`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 12, left: 2, bottom: 4 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="month"
                    minTickGap={28}
                    tickFormatter={(month: string) => formatMonth(month, false)}
                    axisLine={{ stroke: 'var(--color-border-strong)' }}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, chartMaximum]}
                    tickCount={5}
                    tickFormatter={(value: number) => formatCurrencyAmount(value, analytics.currency)}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-border-accent)', strokeWidth: 1 }}
                    content={({ active, payload }) => {
                      const entry = payload?.[0]?.payload as MonthlyChartDatum | undefined;
                      return active && entry ? (
                        <div className="biz-ops-chart-tooltip">
                          <strong>{formatMonth(entry.month)}</strong>
                          <span>{entry.estimated ? `Estimate through ${formatDay(analytics.currentMonth.throughDate)}` : 'Final invoice'}</span>
                          <b>{formatCurrencyAmount(entry.amount, analytics.currency)}</b>
                          {entry.changeFromPrevious !== null ? (
                            <small>{entry.changeFromPrevious >= 0 ? '+' : ''}{entry.changeFromPrevious.toFixed(1)}% from prior month</small>
                          ) : null}
                        </div>
                      ) : null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="finalizedAmount"
                    stroke="var(--color-accent-bright)"
                    fill="var(--color-accent-soft)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimatedAmount"
                    stroke="var(--color-warning)"
                    strokeDasharray="5 4"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: 'var(--color-bg-panel)', strokeWidth: 2 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="biz-ops-panel biz-ops-service-panel">
            <div className="biz-ops-panel-heading">
              <div>
                <h2>{formatMonth(analytics.currentMonth.month)} by service</h2>
                <p>Estimated through {formatDay(analytics.currentMonth.throughDate)}</p>
              </div>
              <span className="biz-ops-badge biz-ops-badge--estimated">{analytics.serviceCosts.length} active</span>
            </div>
            <div className="biz-ops-service-list" aria-label="Current AWS cost by service">
              {analytics.serviceCosts.map((service, index) => {
                const tooltipId = `biz-ops-service-tooltip-${index}`;
                return (
                  <div
                    className="biz-ops-service-row"
                    key={service.service}
                    tabIndex={0}
                    aria-describedby={tooltipId}
                  >
                    <div className="biz-ops-service-meta">
                      <span>{SERVICE_LABELS[service.service] ?? service.service}</span>
                      <span>{formatCurrencyAmount(service.amount, analytics.currency)} · <b>{service.percentage.toFixed(1)}%</b></span>
                    </div>
                    <div className="biz-ops-service-track" aria-hidden="true">
                      <i style={{ width: `${Math.max(0.6, (service.amount / maximumServiceCost) * 100)}%` }} />
                    </div>
                    <div className="biz-ops-service-tooltip" id={tooltipId} role="tooltip">
                      <strong>{service.service}</strong>
                      <span>{formatCurrencyAmount(service.amount, analytics.currency)} month to date</span>
                      <span>{service.percentage.toFixed(1)}% of current estimated spend</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="biz-ops-service-trends" aria-labelledby="biz-ops-service-trends-title">
          <div className="biz-ops-section-heading">
            <div>
              <h2 id="biz-ops-service-trends-title">Monthly cost by service</h2>
              <p>
                {formatMonth(serviceTrendStartMonth)}–{formatMonth(analytics.currentMonth.month)} · Rolling 12-month service-row values
              </p>
            </div>
            <span>Hover a chart for the exact monthly dollar amount</span>
          </div>
          <div className="biz-ops-service-trend-grid">
            {analytics.serviceTrends.map((trend) => (
              <ServiceTrendChart key={trend.service} trend={trend} currency={analytics.currency} />
            ))}
          </div>
        </section>

        <footer className="biz-ops-footer">
          <div>
            <span>
              {analytics.coverage.finalizedInvoiceCount} finalized invoices ·{' '}
              {formatMonth(analytics.coverage.finalizedPeriodStart)}–{formatMonth(analytics.coverage.finalizedPeriodEnd)}
            </span>
            {analytics.latestWeeklyDigest ? (
              <span>
                Latest weekly digest: {formatCurrencyAmount(analytics.latestWeeklyDigest.amount, analytics.currency)} ·{' '}
                {formatDay(analytics.latestWeeklyDigest.periodStart)}–{formatDay(analytics.latestWeeklyDigest.periodEnd)}
              </span>
            ) : null}
          </div>
          <span>{analytics.currency} · Estimated charges may change before invoicing</span>
        </footer>
      </article>
    </div>
  );
}
