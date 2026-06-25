import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class ConvenioCompanyDto {
  @ApiProperty({
    example: '12345678000199',
    description: '14 dígitos, sem máscara.',
  })
  @IsString({ message: 'O CNPJ deve ser texto.' })
  @Matches(/^\d{14}$/, {
    message: 'O CNPJ deve conter exatamente 14 dígitos.',
  })
  cnpj!: string;

  @ApiProperty({ example: 'Unimed Cooperativa de Trabalho Médico Ltda' })
  @IsString({ message: 'A razão social deve ser texto.' })
  @IsNotEmpty({ message: 'A razão social é obrigatória.' })
  @Length(2, 200, {
    message: 'A razão social deve ter entre 2 e 200 caracteres.',
  })
  legalName!: string;

  @ApiPropertyOptional({ example: 'Unimed Regional' })
  @IsOptional()
  @IsString({ message: 'O nome fantasia deve ser texto.' })
  @Length(2, 200, {
    message: 'O nome fantasia deve ter entre 2 e 200 caracteres.',
  })
  tradeName?: string;
}

export class ConvenioCompanyUpdateDto {
  @ApiPropertyOptional({ description: '14 dígitos, sem máscara.' })
  @IsOptional()
  @IsString({ message: 'O CNPJ deve ser texto.' })
  @Matches(/^\d{14}$/, {
    message: 'O CNPJ deve conter exatamente 14 dígitos.',
  })
  cnpj?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'A razão social deve ser texto.' })
  @Length(2, 200, {
    message: 'A razão social deve ter entre 2 e 200 caracteres.',
  })
  legalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'O nome fantasia deve ser texto.' })
  @Length(2, 200, {
    message: 'O nome fantasia deve ter entre 2 e 200 caracteres.',
  })
  tradeName?: string | null;
}
