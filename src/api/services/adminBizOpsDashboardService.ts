import type { AdminBizOpsDashboardDto } from '../dto/v1/AdminBizOpsDashboardDto';
import type { AwsCostLedgerReader, AwsCostLedgerRow } from '../../repository/AwsCostLedgerRepository';

const TOTAL_COSTS_LABEL = 'Total costs';

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function sum(rows: AwsCostLedgerRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function previousDate(isoDate: string): string {
  const timestamp = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) throw new Error('AWS cost ledger contains an invalid reporting date');
  return new Date(timestamp - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function daysInMonth(month: string): number {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) throw new Error('AWS cost ledger contains an invalid billing month');
  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
}

export class AdminBizOpsDashboardService {
  constructor(
    private readonly ledgerRepository: AwsCostLedgerReader,
    private readonly now: () => Date = () => new Date()
  ) {}

  async getDashboard(): Promise<AdminBizOpsDashboardDto> {
    const rows = await this.ledgerRepository.listRows();
    const finalizedTotals = rows
      .filter((row) => row.sourceType === 'aws_invoice_pdf' && row.normalizedRowLabel === TOTAL_COSTS_LABEL)
      .sort((left, right) => left.billingMonth.localeCompare(right.billingMonth));
    if (finalizedTotals.length === 0) throw new Error('AWS cost ledger has no finalized invoice totals');

    const costExplorerRows = rows.filter((row) => row.sourceType === 'aws_cost_explorer' && row.granularity === 'daily');
    const currentMonth = costExplorerRows
      .map((row) => row.billingMonth)
      .filter(Boolean)
      .sort()
      .at(-1);
    if (!currentMonth) throw new Error('AWS cost ledger has no current Cost Explorer month');

    const currentRows = costExplorerRows.filter((row) => row.billingMonth === currentMonth);
    const currentTotalRows = currentRows.filter((row) => row.normalizedRowLabel === TOTAL_COSTS_LABEL);
    if (currentTotalRows.length === 0) throw new Error('AWS cost ledger has no current Cost Explorer total');

    const estimatedTotal = sum(currentTotalRows);
    const activeDays = new Set(currentTotalRows.map((row) => row.periodStart)).size;
    const dailyAverage = activeDays === 0 ? 0 : estimatedTotal / activeDays;
    const projectedTotal = dailyAverage * daysInMonth(currentMonth);
    const priorFinalized = finalizedTotals.filter((row) => row.billingMonth < currentMonth).at(-1);
    if (!priorFinalized) throw new Error('AWS cost ledger has no prior finalized invoice');

    const latestPeriodEnd = currentTotalRows.map((row) => row.periodEnd).sort().at(-1);
    if (!latestPeriodEnd) throw new Error('AWS cost ledger has no current reporting end date');

    const serviceTotals = new Map<string, number>();
    currentRows
      .filter((row) => row.normalizedRowLabel !== TOTAL_COSTS_LABEL)
      .forEach((row) => serviceTotals.set(
        row.normalizedRowLabel,
        (serviceTotals.get(row.normalizedRowLabel) ?? 0) + row.amount
      ));
    const serviceCosts = [...serviceTotals.entries()]
      .filter(([, amount]) => amount > 0)
      .sort((left, right) => right[1] - left[1])
      .map(([service, amount]) => ({
        service,
        amount: round(amount, 6),
        percentage: estimatedTotal === 0 ? 0 : round((amount / estimatedTotal) * 100, 1)
      }));
    const finalizedMonths = finalizedTotals
      .filter((row) => row.billingMonth < currentMonth)
      .map((row) => row.billingMonth)
      .slice(-11);
    const finalizedServiceRows = rows.filter((row) => (
      row.sourceType === 'aws_invoice_pdf'
      && row.normalizedRowLabel !== TOTAL_COSTS_LABEL
      && row.billingMonth < currentMonth
    ));
    const serviceTrends = serviceCosts.map((serviceCost) => {
      const finalizedAmounts = new Map<string, number>();
      finalizedServiceRows
        .filter((row) => row.normalizedRowLabel === serviceCost.service)
        .forEach((row) => finalizedAmounts.set(
          row.billingMonth,
          (finalizedAmounts.get(row.billingMonth) ?? 0) + row.amount
        ));
      return {
        service: serviceCost.service,
        currentAmount: serviceCost.amount,
        points: [
          ...finalizedMonths.map((month) => ({
            month,
            amount: round(finalizedAmounts.get(month) ?? 0, 6),
            estimated: false
          })),
          { month: currentMonth, amount: serviceCost.amount, estimated: true }
        ]
      };
    });

    const currentYear = Number(currentMonth.slice(0, 4));
    const finalizedYearTotal = sum(finalizedTotals.filter((row) => row.billingMonth.startsWith(`${currentYear}-`)));
    const previousHistoricHigh = priorFinalized.amount >= Math.max(...finalizedTotals.map((row) => row.amount));
    const monthlyCosts = finalizedTotals
      .filter((row) => row.billingMonth < currentMonth)
      .slice(-18)
      .map((row) => ({ month: row.billingMonth, amount: round(row.amount, 6), estimated: false }));
    monthlyCosts.push({ month: currentMonth, amount: round(estimatedTotal, 6), estimated: true });

    const weeklyDigest = rows
      .filter((row) => (
        row.sourceType === 'email_pdf'
        && row.normalizedRowLabel === TOTAL_COSTS_LABEL
        && row.columnLabel === 'Total'
      ))
      .sort((left, right) => left.periodEnd.localeCompare(right.periodEnd))
      .at(-1);
    const latestIngestedAt = rows.map((row) => row.ingestedAtUtc).filter(Boolean).sort().at(-1);

    return {
      generatedAt: latestIngestedAt || this.now().toISOString(),
      currency: currentTotalRows[0]?.currency || priorFinalized.currency,
      coverage: {
        finalizedInvoiceCount: finalizedTotals.length,
        finalizedPeriodStart: finalizedTotals[0]?.billingMonth ?? priorFinalized.billingMonth,
        finalizedPeriodEnd: finalizedTotals.at(-1)?.billingMonth ?? priorFinalized.billingMonth
      },
      currentMonth: {
        month: currentMonth,
        throughDate: previousDate(latestPeriodEnd),
        estimatedTotal: round(estimatedTotal, 6),
        dailyAverage: round(dailyAverage, 6),
        projectedTotal: round(projectedTotal, 6),
        previousFinalizedMonth: priorFinalized.billingMonth,
        previousFinalizedTotal: round(priorFinalized.amount, 6),
        percentOfPrevious: priorFinalized.amount === 0 ? 0 : round((estimatedTotal / priorFinalized.amount) * 100, 1),
        projectedDeltaPercentage: priorFinalized.amount === 0
          ? 0
          : round(((projectedTotal - priorFinalized.amount) / priorFinalized.amount) * 100, 1),
        previousIsHistoricHigh: previousHistoricHigh
      },
      yearToDate: {
        year: currentYear,
        finalizedTotal: round(finalizedYearTotal, 6),
        estimatedTotal: round(estimatedTotal, 6),
        trackedTotal: round(finalizedYearTotal + estimatedTotal, 6)
      },
      monthlyCosts,
      serviceCosts,
      serviceTrends,
      latestWeeklyDigest: weeklyDigest ? {
        periodStart: weeklyDigest.periodStart,
        periodEnd: weeklyDigest.periodEnd,
        amount: round(weeklyDigest.amount, 6)
      } : null
    };
  }
}
