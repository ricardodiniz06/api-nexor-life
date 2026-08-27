import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PermissionAction } from '../../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../../iam/authorization/enums/permission-resource.enum';
import { IngestedEvent, IngestedEventDocument } from '../../analytics/schemas/ingested-event.schema';
import { type ReportProvider } from '../framework/interfaces/report-provider.interface';
import { type ReportContext } from '../framework/types/report-context.type';
import { type ReportDefinition } from '../framework/types/report-definition.type';
import { type IReportQuery } from '../framework/types/report-query.type';
import { type ReportResult } from '../framework/types/report-result.type';

export type InteroperabilityReportRow = {
  systemKey: string;
  systemName: string;
  totalEvents: number;
  avgDurationMinutes: number;
  totalEstimatedCost: number;
  avgEstimatedCost: number;
};

@Injectable()
export class InteroperabilityEventsReport implements ReportProvider<InteroperabilityReportRow> {
  readonly definition: ReportDefinition = {
    key: 'interoperability-events',
    name: 'Eventos de Interoperabilidade & Ingestão (MongoDB)',
    description:
      'Consolidação de volumetria, tempo médio e custos agregados por sistema externo sobre a base massiva de eventos.',
    permission: {
      resource: PermissionResource.REPORT,
      action: PermissionAction.READ,
    },
    supportsDateRange: true,
    filterFields: {
      systemKey: { type: 'string' },
      sector: { type: 'string' },
    },
    columns: [
      { key: 'systemKey', label: 'Código do Sistema', type: 'string' },
      { key: 'systemName', label: 'Nome do Sistema', type: 'string' },
      { key: 'totalEvents', label: 'Total de Eventos', type: 'number' },
      { key: 'avgDurationMinutes', label: 'Duração Média (min)', type: 'number' },
      { key: 'totalEstimatedCost', label: 'Custo Total Estimado (R$)', type: 'number' },
      { key: 'avgEstimatedCost', label: 'Custo Médio (R$)', type: 'number' },
    ],
  };

  constructor(
    @InjectModel(IngestedEvent.name)
    private readonly ingestedEventModel: Model<IngestedEventDocument>,
  ) {}

  async execute(
    query: IReportQuery,
    _context: ReportContext,
  ): Promise<ReportResult<InteroperabilityReportRow>> {
    const match: Record<string, any> = {};

    if (query.filter?.systemKey) {
      match.systemKey = query.filter.systemKey;
    }
    if (query.filter?.sector) {
      match.sector = query.filter.sector;
    }
    if (query.from || query.to) {
      match.eventDate = {};
      if (query.from) match.eventDate.$gte = new Date(query.from);
      if (query.to) match.eventDate.$lte = new Date(query.to);
    }

    const systemLabels: Record<string, string> = {
      TASY: 'TASY Hospitalar',
      ESUS: 'E-SUS Atenção Básica',
      TOTVS: 'TOTVS Saúde & Planos',
      CFM: 'CFM Validação Online',
      ANS: 'ANS Padrão TISS',
    };

    const aggregates = await this.ingestedEventModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$systemKey',
          totalEvents: { $sum: 1 },
          avgDuration: { $avg: '$attendanceDurationMinutes' },
          totalCost: { $sum: '$costEstimated' },
          avgCost: { $avg: '$costEstimated' },
        },
      },
      { $sort: { totalEvents: -1 } },
    ]);

    const rows: InteroperabilityReportRow[] = aggregates.map((agg) => ({
      systemKey: agg._id,
      systemName: systemLabels[agg._id] || agg._id,
      totalEvents: agg.totalEvents,
      avgDurationMinutes: Math.round(agg.avgDuration || 0),
      totalEstimatedCost: Math.round(agg.totalCost || 0),
      avgEstimatedCost: Math.round(agg.avgCost || 0),
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
