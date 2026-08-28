export interface AdminBizOpsDashboardDto {
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
  monthlyCosts: Array<{
    month: string;
    amount: number;
    estimated: boolean;
  }>;
  serviceCosts: Array<{
    service: string;
    amount: number;
    percentage: number;
  }>;
  serviceTrends: Array<{
    service: string;
    currentAmount: number;
    points: Array<{
      month: string;
      amount: number;
      estimated: boolean;
    }>;
  }>;
  latestWeeklyDigest: {
    periodStart: string;
    periodEnd: string;
    amount: number;
  } | null;
}
