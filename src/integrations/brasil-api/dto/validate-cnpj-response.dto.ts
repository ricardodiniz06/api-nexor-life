import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidatedCompanyDto {
  @ApiProperty({ example: 'OPEN KNOWLEDGE BRASIL' })
  razao_social!: string;

  @ApiProperty({ example: 'OKBR' })
  nome_fantasia!: string;

  @ApiProperty({ example: 'Rua da Consolação' })
  logradouro!: string;

  @ApiProperty({ example: '123' })
  numero!: string;

  @ApiProperty({ example: 'Sala 1' })
  complemento!: string;

  @ApiProperty({ example: 'Consolação' })
  bairro!: string;

  @ApiProperty({ example: 'São Paulo' })
  municipio!: string;

  @ApiProperty({ example: 'SP' })
  uf!: string;

  @ApiProperty({ example: '01301000' })
  cep!: string;

  @ApiProperty({ example: 'contato@empresa.com.br', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '1133334444' })
  ddd_telefone_1!: string;

  @ApiProperty({ example: 'Atividades de organizações associativas' })
  cnae_fiscal_descricao!: string;

  @ApiProperty({ example: '2010-01-01' })
  data_inicio_atividade!: string;

  @ApiProperty({ example: 100000 })
  capital_social!: number;

  @ApiProperty({ example: 'DEMAIS' })
  porte!: string;
}

export class ValidateCnpjResponseDto {
  @ApiProperty({ example: true })
  valid!: true;

  @ApiPropertyOptional({
    example: 'Verifique se este é um convênio de saúde válido.',
  })
  warning?: string;

  @ApiProperty({ type: ValidatedCompanyDto })
  company!: ValidatedCompanyDto;
}
