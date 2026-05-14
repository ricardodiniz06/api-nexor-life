import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @ApiProperty({ example: 'Silva' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  sobrenome!: string;

  @ApiProperty({ example: 'maria.silva@hospital.org' })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'SenhaForte123!', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.CLINICIAN,
    description: 'Padrão: viewer',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
