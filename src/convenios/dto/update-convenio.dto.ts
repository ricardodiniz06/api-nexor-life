import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { ConvenioAddressUpdateDto } from './convenio-address.dto';
import { ConvenioCompanyUpdateDto } from './convenio-company.dto';

export class UpdateConvenioDto {
  @ApiPropertyOptional({ example: 'Unimed Regional' })
  @IsOptional()
  @IsString({ message: 'O nome deve ser texto.' })
  @Length(2, 200, {
    message: 'O nome deve ter entre 2 e 200 caracteres.',
  })
  name?: string;

  @ApiPropertyOptional({ type: ConvenioCompanyUpdateDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConvenioCompanyUpdateDto)
  company?: ConvenioCompanyUpdateDto;

  @ApiPropertyOptional({ type: ConvenioAddressUpdateDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConvenioAddressUpdateDto)
  address?: ConvenioAddressUpdateDto;

  @ApiPropertyOptional({
    description: 'Dados complementares (contato, observações, etc.).',
  })
  @IsOptional()
  @IsObject({ message: 'Os dados complementares devem ser um objeto.' })
  additionalData?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isActive deve ser verdadeiro ou falso.' })
  isActive?: boolean;
}
