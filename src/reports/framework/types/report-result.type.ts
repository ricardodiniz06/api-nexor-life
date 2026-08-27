export type ReportResultMeta = {
  generatedAt: string;
  rowCount: number;
  filters?: Record<string, string>;
  from?: string;
  to?: string;
};

/** Resultado padronizado produzido por qualquer ReportProvider. */
export type ReportResult<TRow extends Record<string, unknown>> = {
  rows: TRow[];
  meta: ReportResultMeta;
};
