import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'jane@hospital.org' })
  email!: string;

  @ApiProperty({ example: 'Maria', description: 'Primeiro nome' })
  nome!: string;

  @ApiProperty({ example: 'Silva', description: 'Sobrenome' })
  sobrenome!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLINICIAN })
  role!: UserRole;

  @ApiProperty({ example: '2026-01-10T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-11T09:30:00.000Z' })
  updatedAt!: string;

  @ApiPropertyOptional({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Provisioning audit reference',
  })
  createdBy?: string | null;
}

export function toUserResponse(u: {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}): UserResponseDto {
  return {
    id: u.id,
    email: u.email,
    nome: u.nome,
    sobrenome: u.sobrenome,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    createdBy: u.createdBy,
  };
}
