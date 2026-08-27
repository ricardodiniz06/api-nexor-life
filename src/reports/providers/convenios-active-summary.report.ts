import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convenio } from '../../convenios/entities/convenio.entity';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { type ReportProvider } from '../framework/interfaces/report-provider.interface';
import { type ReportContext } from '../framework/types/report-context.type';
import { type ReportDefinition } from '../framework/types/report-definition.type';
import { type IReportQuery } from '../framework/types/report-query.type';
import { type ReportResult } from '../framework/types/report-result.type';

export type ConveniosActiveSummaryRow = {
  status: string;
  total: number;
};

@Injectable()
export class ConveniosActiveSummaryReport implements ReportProvider<ConveniosActiveSummaryRow> {
  readonly definition: ReportDefinition = {
    key: 'convenios-active-summary',
    name: 'Resumo de convênios (ativos/inativos)',
    description: 'Total de convênios agrupados por status de ativação.',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    columns: [
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'total', label: 'Total', type: 'number' },
    ],
    supportsDateRange: true,
  };

  constructor(
    @InjectRepository(Convenio)
    private readonly convenios: Repository<Convenio>,
  ) {}

  async execute(
    query: IReportQuery,
    context: ReportContext,
  ): Promise<ReportResult<ConveniosActiveSummaryRow>> {
    const qb = this.convenios
      .createQueryBuilder('c')
      .select(
        `CASE WHEN c.is_active = true THEN 'Ativo' ELSE 'Inativo' END`,
        'status',
      )
      .addSelect('COUNT(*)', 'total')
      .groupBy('c.is_active')
      .orderBy('c.is_active', 'DESC');

    if (query.from) {
      qb.andWhere('c.created_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('c.created_at <= :to', { to: query.to });
    }

    const raw = await qb.getRawMany<{ status: string; total: string }>();

    const rows: ConveniosActiveSummaryRow[] = raw.map((row) => ({
      status: row.status,
      total: Number(row.total),
    }));

    return {
      rows,
      meta: {
        generatedAt: context.requestedAt.toISOString(),
        rowCount: rows.length,
        from: query.from,
        to: query.to,
      },
    };
  }
}
