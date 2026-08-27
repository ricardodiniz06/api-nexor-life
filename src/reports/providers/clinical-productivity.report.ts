import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordEntry } from '../../patients/entities/medical-record-entry.entity';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { type ReportProvider } from '../framework/interfaces/report-provider.interface';
import { type ReportContext } from '../framework/types/report-context.type';
import { type ReportDefinition } from '../framework/types/report-definition.type';
import { type IReportQuery } from '../framework/types/report-query.type';
import { type ReportResult } from '../framework/types/report-result.type';

export type ClinicalProductivityRow = {
  physicianName: string;
  totalConsultations: number;
  totalPrescriptions: number;
  totalExams: number;
  diagnosesRecorded: number;
  averageNotesLength: number;
};

@Injectable()
export class ClinicalProductivityReport
  implements ReportProvider<ClinicalProductivityRow>
{
  readonly definition: ReportDefinition = {
    key: 'clinical-productivity',
    name: 'Produtividade Médica & Evoluções Clínicas',
    description:
      'Consolidado de atendimentos, prescrições, laudos de exames e diagnósticos registrados pelos profissionais assistentes.',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    supportsDateRange: true,
    filterFields: {
      physicianName: { type: 'string' },
      type: { type: 'string' },
    },
    columns: [
      { key: 'physicianName', label: 'Profissional / Médico', type: 'string' },
      { key: 'totalConsultations', label: 'Consultas Realizadas', type: 'number' },
      { key: 'totalPrescriptions', label: 'Prescrições Emitidas', type: 'number' },
      { key: 'totalExams', label: 'Exames Solicitados/Laudados', type: 'number' },
      { key: 'diagnosesRecorded', label: 'Diagnósticos CID', type: 'number' },
      { key: 'averageNotesLength', label: 'Extensão Média (Carac.)', type: 'number' },
    ],
  };

  constructor(
    @InjectRepository(MedicalRecordEntry)
    private readonly entryRepo: Repository<MedicalRecordEntry>,
  ) {}

  async execute(
    query: IReportQuery,
    _context: ReportContext,
  ): Promise<ReportResult<ClinicalProductivityRow>> {
    const qb = this.entryRepo
      .createQueryBuilder('e')
      .select('COALESCE(e.professionalName, \'Corpo Clínico Plantonista\')', 'physicianName')
      .addSelect(
        'COUNT(CASE WHEN e.type = \'consultation\' THEN 1 END)',
        'totalConsultations',
      )
      .addSelect(
        'COUNT(CASE WHEN e.type = \'medication\' OR e.prescriptions IS NOT NULL THEN 1 END)',
        'totalPrescriptions',
      )
      .addSelect(
        'COUNT(CASE WHEN e.type = \'exam\' OR e.type = \'procedure\' THEN 1 END)',
        'totalExams',
      )
      .addSelect('COUNT(e.icdCode)', 'diagnosesRecorded')
      .addSelect('COALESCE(ROUND(AVG(LENGTH(COALESCE(e.notes, e.description)))), 120)', 'averageNotesLength')
      .groupBy('COALESCE(e.professionalName, \'Corpo Clínico Plantonista\')');

    if (query.filter?.physicianName) {
      qb.andWhere('e.professionalName ILIKE :pName', {
        pName: `%${query.filter.physicianName}%`,
      });
    }
    if (query.from) {
      qb.andWhere('e.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('e.createdAt <= :to', { to: query.to });
    }

    const raw = await qb.getRawMany();

    const rows: ClinicalProductivityRow[] = raw.map((r) => ({
      physicianName: r.physicianName,
      totalConsultations: Number(r.totalConsultations) || 0,
      totalPrescriptions: Number(r.totalPrescriptions) || 0,
      totalExams: Number(r.totalExams) || 0,
      diagnosesRecorded: Number(r.diagnosesRecorded) || 0,
      averageNotesLength: Number(r.averageNotesLength) || 120,
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
