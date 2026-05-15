import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { CouncilType } from '../../enums/council-type.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'medico@hospital.nexor.life' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @ApiProperty({
    minLength: 12,
    description: 'Política hospitalar: mínimo 12 caracteres.',
  })
  @IsString({ message: 'A senha deve ser texto.' })
  @MinLength(12, { message: 'A senha deve ter pelo menos 12 caracteres.' })
  password!: string;

  @ApiProperty({ example: 'Ana Paula Silva' })
  @IsString({ message: 'O nome deve ser texto.' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  @Length(2, 200, { message: 'O nome deve ter entre 2 e 200 caracteres.' })
  fullName!: string;

  @ApiProperty({
    example: '12345678901',
    description: '11 dígitos, sem máscara.',
  })
  @IsString({ message: 'O CPF deve ser texto.' })
  @Matches(/^\d{11}$/, { message: 'O CPF deve conter exatamente 11 dígitos.' })
  cpf!: string;

  @ApiPropertyOptional({ enum: CouncilType, default: CouncilType.NONE })
  @IsOptional()
  @IsEnum(CouncilType, { message: 'Tipo de conselho inválido.' })
  councilType?: CouncilType;

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString({ message: 'O número do conselho deve ser texto.' })
  @Length(1, 30, {
    message: 'O número do conselho deve ter entre 1 e 30 caracteres.',
  })
  councilNumber?: string;

  @ApiPropertyOptional({ example: 'Cardiologia' })
  @IsOptional()
  @IsString({ message: 'A especialidade deve ser texto.' })
  @Length(1, 120, {
    message: 'A especialidade deve ter entre 1 e 120 caracteres.',
  })
  specialty?: string;

  @ApiPropertyOptional({
    description: 'IDs de papéis RBAC a associar na criação.',
    type: [String],
  })
  @IsOptional()
  @IsUUID('4', { each: true, message: 'ID de perfil inválido.' })
  roleIds?: string[];
}
