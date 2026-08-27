import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationStatus } from './entities/integration.entity';
import {
  Patient,
  PatientGender,
  PatientStatus,
  LegalBasis,
  MedicalRecordEntry,
  RecordEntryType,
} from '../patients/entities';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepo: Repository<Integration>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(MedicalRecordEntry)
    private readonly recordRepo: Repository<MedicalRecordEntry>,
    private readonly auditService: AuditService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async seedDefaultIntegrations(): Promise<void> {
    const defaults = [
      {
        systemKey: 'ESUS',
        name: 'E-SUS',
        description: 'Sistema do Ministério da Saúde para gestão de dados em saúde pública e atenção básica.',
        status: IntegrationStatus.CONNECTED,
        isEnabled: true,
      },
      {
        systemKey: 'TASY',
        name: 'TASY',
        description: 'Sistema de gestão hospitalar integrado (prontuário eletrônico e internação).',
        status: IntegrationStatus.CONNECTED,
        isEnabled: true,
      },
      {
        systemKey: 'TOTVS',
        name: 'TOTVS Saúde',
        description: 'Integração com módulos de faturamento, convênios e gestão clínica.',
        status: IntegrationStatus.CONNECTED,
        isEnabled: true,
      },
      {
        systemKey: 'CFM',
        name: 'CFM Online',
        description: 'Validação de registros profissionais de médicos e especialistas junto ao Conselho.',
        status: IntegrationStatus.CONNECTED,
        isEnabled: true,
      },
      {
        systemKey: 'ANS',
        name: 'ANS',
        description: 'Portal de interoperabilidade TISS da Agência Nacional de Saúde Suplementar.',
        status: IntegrationStatus.CONNECTED,
        isEnabled: true,
      },
    ];

    for (const def of defaults) {
      const exists = await this.integrationRepo.findOne({ where: { systemKey: def.systemKey } });
      if (!exists) {
        await this.integrationRepo.save(this.integrationRepo.create(def));
      }
    }
  }

  async findAll(): Promise<Integration[]> {
    await this.seedDefaultIntegrations();
    return this.integrationRepo.find({ order: { name: 'ASC' } });
  }

  async toggleEnabled(id: string, isEnabled: boolean): Promise<Integration> {
    const integration = await this.integrationRepo.findOne({ where: { id } });
    if (!integration) throw new NotFoundException('Integração não encontrada.');
    integration.isEnabled = isEnabled;
    return this.integrationRepo.save(integration);
  }

  async sync(
    id: string,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<{ message: string; syncedRecords: number; integration: Integration }> {
    const integration = await this.integrationRepo.findOne({ where: { id } });
    if (!integration) throw new NotFoundException('Integração não encontrada.');

    // Simula a sincronização e ingestão de novos dados clínicos a partir do sistema legado
    const timestamp = Date.now().toString().slice(-4);
    const mockIngestedPatientName =
      integration.systemKey === 'ESUS'
        ? `Paciente SUS Ingerido #${timestamp}`
        : integration.systemKey === 'TASY'
        ? `Paciente Tasy Internação #${timestamp}`
        : `Paciente TOTVS Convênio #${timestamp}`;

    const newPatient = await this.patientRepo.save(
      this.patientRepo.create({
        recordNumber: `INT-${timestamp}`,
        name: mockIngestedPatientName,
        cpf: `999${timestamp}11`,
        dateOfBirth: '1988-10-15',
        gender: PatientGender.M,
        sector: integration.systemKey === 'TASY' ? 'UTI' : 'Ambulatório',
        status: integration.systemKey === 'TASY' ? PatientStatus.ADMITTED : PatientStatus.OUTPATIENT,
        attendingPhysician: `Dr. Plantonista (${integration.name})`,
        insuranceName: integration.systemKey === 'ESUS' ? 'SUS' : 'Unimed',
        legalBasis: LegalBasis.TUTELA_DA_SAUDE,
        originSystem: integration.systemKey,
      }),
    );

    await this.recordRepo.save(
      this.recordRepo.create({
        patientId: newPatient.id,
        type: RecordEntryType.CONSULTATION,
        title: `Ingestão Automática via ${integration.name}`,
        description: `Dados clínicos consolidados e importados com sucesso a partir do conector ${integration.name}.`,
        professionalName: `Conector ${integration.name}`,
        sector: newPatient.sector,
        originSystem: integration.systemKey,
      }),
    );

    integration.lastSync = new Date();
    integration.status = IntegrationStatus.CONNECTED;
    integration.totalSyncedRecords += 1;
    integration.lastError = null;
    const updated = await this.integrationRepo.save(integration);

    // Gravar no MongoDB para agrupamento analitico e relatorios
    await this.analyticsService.recordEvent({
      systemKey: integration.systemKey,
      patientRecordNumber: newPatient.recordNumber,
      patientName: newPatient.name,
      eventType: 'CONSULTATION',
      sector: newPatient.sector,
      attendingPhysician: newPatient.attendingPhysician ?? undefined,
      insuranceName: newPatient.insuranceName ?? undefined,
      rawPayload: {
        originId: timestamp,
        system: integration.name,
        legalBasis: newPatient.legalBasis,
      },
    });

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.CREATE,
        resource: 'INTEGRATION',
        resourceId: integration.id,
        details: `Sincronização manual acionada para o conector ${integration.name}. Gerou prontuário #${newPatient.recordNumber}`,
        ipAddress: ip,
        userAgent,
        legalBasis: 'TUTELA_DA_SAUDE',
      });
    }

    return {
      message: `Sincronização do sistema ${integration.name} realizada com sucesso!`,
      syncedRecords: 1,
      integration: updated,
    };
  }
}
