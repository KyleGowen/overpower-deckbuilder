import { api } from './client';

export interface BizOpsDashboardData {
  generatedAt: string;
  currency: string;
  coverage: {
    finalizedInvoiceCount: number;
    finalizedPeriodStart: string;
    finalizedPeriodEnd: string;
  };
  currentMonth: {
    month: string;
    throughDate: string;
    estimatedTotal: number;
    dailyAverage: number;
    projectedTotal: number;
    previousFinalizedMonth: string;
    previousFinalizedTotal: number;
    percentOfPrevious: number;
    projectedDeltaPercentage: number;
    previousIsHistoricHigh: boolean;
  };
  yearToDate: {
    year: number;
    finalizedTotal: number;
    estimatedTotal: number;
    trackedTotal: number;
  };
  monthlyCosts: Array<{ month: string; amount: number; estimated: boolean }>;
  serviceCosts: Array<{ service: string; amount: number; percentage: number }>;
  serviceTrends: Array<{
    service: string;
    currentAmount: number;
    points: Array<{ month: string; amount: number; estimated: boolean }>;
  }>;
  latestWeeklyDigest: {
    periodStart: string;
    periodEnd: string;
    amount: number;
  } | null;
}

function hasValidServiceTrends(data: BizOpsDashboardData): boolean {
  return Array.isArray(data.serviceTrends) && data.serviceTrends.every((trend) => (
    typeof trend.service === 'string'
    && Number.isFinite(trend.currentAmount)
    && Array.isArray(trend.points)
    && trend.points.every((point) => (
      /^\d{4}-\d{2}$/.test(point.month)
      && Number.isFinite(point.amount)
      && typeof point.estimated === 'boolean'
    ))
  ));
}

export async function fetchBizOpsDashboard(signal?: AbortSignal): Promise<BizOpsDashboardData> {
  const data = await api.get<BizOpsDashboardData>('/api/v1/admin/biz-ops-dashboard', signal);
  if (!hasValidServiceTrends(data)) {
    throw new Error('Biz Ops service trend payload is unavailable or out of date');
  }
  return data;
}
