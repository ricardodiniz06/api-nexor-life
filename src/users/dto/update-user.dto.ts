import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

/** Atualização parcial — envie só os campos a alterar. */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'novo.email@org.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({
    example: 'NovaSenhaForte456!',
    minLength: 8,
    description: 'Se enviado, substitui a senha (armazenada com hash).',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Apenas administrador.' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
