import { readFile } from 'fs/promises';
import path from 'path';

export interface AwsCostLedgerRow {
  sourceType: string;
  sourceId: string;
  reportName: string;
  generatedAtUtc: string | null;
  periodStart: string;
  periodEnd: string;
  granularity: string;
  normalizedRowLabel: string;
  columnLabel: string;
  billingMonth: string;
  amount: number;
  currency: string;
  estimated: boolean;
  ingestedAtUtc: string;
}

export interface AwsCostLedgerReader {
  listRows(): Promise<AwsCostLedgerRow[]>;
}

function parseCsvRecords(contents: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (quoted) {
      if (character === '"') {
        if (contents[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      record.push(field);
      field = '';
    } else if (character === '\n') {
      record.push(field.endsWith('\r') ? field.slice(0, -1) : field);
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('AWS cost ledger contains an unterminated quoted field');
  if (field.length > 0 || record.length > 0) {
    record.push(field.endsWith('\r') ? field.slice(0, -1) : field);
    if (record.some((value) => value.length > 0)) records.push(record);
  }
  return records;
}

export function parseAwsCostLedgerCsv(contents: string): AwsCostLedgerRow[] {
  const records = parseCsvRecords(contents);
  const header = records.shift()?.map((value, index) => index === 0 ? value.replace(/^\uFEFF/, '') : value);
  if (!header) throw new Error('AWS cost ledger is empty');

  const requiredColumns = [
    'source_type',
    'source_id',
    'report_name',
    'generated_at_utc',
    'period_start',
    'period_end',
    'granularity',
    'normalized_row_label',
    'column_label',
    'billing_month',
    'amount',
    'currency',
    'estimated',
    'ingested_at_utc'
  ] as const;
  const positions = Object.fromEntries(requiredColumns.map((column) => [column, header.indexOf(column)])) as Record<
    typeof requiredColumns[number],
    number
  >;
  const missing = requiredColumns.filter((column) => positions[column] < 0);
  if (missing.length > 0) throw new Error(`AWS cost ledger is missing required columns: ${missing.join(', ')}`);

  return records.map((record, rowIndex) => {
    const value = (column: typeof requiredColumns[number]) => record[positions[column]] ?? '';
    const amount = Number(value('amount'));
    if (!Number.isFinite(amount)) throw new Error(`AWS cost ledger row ${rowIndex + 2} has an invalid amount`);
    return {
      sourceType: value('source_type'),
      sourceId: value('source_id'),
      reportName: value('report_name'),
      generatedAtUtc: value('generated_at_utc') || null,
      periodStart: value('period_start'),
      periodEnd: value('period_end'),
      granularity: value('granularity'),
      normalizedRowLabel: value('normalized_row_label'),
      columnLabel: value('column_label'),
      billingMonth: value('billing_month'),
      amount,
      currency: value('currency'),
      estimated: value('estimated').toLowerCase() === 'true',
      ingestedAtUtc: value('ingested_at_utc')
    };
  });
}

export class AwsCostLedgerRepository implements AwsCostLedgerReader {
  constructor(
    private readonly ledgerPath = path.resolve(process.cwd(), 'business-operations/metrics/aws-costs.csv')
  ) {}

  async listRows(): Promise<AwsCostLedgerRow[]> {
    return parseAwsCostLedgerCsv(await readFile(this.ledgerPath, 'utf8'));
  }
}
