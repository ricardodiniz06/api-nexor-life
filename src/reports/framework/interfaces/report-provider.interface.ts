import { type ReportContext } from '../types/report-context.type';
import { type ReportDefinition } from '../types/report-definition.type';
import { type ReportResult } from '../types/report-result.type';
import { type IReportQuery } from '../types/report-query.type';

/**
 * Contrato que todo relatório concreto deve implementar.
 * Novos relatórios = nova classe + registro no ReportsModule (plug-in).
 */
export interface ReportProvider<
  TRow extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly definition: ReportDefinition;

  execute(
    query: IReportQuery,
    context: ReportContext,
  ): Promise<ReportResult<TRow>>;
}
