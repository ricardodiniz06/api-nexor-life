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

export enum RiskSeverity {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
}

@Entity('patient_risk_alerts')
@Index('IDX_risk_alert_patient', ['patientId'])
export class PatientRiskAlert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient, (patient) => patient.riskAlerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column({ type: 'varchar', length: 150 })
  type!: string;

  @Column({ type: 'enum', enum: RiskSeverity, default: RiskSeverity.MODERATE })
  severity!: RiskSeverity;

  @Column({ type: 'text' })
  description!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
