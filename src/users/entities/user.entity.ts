import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CLINICIAN = 'clinician',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  email!: string;

  /** Primeiro nome (API em português; coluna `nome`). */
  @Column({ type: 'varchar', length: 120, default: '' })
  nome!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  sobrenome!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'users_role_enum',
    default: UserRole.VIEWER,
  })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  /** Audit trail — who provisioned the account (nullable for bootstrap). */
  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;
}
