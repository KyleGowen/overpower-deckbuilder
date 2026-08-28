import { parseAwsCostLedgerCsv } from '../../../src/repository/AwsCostLedgerRepository';

describe('parseAwsCostLedgerCsv', () => {
  it('parses quoted fields, escaped quotes, and numeric values without exposing unused ledger columns', () => {
    const rows = parseAwsCostLedgerCsv([
      'source_type,source_id,report_name,generated_at_utc,period_start,period_end,granularity,normalized_row_label,column_label,billing_month,amount,currency,estimated,ingested_at_utc',
      'aws_cost_explorer,ce-1,"AWS Cost Explorer, daily",,2026-08-01,2026-08-02,daily,"Service ""A""",UnblendedCost,2026-08,1.2345,USD,true,2026-08-28T17:23:45Z'
    ].join('\n'));

    expect(rows).toEqual([{
      sourceType: 'aws_cost_explorer',
      sourceId: 'ce-1',
      reportName: 'AWS Cost Explorer, daily',
      generatedAtUtc: null,
      periodStart: '2026-08-01',
      periodEnd: '2026-08-02',
      granularity: 'daily',
      normalizedRowLabel: 'Service "A"',
      columnLabel: 'UnblendedCost',
      billingMonth: '2026-08',
      amount: 1.2345,
      currency: 'USD',
      estimated: true,
      ingestedAtUtc: '2026-08-28T17:23:45Z'
    }]);
  });

  it('rejects ledgers without the required schema', () => {
    expect(() => parseAwsCostLedgerCsv('source_type,amount\naws_invoice_pdf,1.00'))
      .toThrow('missing required columns');
  });
});
