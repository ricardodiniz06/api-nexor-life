import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IngestedEvent, IngestedEventDocument } from './schemas/ingested-event.schema';

export interface IngestEventDto {
  systemKey: string;
  patientRecordNumber: string;
  patientName: string;
  eventType: string;
  sector: string;
  attendingPhysician?: string;
  insuranceName?: string;
  rawPayload?: Record<string, any>;
  costEstimated?: number;
  attendanceDurationMinutes?: number;
  eventDate?: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(IngestedEvent.name)
    private readonly ingestedEventModel: Model<IngestedEventDocument>,
  ) {}

  async recordEvent(dto: IngestEventDto): Promise<IngestedEvent> {
    const created = new this.ingestedEventModel({
      ...dto,
      rawPayload: dto.rawPayload || {},
      costEstimated: dto.costEstimated ?? Math.floor(Math.random() * 800 + 150),
      attendanceDurationMinutes: dto.attendanceDurationMinutes ?? Math.floor(Math.random() * 45 + 15),
      eventDate: dto.eventDate || new Date(),
    });
    return created.save();
  }

  async getIndicators() {
    // 1. Total eventos por sistema legado
    const volumeBySystem = await this.ingestedEventModel.aggregate([
      { $group: { _id: '$systemKey', total: { $sum: 1 } } },
      { $project: { system: '$_id', total: 1, _id: 0 } },
    ]);

    // 2. Distribuição por Setor
    const distributionBySector = await this.ingestedEventModel.aggregate([
      { $group: { _id: '$sector', total: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$total', _id: 0 } },
    ]);

    // 3. Tempo Médio de Atendimento (TME) e Custo Médio Geral
    const averages = await this.ingestedEventModel.aggregate([
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$attendanceDurationMinutes' },
          avgCost: { $avg: '$costEstimated' },
          totalEvents: { $sum: 1 },
        },
      },
    ]);

    // 4. Performance e Ocupação por Setor
    const sectorStats = await this.ingestedEventModel.aggregate([
      {
        $group: {
          _id: '$sector',
          total: { $sum: 1 },
          avgCost: { $avg: '$costEstimated' },
        },
      },
    ]);

    const stats = averages[0] || {
      avgDuration: 32,
      avgCost: 2840,
      totalEvents: 0,
    };

    return {
      totalSimulatedEvents: stats.totalEvents,
      averageDurationMinutes: Math.round(stats.avgDuration || 32),
      averageCostFormatted: `R$ ${(stats.avgCost || 2840).toFixed(0)}`,
      volumeBySystem: volumeBySystem.length > 0 ? volumeBySystem : [
        { system: 'TASY', total: 24 },
        { system: 'ESUS', total: 18 },
        { system: 'TOTVS', total: 12 },
      ],
      departmentDistribution: distributionBySector.length > 0 ? distributionBySector : [
        { name: 'UTI', value: 8 },
        { name: 'Enfermaria', value: 16 },
        { name: 'Ambulatório', value: 22 },
        { name: 'Emergência', value: 9 },
      ],
      sectorPerformance: sectorStats.map((s) => ({
        name: s._id || 'Geral',
        atual: Math.min(Math.round(s.total * 8), 95),
        meta: 80,
        status: (s.total * 8) > 80 ? 'above' : 'below',
      })),
    };
  }

  async getReportsData(query: { from?: string; to?: string; category?: string }) {
    const filter: Record<string, any> = {};
    if (query.from || query.to) {
      filter.eventDate = {};
      if (query.from) filter.eventDate.$gte = new Date(query.from);
      if (query.to) filter.eventDate.$lte = new Date(query.to);
    }

    const events = await this.ingestedEventModel
      .find(filter)
      .sort({ eventDate: -1 })
      .limit(100)
      .lean();

    return {
      totalFound: events.length,
      period: { from: query.from || 'Início', to: query.to || 'Hoje' },
      items: events.map((e) => ({
        id: e._id,
        system: e.systemKey,
        patient: e.patientName,
        record: e.patientRecordNumber,
        type: e.eventType,
        sector: e.sector,
        cost: `R$ ${e.costEstimated?.toFixed(2) || '0.00'}`,
        duration: `${e.attendanceDurationMinutes || 30} min`,
        date: e.eventDate,
      })),
    };
  }
}
