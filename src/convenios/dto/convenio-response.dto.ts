import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Convenio } from '../entities/convenio.entity';

export class ConvenioCompanyResponseDto {
  @ApiProperty()
  cnpj!: string;

  @ApiProperty()
  legalName!: string;

  @ApiPropertyOptional()
  tradeName!: string | null;
}

export class ConvenioAddressResponseDto {
  @ApiProperty()
  zipCode!: string;

  @ApiProperty()
  street!: string;

  @ApiProperty()
  neighborhood!: string;

  @ApiProperty()
  number!: string;

  @ApiPropertyOptional()
  complement!: string | null;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  state!: string;
}

export class ConvenioResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: ConvenioCompanyResponseDto })
  company!: ConvenioCompanyResponseDto;

  @ApiProperty({ type: ConvenioAddressResponseDto })
  address!: ConvenioAddressResponseDto;

  @ApiPropertyOptional()
  additionalData!: Record<string, unknown> | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export function toConvenioResponse(convenio: Convenio): ConvenioResponseDto {
  return {
    id: convenio.id,
    name: convenio.name,
    company: {
      cnpj: convenio.cnpj,
      legalName: convenio.legalName,
      tradeName: convenio.tradeName,
    },
    address: {
      zipCode: convenio.addressZipCode,
      street: convenio.addressStreet,
      neighborhood: convenio.addressNeighborhood,
      number: convenio.addressNumber,
      complement: convenio.addressComplement,
      city: convenio.addressCity,
      state: convenio.addressState,
    },
    additionalData: convenio.additionalData,
    isActive: convenio.isActive,
    createdAt: convenio.createdAt.toISOString(),
    updatedAt: convenio.updatedAt.toISOString(),
  };
}
