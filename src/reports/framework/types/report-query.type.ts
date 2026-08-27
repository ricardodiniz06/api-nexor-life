export type ReportOutputFormat = 'json' | 'csv';

/** Parâmetros extraídos da query string pelo decorator @ReportQuery(). */
export type IReportQuery = {
  filter?: Record<string, string>;
  from?: string;
  to?: string;
  format: ReportOutputFormat;
};
