import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

export enum RecordEntryType {
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  DIAGNOSIS = 'diagnosis',
  MEDICATION = 'medication',
  EXAM = 'exam',
}

@Entity('medical_record_entries')
@Index('IDX_medical_record_patient', ['patientId'])
export class MedicalRecordEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, (patient) => patient.records, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ type: 'enum', enum: RecordEntryType, default: RecordEntryType.CONSULTATION })
  type!: RecordEntryType;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'icd_code', type: 'varchar', length: 20, nullable: true })
  icdCode!: string | null;

  @Column({ name: 'icd_description', type: 'varchar', length: 250, nullable: true })
  icdDescription!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  prescriptions!: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
  }> | null;

  @Column({ name: 'professional_name', type: 'varchar', length: 200 })
  professionalName!: string;

  @Column({ name: 'professional_council', type: 'varchar', length: 50, nullable: true })
  professionalCouncil!: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Ambulatório' })
  sector!: string;

  @Column({ name: 'event_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  eventDate!: Date;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked!: boolean;

  @Column({ name: 'origin_system', type: 'varchar', length: 50, default: 'NEXOR' })
  originSystem!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
