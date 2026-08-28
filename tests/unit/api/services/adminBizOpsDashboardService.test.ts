import { AdminBizOpsDashboardService } from '../../../../src/api/services/adminBizOpsDashboardService';
import type { AwsCostLedgerRow } from '../../../../src/repository/AwsCostLedgerRepository';

function ledgerRow(overrides: Partial<AwsCostLedgerRow> = {}): AwsCostLedgerRow {
  return {
    sourceType: 'aws_invoice_pdf',
    sourceId: 'invoice',
    reportName: 'AWS invoice',
    generatedAtUtc: null,
    periodStart: '2026-07-01',
    periodEnd: '2026-08-01',
    granularity: 'monthly_invoice',
    normalizedRowLabel: 'Total costs',
    columnLabel: 'Final invoice',
    billingMonth: '2026-07',
    amount: 88.62,
    currency: 'USD',
    estimated: false,
    ingestedAtUtc: '2026-08-28T18:03:19Z',
    ...overrides
  };
}

describe('AdminBizOpsDashboardService', () => {
  it('aggregates finalized invoices, the current estimate, monthly service-row trends, and the latest weekly digest', async () => {
    const rows: AwsCostLedgerRow[] = [
      ledgerRow({ billingMonth: '2025-08', amount: 0.01 }),
      ledgerRow({ billingMonth: '2025-09', amount: 9.71 }),
      ledgerRow({ billingMonth: '2026-01', amount: 53.55 }),
      ledgerRow(),
      ledgerRow({ normalizedRowLabel: 'Amazon EC2 Container Registry (ECR)', amount: 6 }),
      ledgerRow({ normalizedRowLabel: 'Amazon Relational Database Service', amount: 3 }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-01', periodEnd: '2026-08-02',
        amount: 3, estimated: true, columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-02', periodEnd: '2026-08-03',
        amount: 4, estimated: true, columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-01', periodEnd: '2026-08-02',
        normalizedRowLabel: 'Amazon EC2 Container Registry (ECR)', amount: 4, estimated: true,
        columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-02', periodEnd: '2026-08-03',
        normalizedRowLabel: 'Amazon EC2 Container Registry (ECR)', amount: 1, estimated: true,
        columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-01', periodEnd: '2026-08-02',
        normalizedRowLabel: 'Amazon Relational Database Service', amount: 2, estimated: true,
        columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'email_pdf', sourceId: 'email', reportName: 'Excelsior Weekly Costs',
        granularity: 'weekly_report', billingMonth: '', periodStart: '2026-08-21', periodEnd: '2026-08-27',
        amount: 20.45, columnLabel: 'Total'
      })
    ];
    const service = new AdminBizOpsDashboardService({ listRows: async () => rows });

    const result = await service.getDashboard();

    expect(result).toMatchObject({
      generatedAt: '2026-08-28T18:03:19Z',
      currency: 'USD',
      coverage: {
        finalizedInvoiceCount: 4,
        finalizedPeriodStart: '2025-08',
        finalizedPeriodEnd: '2026-07'
      },
      currentMonth: {
        month: '2026-08',
        throughDate: '2026-08-02',
        estimatedTotal: 7,
        dailyAverage: 3.5,
        projectedTotal: 108.5,
        previousFinalizedTotal: 88.62,
        percentOfPrevious: 7.9,
        projectedDeltaPercentage: 22.4,
        previousIsHistoricHigh: true
      },
      yearToDate: {
        year: 2026,
        finalizedTotal: 142.17,
        estimatedTotal: 7,
        trackedTotal: 149.17
      },
      serviceCosts: [
        { service: 'Amazon EC2 Container Registry (ECR)', amount: 5, percentage: 71.4 },
        { service: 'Amazon Relational Database Service', amount: 2, percentage: 28.6 }
      ],
      latestWeeklyDigest: { periodStart: '2026-08-21', periodEnd: '2026-08-27', amount: 20.45 }
    });
    expect(result.serviceTrends).toEqual([
      {
        service: 'Amazon EC2 Container Registry (ECR)',
        currentAmount: 5,
        points: [
          { month: '2025-08', amount: 0, estimated: false },
          { month: '2025-09', amount: 0, estimated: false },
          { month: '2026-01', amount: 0, estimated: false },
          { month: '2026-07', amount: 6, estimated: false },
          { month: '2026-08', amount: 5, estimated: true }
        ]
      },
      {
        service: 'Amazon Relational Database Service',
        currentAmount: 2,
        points: [
          { month: '2025-08', amount: 0, estimated: false },
          { month: '2025-09', amount: 0, estimated: false },
          { month: '2026-01', amount: 0, estimated: false },
          { month: '2026-07', amount: 3, estimated: false },
          { month: '2026-08', amount: 2, estimated: true }
        ]
      }
    ]);
    expect(result.monthlyCosts.at(-1)).toEqual({ month: '2026-08', amount: 7, estimated: true });
  });

  it('fails closed when current Cost Explorer totals are absent', async () => {
    const service = new AdminBizOpsDashboardService({ listRows: async () => [ledgerRow()] });
    await expect(service.getDashboard()).rejects.toThrow('no current Cost Explorer month');
  });

  it('limits each service trend to the current month and previous eleven finalized months', async () => {
    const finalizedMonths = [
      '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
      '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'
    ];
    const rows = finalizedMonths.flatMap((billingMonth, index) => [
      ledgerRow({ billingMonth, amount: 20 + index }),
      ledgerRow({
        billingMonth,
        normalizedRowLabel: 'Amazon EC2 Container Registry (ECR)',
        amount: index + 1
      })
    ]);
    rows.push(
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-01', periodEnd: '2026-08-02',
        amount: 3, estimated: true, columnLabel: 'UnblendedCost'
      }),
      ledgerRow({
        sourceType: 'aws_cost_explorer', sourceId: 'ce', reportName: 'Cost Explorer',
        granularity: 'daily', billingMonth: '2026-08', periodStart: '2026-08-01', periodEnd: '2026-08-02',
        normalizedRowLabel: 'Amazon EC2 Container Registry (ECR)', amount: 3, estimated: true,
        columnLabel: 'UnblendedCost'
      })
    );
    const service = new AdminBizOpsDashboardService({ listRows: async () => rows });

    const result = await service.getDashboard();
    const trend = result.serviceTrends[0];

    expect(trend?.points).toHaveLength(12);
    expect(trend?.points.map((point) => point.month)).toEqual([
      ...finalizedMonths.slice(-11),
      '2026-08'
    ]);
    expect(trend?.points.at(-1)).toEqual({ month: '2026-08', amount: 3, estimated: true });
  });
});
