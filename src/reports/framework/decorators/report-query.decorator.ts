import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { parseFieldMapQuery } from '../../../common/dto/parse-field-map.query';
import {
  type IReportQuery,
  type ReportOutputFormat,
} from '../types/report-query.type';

function parseFormat(raw: unknown): ReportOutputFormat {
  if (raw === 'csv') {
    return 'csv';
  }
  if (raw === 'pdf') {
    return 'pdf';
  }
  return 'json';
}

/**
 * Extrai parâmetros comuns de relatórios da query string.
 * Padrão Nexor: `filter=state:SP,isActive:true&from=2026-01-01&to=2026-08-01&format=csv`
 */
export const ReportQuery = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IReportQuery => {
    const request = ctx.switchToHttp().getRequest<{
      query: Record<string, string | undefined>;
    }>();
    const q = request.query;

    return {
      filter: parseFieldMapQuery(q.filter),
      from:
        typeof q.from === 'string' && q.from.trim() ? q.from.trim() : undefined,
      to: typeof q.to === 'string' && q.to.trim() ? q.to.trim() : undefined,
      format: parseFormat(q.format),
    };
  },
);
