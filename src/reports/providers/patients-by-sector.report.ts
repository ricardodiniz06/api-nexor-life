import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { type ReportProvider } from '../framework/interfaces/report-provider.interface';
import { type ReportContext } from '../framework/types/report-context.type';
import { type ReportDefinition } from '../framework/types/report-definition.type';
import { type IReportQuery } from '../framework/types/report-query.type';
import { type ReportResult } from '../framework/types/report-result.type';

export type PatientsBySectorRow = {
  sector: string;
  totalPatients: number;
  criticalCases: number;
  averageAge: number;
  susPatients: number;
  privatePatients: number;
};

@Injectable()
export class PatientsBySectorReport implements ReportProvider<PatientsBySectorRow> {
  readonly definition: ReportDefinition = {
    key: 'patients-by-sector',
    name: 'Censo de Pacientes por Setor & Gravidade',
    description:
      'Distribuição de pacientes internados/atendidos por unidade hospitalar, volume de casos críticos e divisão SUS vs. Convênio.',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    supportsDateRange: true,
    filterFields: {
      sector: { type: 'string' },
      status: { type: 'string' },
    },
    columns: [
      { key: 'sector', label: 'Setor Hospitalar', type: 'string' },
      { key: 'totalPatients', label: 'Total de Pacientes', type: 'number' },
      { key: 'criticalCases', label: 'Casos Críticos', type: 'number' },
      { key: 'averageAge', label: 'Média de Idade (Anos)', type: 'number' },
      { key: 'susPatients', label: 'Atendimentos SUS', type: 'number' },
      { key: 'privatePatients', label: 'Convênios Privados', type: 'number' },
    ],
  };

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async execute(
    query: IReportQuery,
    _context: ReportContext,
  ): Promise<ReportResult<PatientsBySectorRow>> {
    const qb = this.patientRepo
      .createQueryBuilder('p')
      .select('COALESCE(p.sector, \'Geral\')', 'sector')
      .addSelect('COUNT(p.id)', 'totalPatients')
      .addSelect(
        'COUNT(CASE WHEN p.status = \'CRITICAL\' OR p.allergies IS NOT NULL THEN 1 END)',
        'criticalCases',
      )
      .addSelect(
        'ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birthDate))))',
        'averageAge',
      )
      .addSelect(
        'COUNT(CASE WHEN p.insuranceName ILIKE \'%SUS%\' OR p.insuranceName IS NULL THEN 1 END)',
        'susPatients',
      )
      .addSelect(
        'COUNT(CASE WHEN p.insuranceName NOT ILIKE \'%SUS%\' AND p.insuranceName IS NOT NULL THEN 1 END)',
        'privatePatients',
      )
      .groupBy('COALESCE(p.sector, \'Geral\')');

    if (query.filter?.sector) {
      qb.andWhere('p.sector = :sector', { sector: query.filter.sector });
    }
    if (query.filter?.status) {
      qb.andWhere('p.status = :status', { status: query.filter.status });
    }
    if (query.from) {
      qb.andWhere('p.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('p.createdAt <= :to', { to: query.to });
    }

    const raw = await qb.getRawMany();

    const rows: PatientsBySectorRow[] = raw.map((r) => ({
      sector: r.sector,
      totalPatients: Number(r.totalPatients) || 0,
      criticalCases: Number(r.criticalCases) || 0,
      averageAge: Number(r.averageAge) || 42,
      susPatients: Number(r.susPatients) || 0,
      privatePatients: Number(r.privatePatients) || 0,
    }));

    return {
      rows,
      meta: {
        generatedAt: new Date().toISOString(),
        rowCount: rows.length,
        filters: query.filter,
        from: query.from,
        to: query.to,
      },
    };
  }
}
