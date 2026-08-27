import { ForbiddenException, Injectable, StreamableFile } from '@nestjs/common';
import { hasPermission } from '../../iam/authorization/utils/permission-key.util';
import { type JwtPayload } from '../../iam/authentication/interfaces/jwt-payload.interface';
import { type ReportProvider } from './interfaces/report-provider.interface';
import { ReportQueryValidator } from './report-query.validator';
import { ReportRegistry } from './report-registry.service';
import { formatReportAsCsv } from './report-output.formatter';
import { type ReportDefinition } from './types/report-definition.type';
import { type ReportContext } from './types/report-context.type';
import {
  type IReportQuery,
  type ReportOutputFormat,
} from './types/report-query.type';
import { type ReportResult } from './types/report-result.type';

export type ReportExecutionResponse<TRow extends Record<string, unknown>> = {
  report: Pick<ReportDefinition, 'key' | 'name' | 'description' | 'columns'>;
  data: TRow[];
  meta: ReportResult<TRow>['meta'];
};

export type ReportRunResult<TRow extends Record<string, unknown>> =
  | { kind: 'json'; body: ReportExecutionResponse<TRow> }
  | { kind: 'csv'; file: StreamableFile; filename: string };

/**
 * Pipeline fixo do framework: resolver provider → permissão → validar query → executar → formatar.
 */
@Injectable()
export class ReportRunner {
  constructor(
    private readonly registry: ReportRegistry,
    private readonly queryValidator: ReportQueryValidator,
  ) {}

  listAccessibleDefinitions(user: JwtPayload): ReportDefinition[] {
    const granted = user.permissions ?? [];
    return this.registry
      .listDefinitions()
      .filter((definition) =>
        hasPermission(
          granted,
          definition.permission.resource,
          definition.permission.action,
        ),
      );
  }

  async run(
    key: string,
    query: IReportQuery,
    user: JwtPayload,
  ): Promise<ReportRunResult<Record<string, unknown>>> {
    const provider = this.registry.getProvider(key);
    this.assertPermission(user, provider);

    const validatedQuery = this.queryValidator.validate(
      provider.definition,
      query,
    );
    const context: ReportContext = {
      userId: user.sub,
      requestedAt: new Date(),
    };

    const result = await provider.execute(validatedQuery, context);
    return this.formatResult(
      provider.definition,
      result,
      validatedQuery.format,
    );
  }

  private assertPermission(user: JwtPayload, provider: ReportProvider): void {
    const { resource, action } = provider.definition.permission;
    const granted = user.permissions ?? [];
    if (!hasPermission(granted, resource, action)) {
      throw new ForbiddenException(
        `Sem permissão para executar o relatório "${provider.definition.key}"`,
      );
    }
  }

  private formatResult<TRow extends Record<string, unknown>>(
    definition: ReportDefinition,
    result: ReportResult<TRow>,
    format: ReportOutputFormat,
  ): ReportRunResult<TRow> {
    if (format === 'csv') {
      const csv = formatReportAsCsv(definition.columns, result.rows);
      const buffer = Buffer.from(csv, 'utf-8');
      const filename = `${definition.key}-${result.meta.generatedAt.slice(0, 10)}.csv`;
      return {
        kind: 'csv',
        filename,
        file: new StreamableFile(buffer, {
          type: 'text/csv; charset=utf-8',
          disposition: `attachment; filename="${filename}"`,
        }),
      };
    }

    return {
      kind: 'json',
      body: {
        report: {
          key: definition.key,
          name: definition.name,
          description: definition.description,
          columns: definition.columns,
        },
        data: result.rows,
        meta: result.meta,
      },
    };
  }
}
