import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IntegrationStatus {
  CONNECTED = 'connected',
  ERROR = 'error',
  SYNCING = 'syncing',
  DISCONNECTED = 'disconnected',
}

@Entity('integrations')
@Index('IDX_integration_system_key', ['systemKey'], { unique: true })
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'system_key', type: 'varchar', length: 50, unique: true })
  systemKey!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.CONNECTED,
  })
  status!: IntegrationStatus;

  @Column({ name: 'last_sync', type: 'timestamptz', nullable: true })
  lastSync!: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ name: 'total_synced_records', type: 'int', default: 0 })
  totalSyncedRecords!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
