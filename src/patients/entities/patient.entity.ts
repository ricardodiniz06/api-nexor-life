import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecordEntry } from './medical-record-entry.entity';
import { PatientAllergy } from './patient-allergy.entity';
import { PatientRiskAlert } from './patient-risk-alert.entity';

export enum PatientStatus {
  ADMITTED = 'admitted',
  OUTPATIENT = 'outpatient',
  DISCHARGED = 'discharged',
  EMERGENCY = 'emergency',
}

export enum PatientGender {
  M = 'M',
  F = 'F',
  OTHER = 'OTHER',
}

export enum LegalBasis {
  TUTELA_DA_SAUDE = 'TUTELA_DA_SAUDE',
  OBRIGACAO_LEGAL = 'OBRIGACAO_LEGAL',
  CONSENTIMENTO = 'CONSENTIMENTO',
}

@Entity('patients')
@Index('IDX_patients_cpf', ['cpf'])
@Index('IDX_patients_record_number', ['recordNumber'], { unique: true })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'record_number', type: 'varchar', length: 30, unique: true })
  recordNumber!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ name: 'social_name', type: 'varchar', length: 200, nullable: true })
  socialName!: string | null;

  @Column({ type: 'varchar', length: 11, nullable: true })
  cpf!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rg!: string | null;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth!: string;

  @Column({ type: 'enum', enum: PatientGender, default: PatientGender.OTHER })
  gender!: PatientGender;

  @Column({ name: 'blood_type', type: 'varchar', length: 5, nullable: true })
  bloodType!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height!: number | null;

  @Column({ type: 'enum', enum: PatientStatus, default: PatientStatus.OUTPATIENT })
  status!: PatientStatus;

  @Column({ type: 'varchar', length: 100, default: 'Ambulatório' })
  sector!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bed!: string | null;

  @Column({ name: 'attending_physician', type: 'varchar', length: 200, nullable: true })
  attendingPhysician!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'convenio_id', type: 'uuid', nullable: true })
  convenioId!: string | null;

  @Column({ name: 'insurance_name', type: 'varchar', length: 100, default: 'SUS' })
  insuranceName!: string;

  @Column({ name: 'insurance_card_number', type: 'varchar', length: 50, nullable: true })
  insuranceCardNumber!: string | null;

  @Column({
    name: 'legal_basis',
    type: 'enum',
    enum: LegalBasis,
    default: LegalBasis.TUTELA_DA_SAUDE,
  })
  legalBasis!: LegalBasis;

  @Column({ name: 'origin_system', type: 'varchar', length: 50, default: 'NEXOR' })
  originSystem!: string;

  @Column({ name: 'external_id', type: 'varchar', length: 100, nullable: true })
  externalId!: string | null;

  @OneToMany(() => MedicalRecordEntry, (record) => record.patient)
  records!: MedicalRecordEntry[];

  @OneToMany(() => PatientAllergy, (allergy) => allergy.patient)
  allergies!: PatientAllergy[];

  @OneToMany(() => PatientRiskAlert, (alert) => alert.patient)
  riskAlerts!: PatientRiskAlert[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
