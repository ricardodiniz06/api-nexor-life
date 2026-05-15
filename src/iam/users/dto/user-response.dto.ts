import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouncilType } from '../../enums/council-type.enum';
import { type User } from '../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isTwoFactorEnabled!: boolean;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiPropertyOptional()
  profileId?: string;

  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  cpf?: string;

  @ApiPropertyOptional({ enum: CouncilType })
  councilType?: CouncilType;

  @ApiPropertyOptional()
  councilNumber?: string | null;

  @ApiPropertyOptional()
  specialty?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    isActive: user.isActive,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    roles: (user.roles ?? []).map((r) => r.name),
    profileId: user.professionalProfile?.id,
    fullName: user.professionalProfile?.fullName,
    cpf: user.professionalProfile?.cpf,
    councilType: user.professionalProfile?.councilType,
    councilNumber: user.professionalProfile?.councilNumber,
    specialty: user.professionalProfile?.specialty,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
