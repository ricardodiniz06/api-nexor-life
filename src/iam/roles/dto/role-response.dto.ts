import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Role } from '../../entities/role.entity';

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'ADMIN' })
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export function toRoleResponse(role: Role): RoleResponseDto {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isActive: role.isActive,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}
