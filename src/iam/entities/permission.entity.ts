import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PermissionAction } from '../authorization/enums/permission-action.enum';
import { PermissionResource } from '../authorization/enums/permission-resource.enum';
import { Role } from './role.entity';

/**
 * Permissão atômica (recurso + ação). Granularidade fina permite segregação
 * de funções exigida em ambientes clínicos e trilhas de auditoria por operação.
 */
@Entity('permissions')
@Index('IDX_permissions_resource_action', ['resource', 'action'], {
  unique: true,
})
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: PermissionResource,
    enumName: 'permissions_resource_enum',
  })
  resource!: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
    enumName: 'permissions_action_enum',
  })
  action!: PermissionAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
