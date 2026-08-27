import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string | null;
  userName: string;
  userRole?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  patientRecordNumber?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  legalBasis?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const entry = this.auditRepo.create({
      userId: dto.userId ?? null,
      userName: dto.userName || 'Sistema',
      userRole: dto.userRole ?? null,
      action: dto.action,
      resource: dto.resource,
      resourceId: dto.resourceId ?? null,
      patientRecordNumber: dto.patientRecordNumber ?? null,
      details: dto.details ?? null,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      legalBasis: dto.legalBasis ?? 'TUTELA_DA_SAUDE',
    });
    return this.auditRepo.save(entry);
  }

  async findAll(limit = 50, page = 1): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total };
  }
}
