import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

export enum AllergySeverity {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}

@Entity('patient_allergies')
@Index('IDX_allergy_patient', ['patientId'])
export class PatientAllergy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, (patient) => patient.allergies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'enum', enum: AllergySeverity, default: AllergySeverity.MODERATE })
  severity!: AllergySeverity;

  @Column({ type: 'varchar', length: 250 })
  reaction!: string;

  @Column({ name: 'reported_date', type: 'varchar', length: 30 })
  reportedDate!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
