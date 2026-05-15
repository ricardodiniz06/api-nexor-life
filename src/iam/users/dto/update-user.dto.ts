import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { CouncilType } from '../../enums/council-type.enum';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email?: string;

  @ApiPropertyOptional({ minLength: 12 })
  @IsOptional()
  @IsString({ message: 'A senha deve ser texto.' })
  @MinLength(12, { message: 'A senha deve ter pelo menos 12 caracteres.' })
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O nome deve ser texto.' })
  @Length(2, 200, { message: 'O nome deve ter entre 2 e 200 caracteres.' })
  fullName?: string;

  @ApiPropertyOptional({ description: '11 dígitos, sem máscara.' })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser texto.' })
  @Matches(/^\d{11}$/, { message: 'O CPF deve conter exatamente 11 dígitos.' })
  cpf?: string;

  @ApiPropertyOptional({ enum: CouncilType })
  @IsOptional()
  @IsEnum(CouncilType, { message: 'Tipo de conselho inválido.' })
  councilType?: CouncilType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O número do conselho deve ser texto.' })
  @Length(1, 30, {
    message: 'O número do conselho deve ter entre 1 e 30 caracteres.',
  })
  councilNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'A especialidade deve ser texto.' })
  @Length(1, 120, {
    message: 'A especialidade deve ter entre 1 e 120 caracteres.',
  })
  specialty?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsUUID('4', { each: true, message: 'ID de perfil inválido.' })
  roleIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser verdadeiro ou falso.' })
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isTwoFactorEnabled deve ser verdadeiro ou falso.' })
  isTwoFactorEnabled?: boolean;
}
