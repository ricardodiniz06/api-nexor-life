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

export type ConveniosByStateRow = {
  state: string;
  total: number;
  active: number;
  inactive: number;
};

@Injectable()
export class ConveniosByStateReport implements ReportProvider<ConveniosByStateRow> {
  readonly definition: ReportDefinition = {
    key: 'convenios-by-state',
    name: 'Convênios por UF',
    description:
      'Quantidade de convênios agrupados por unidade federativa (estado).',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    columns: [
      { key: 'state', label: 'UF', type: 'string' },
      { key: 'total', label: 'Total', type: 'number' },
      { key: 'active', label: 'Ativos', type: 'number' },
      { key: 'inactive', label: 'Inativos', type: 'number' },
    ],
    filterFields: {
      isActive: {
        type: 'boolean',
        description: 'Filtrar apenas ativos (true) ou inativos (false)',
      },
      state: {
        type: 'string',
        description: 'UF com 2 letras (ex.: SP)',
      },
    },
    supportsDateRange: true,
  };

  constructor(
    @InjectRepository(Convenio)
    private readonly convenios: Repository<Convenio>,
  ) {}

  async execute(
    query: IReportQuery,
    context: ReportContext,
  ): Promise<ReportResult<ConveniosByStateRow>> {
    const qb = this.convenios
      .createQueryBuilder('c')
      .select('c.address_state', 'state')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN c.is_active = true THEN 1 ELSE 0 END)',
        'active',
      )
      .addSelect(
        'SUM(CASE WHEN c.is_active = false THEN 1 ELSE 0 END)',
        'inactive',
      )
      .groupBy('c.address_state')
      .orderBy('c.address_state', 'ASC');

    if (query.filter?.state) {
      qb.andWhere('c.address_state = :state', {
        state: query.filter.state.toUpperCase(),
      });
    }

    if (query.filter?.isActive !== undefined) {
      qb.andWhere('c.is_active = :isActive', {
        isActive: query.filter.isActive === 'true',
      });
    }

    if (query.from) {
      qb.andWhere('c.created_at >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('c.created_at <= :to', { to: query.to });
    }

    const raw = await qb.getRawMany<{
      state: string;
      total: string;
      active: string;
      inactive: string;
    }>();

    const rows: ConveniosByStateRow[] = raw.map((row) => ({
      state: row.state,
      total: Number(row.total),
      active: Number(row.active),
      inactive: Number(row.inactive),
    }));

    return {
      rows,
      meta: {
        generatedAt: context.requestedAt.toISOString(),
        rowCount: rows.length,
        filters: query.filter,
        from: query.from,
        to: query.to,
      },
    };
  }
}
