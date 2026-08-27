import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  ANONYMIZE = 'ANONYMIZE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

@Entity('audit_logs')
@Index('IDX_audit_created_at', ['createdAt'])
@Index('IDX_audit_user', ['userId'])
@Index('IDX_audit_resource', ['resource', 'resourceId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'user_name', type: 'varchar', length: 200 })
  userName!: string;

  @Column({ name: 'user_role', type: 'varchar', length: 50, nullable: true })
  userRole!: string | null;

  @Column({ type: 'enum', enum: AuditAction, default: AuditAction.READ })
  action!: AuditAction;

  @Column({ type: 'varchar', length: 100 })
  resource!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId!: string | null;

  @Column({ name: 'patient_record_number', type: 'varchar', length: 50, nullable: true })
  patientRecordNumber!: string | null;

  @Column({ type: 'text', nullable: true })
  details!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'legal_basis', type: 'varchar', length: 100, default: 'TUTELA_DA_SAUDE' })
  legalBasis!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
