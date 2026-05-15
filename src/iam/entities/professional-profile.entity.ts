import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CouncilType } from '../enums/council-type.enum';
import { User } from './user.entity';

/**
 * Dados profissionais separados das credenciais (LGPD: minimização na tabela de login).
 * CPF e conselho permitem validação regulatória sem expor PII na sessão JWT.
 */
@Entity('professional_profiles')
@Index('IDX_professional_profiles_cpf', ['cpf'], { unique: true })
@Index('IDX_professional_profiles_council_number', ['councilNumber'])
export class ProfessionalProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 200 })
  fullName!: string;

  /** Identificador fiscal — indexado para busca e deduplicação de cadastro. */
  @Column({ type: 'varchar', length: 11, unique: true })
  cpf!: string;

  @Column({
    name: 'council_type',
    type: 'enum',
    enum: CouncilType,
    enumName: 'professional_profiles_council_type_enum',
    default: CouncilType.NONE,
  })
  councilType!: CouncilType;

  @Column({
    name: 'council_number',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  councilNumber!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  specialty!: string | null;

  @OneToOne(() => User, (user) => user.professionalProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
