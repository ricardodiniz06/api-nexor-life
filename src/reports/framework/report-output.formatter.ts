import { type ReportColumn } from './types/report-definition.type';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return escapeCsvCell(JSON.stringify(value));
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
  return '';
}

/** Formata linhas tabulares em CSV usando as colunas declaradas no ReportDefinition. */
export function formatReportAsCsv(
  columns: ReportColumn[],
  rows: ReadonlyArray<Record<string, unknown>>,
): string {
  const header = columns.map((col) => escapeCsvCell(col.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(row[col.key])).join(','),
  );
  return [header, ...lines].join('\n');
}
