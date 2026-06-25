import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('convenios')
@Index('IDX_convenios_cnpj', ['cnpj'], { unique: true })
export class Convenio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cnpj!: string;

  @Column({ name: 'legal_name', type: 'varchar', length: 200 })
  legalName!: string;

  @Column({ name: 'trade_name', type: 'varchar', length: 200, nullable: true })
  tradeName!: string | null;

  @Column({ name: 'address_zip_code', type: 'varchar', length: 8 })
  addressZipCode!: string;

  @Column({ name: 'address_street', type: 'varchar', length: 200 })
  addressStreet!: string;

  @Column({ name: 'address_neighborhood', type: 'varchar', length: 120 })
  addressNeighborhood!: string;

  @Column({ name: 'address_number', type: 'varchar', length: 20 })
  addressNumber!: string;

  @Column({
    name: 'address_complement',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  addressComplement!: string | null;

  @Column({ name: 'address_city', type: 'varchar', length: 120 })
  addressCity!: string;

  @Column({ name: 'address_state', type: 'varchar', length: 2 })
  addressState!: string;

  @Column({ name: 'additional_data', type: 'jsonb', nullable: true })
  additionalData!: Record<string, unknown> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
