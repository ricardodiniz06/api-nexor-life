import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { ConvenioAddressDto } from './convenio-address.dto';
import { ConvenioCompanyDto } from './convenio-company.dto';

export class CreateConvenioDto {
  @ApiProperty({ example: 'Unimed Regional' })
  @IsString({ message: 'O nome deve ser texto.' })
  @IsNotEmpty({ message: 'O nome do convênio é obrigatório.' })
  @Length(2, 200, {
    message: 'O nome deve ter entre 2 e 200 caracteres.',
  })
  name!: string;

  @ApiProperty({ type: ConvenioCompanyDto })
  @ValidateNested()
  @Type(() => ConvenioCompanyDto)
  company!: ConvenioCompanyDto;

  @ApiProperty({ type: ConvenioAddressDto })
  @ValidateNested()
  @Type(() => ConvenioAddressDto)
  address!: ConvenioAddressDto;

  @ApiPropertyOptional({
    description: 'Dados complementares (contato, observações, etc.).',
    example: { phone: '1133334444', contactEmail: 'contato@unimed.com' },
  })
  @IsOptional()
  @IsObject({ message: 'Os dados complementares devem ser um objeto.' })
  additionalData?: Record<string, unknown>;
}
