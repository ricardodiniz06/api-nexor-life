import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class ConvenioAddressDto {
  @ApiProperty({ example: '01310100', description: '8 dígitos, sem máscara.' })
  @IsString({ message: 'O CEP deve ser texto.' })
  @Matches(/^\d{8}$/, {
    message: 'O CEP deve conter exatamente 8 dígitos.',
  })
  zipCode!: string;

  @ApiProperty({ example: 'Avenida Paulista' })
  @IsString({ message: 'A rua deve ser texto.' })
  @IsNotEmpty({ message: 'A rua é obrigatória.' })
  @Length(2, 200, {
    message: 'A rua deve ter entre 2 e 200 caracteres.',
  })
  street!: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString({ message: 'O bairro deve ser texto.' })
  @IsNotEmpty({ message: 'O bairro é obrigatório.' })
  @Length(2, 120, {
    message: 'O bairro deve ter entre 2 e 120 caracteres.',
  })
  neighborhood!: string;

  @ApiProperty({ example: '1000' })
  @IsString({ message: 'O número deve ser texto.' })
  @IsNotEmpty({ message: 'O número é obrigatório.' })
  @Length(1, 20, {
    message: 'O número deve ter entre 1 e 20 caracteres.',
  })
  number!: string;

  @ApiPropertyOptional({ example: 'Sala 1201' })
  @IsOptional()
  @IsString({ message: 'O complemento deve ser texto.' })
  @Length(1, 120, {
    message: 'O complemento deve ter entre 1 e 120 caracteres.',
  })
  complement?: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString({ message: 'A cidade deve ser texto.' })
  @IsNotEmpty({ message: 'A cidade é obrigatória.' })
  @Length(2, 120, {
    message: 'A cidade deve ter entre 2 e 120 caracteres.',
  })
  city!: string;

  @ApiProperty({ example: 'SP', description: 'Sigla do estado (UF).' })
  @IsString({ message: 'O estado deve ser texto.' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado deve ser a sigla UF com 2 letras maiúsculas.',
  })
  state!: string;
}

export class ConvenioAddressUpdateDto {
  @ApiPropertyOptional({ description: '8 dígitos, sem máscara.' })
  @IsOptional()
  @IsString({ message: 'O CEP deve ser texto.' })
  @Matches(/^\d{8}$/, {
    message: 'O CEP deve conter exatamente 8 dígitos.',
  })
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'A rua deve ser texto.' })
  @Length(2, 200, {
    message: 'A rua deve ter entre 2 e 200 caracteres.',
  })
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O bairro deve ser texto.' })
  @Length(2, 120, {
    message: 'O bairro deve ter entre 2 e 120 caracteres.',
  })
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O número deve ser texto.' })
  @Length(1, 20, {
    message: 'O número deve ter entre 1 e 20 caracteres.',
  })
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O complemento deve ser texto.' })
  @Length(1, 120, {
    message: 'O complemento deve ter entre 1 e 120 caracteres.',
  })
  complement?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'A cidade deve ser texto.' })
  @Length(2, 120, {
    message: 'A cidade deve ter entre 2 e 120 caracteres.',
  })
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O estado deve ser texto.' })
  @Matches(/^[A-Z]{2}$/, {
    message: 'O estado deve ser a sigla UF com 2 letras maiúsculas.',
  })
  state?: string;
}
