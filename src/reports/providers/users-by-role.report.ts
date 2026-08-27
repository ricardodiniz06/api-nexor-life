import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../iam/entities/user.entity';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { type ReportProvider } from '../framework/interfaces/report-provider.interface';
import { type ReportContext } from '../framework/types/report-context.type';
import { type ReportDefinition } from '../framework/types/report-definition.type';
import { type IReportQuery } from '../framework/types/report-query.type';
import { type ReportResult } from '../framework/types/report-result.type';

export type UsersByRoleRow = {
  roleName: string;
  total: number;
  activeUsers: number;
};

@Injectable()
export class UsersByRoleReport implements ReportProvider<UsersByRoleRow> {
  readonly definition: ReportDefinition = {
    key: 'users-by-role',
    name: 'Utilizadores por papel',
    description:
      'Quantidade de utilizadores associados a cada papel RBAC do sistema.',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    columns: [
      { key: 'roleName', label: 'Papel', type: 'string' },
      { key: 'total', label: 'Total', type: 'number' },
      { key: 'activeUsers', label: 'Utilizadores ativos', type: 'number' },
    ],
    filterFields: {
      isActive: {
        type: 'boolean',
        description: 'Filtrar utilizadores ativos (true) ou inativos (false)',
      },
    },
  };

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async execute(
    query: IReportQuery,
    context: ReportContext,
  ): Promise<ReportResult<UsersByRoleRow>> {
    const qb = this.users
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'r')
      .select('r.name', 'roleName')
      .addSelect('COUNT(DISTINCT u.id)', 'total')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END)',
        'activeUsers',
      )
      .where('u.deleted_at IS NULL')
      .groupBy('r.name')
      .orderBy('r.name', 'ASC');

    if (query.filter?.isActive !== undefined) {
      qb.andWhere('u.is_active = :isActive', {
        isActive: query.filter.isActive === 'true',
      });
    }

    const raw = await qb.getRawMany<{
      roleName: string;
      total: string;
      activeUsers: string;
    }>();

    const rows: UsersByRoleRow[] = raw.map((row) => ({
      roleName: row.roleName,
      total: Number(row.total),
      activeUsers: Number(row.activeUsers),
    }));

    return {
      rows,
      meta: {
        generatedAt: context.requestedAt.toISOString(),
        rowCount: rows.length,
        filters: query.filter,
      },
    };
  }
}
