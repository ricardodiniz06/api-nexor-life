import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, PatientStatus } from './entities/patient.entity';
import { MedicalRecordEntry } from './entities/medical-record-entry.entity';
import { PatientAllergy } from './entities/patient-allergy.entity';
import { PatientRiskAlert } from './entities/patient-risk-alert.entity';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { CreateMedicalRecordEntryDto } from './dto/medical-record-entry.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(MedicalRecordEntry)
    private readonly recordRepo: Repository<MedicalRecordEntry>,
    @InjectRepository(PatientAllergy)
    private readonly allergyRepo: Repository<PatientAllergy>,
    @InjectRepository(PatientRiskAlert)
    private readonly riskRepo: Repository<PatientRiskAlert>,
    private readonly auditService: AuditService,
  ) {}

  private generateRecordNumber(): string {
    const timestamp = Date.now().toString().slice(-5);
    const random = Math.floor(100 + Math.random() * 900);
    return `${timestamp}${random}`;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sector?: string;
    user?: { id: string; name: string; role?: string };
    ip?: string;
    userAgent?: string;
  }): Promise<{ data: Patient[]; total: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const qb = this.patientRepo.createQueryBuilder('p');

    if (params.search) {
      const s = `%${params.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(p.name) LIKE :s OR p.cpf LIKE :s OR p.record_number LIKE :s)',
        { s },
      );
    }

    if (params.status && params.status !== 'all') {
      qb.andWhere('p.status = :status', { status: params.status });
    }

    if (params.sector && params.sector !== 'all') {
      qb.andWhere('p.sector = :sector', { sector: params.sector });
    }

    qb.orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    if (params.user) {
      await this.auditService.log({
        userId: params.user.id,
        userName: params.user.name,
        userRole: params.user.role,
        action: AuditAction.READ,
        resource: 'PATIENT',
        details: `Consulta lista de pacientes (página ${page}, limit ${limit}, busca "${params.search || ''}")`,
        ipAddress: params.ip,
        userAgent: params.userAgent,
        legalBasis: 'TUTELA_DA_SAUDE',
      });
    }

    return { data, total };
  }

  async findById(
    id: string,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<Patient> {
    const patient = await this.patientRepo.findOne({
      where: { id },
      relations: ['records', 'allergies', 'riskAlerts'],
      order: { records: { eventDate: 'DESC' } },
    });

    if (!patient) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.READ,
        resource: 'PATIENT',
        resourceId: patient.id,
        patientRecordNumber: patient.recordNumber,
        details: `Visualização de dados cadastrais e clínicos do paciente ${patient.name}`,
        ipAddress: ip,
        userAgent,
        legalBasis: patient.legalBasis,
      });
    }

    return patient;
  }

  async create(
    dto: CreatePatientDto,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<Patient> {
    const recordNumber = this.generateRecordNumber();
    const cleanCpf = dto.cpf ? dto.cpf.replace(/\D/g, '') : null;

    const patient = this.patientRepo.create({
      ...dto,
      recordNumber,
      cpf: cleanCpf,
      status: dto.status || PatientStatus.OUTPATIENT,
      sector: dto.sector || 'Ambulatório',
    });

    const saved = await this.patientRepo.save(patient);

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.CREATE,
        resource: 'PATIENT',
        resourceId: saved.id,
        patientRecordNumber: saved.recordNumber,
        details: `Cadastro de novo paciente ${saved.name} (Prontuário #${saved.recordNumber})`,
        ipAddress: ip,
        userAgent,
        legalBasis: saved.legalBasis,
      });
    }

    return saved;
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<Patient> {
    const patient = await this.findById(id);
    const cleanCpf = dto.cpf ? dto.cpf.replace(/\D/g, '') : patient.cpf;

    Object.assign(patient, {
      ...dto,
      cpf: cleanCpf,
    });

    const saved = await this.patientRepo.save(patient);

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.UPDATE,
        resource: 'PATIENT',
        resourceId: saved.id,
        patientRecordNumber: saved.recordNumber,
        details: `Atualização cadastral do paciente ${saved.name}`,
        ipAddress: ip,
        userAgent,
        legalBasis: saved.legalBasis,
      });
    }

    return saved;
  }

  async addRecordEntry(
    patientId: string,
    dto: CreateMedicalRecordEntryDto,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<MedicalRecordEntry> {
    const patient = await this.findById(patientId);

    const entry = this.recordRepo.create({
      ...dto,
      patientId: patient.id,
      professionalName: dto.professionalName || user?.name || 'Profissional de Saúde',
      eventDate: dto.eventDate ? new Date(dto.eventDate) : new Date(),
    });

    const saved = await this.recordRepo.save(entry);

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.CREATE,
        resource: 'RECORD',
        resourceId: saved.id,
        patientRecordNumber: patient.recordNumber,
        details: `Inclusão de evolução clínica: "${saved.title}" (${saved.type})`,
        ipAddress: ip,
        userAgent,
        legalBasis: patient.legalBasis,
      });
    }

    return saved;
  }

  async getRecords(
    patientId: string,
    user?: { id: string; name: string; role?: string },
    ip?: string,
    userAgent?: string,
  ): Promise<MedicalRecordEntry[]> {
    const patient = await this.findById(patientId);

    const records = await this.recordRepo.find({
      where: { patientId: patient.id },
      order: { eventDate: 'DESC' },
    });

    if (user) {
      await this.auditService.log({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: AuditAction.READ,
        resource: 'RECORD',
        resourceId: patient.id,
        patientRecordNumber: patient.recordNumber,
        details: `Consulta da linha do tempo/prontuário do paciente ${patient.name}`,
        ipAddress: ip,
        userAgent,
        legalBasis: patient.legalBasis,
      });
    }

    return records;
  }
}
