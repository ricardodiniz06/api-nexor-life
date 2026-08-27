import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportColumnDto {
  @ApiProperty({ example: 'state' })
  key!: string;

  @ApiProperty({ example: 'UF' })
  label!: string;

  @ApiPropertyOptional({ enum: ['string', 'number', 'boolean', 'date'] })
  type?: string;
}

export class ReportFilterFieldDto {
  @ApiProperty({ enum: ['string', 'boolean', 'date'] })
  type!: string;

  @ApiPropertyOptional()
  description?: string;
}

export class ReportCatalogItemDto {
  @ApiProperty({ example: 'convenios-by-state' })
  key!: string;

  @ApiProperty({ example: 'Convênios por UF' })
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ type: [ReportColumnDto] })
  columns!: ReportColumnDto[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/ReportFilterFieldDto' },
  })
  filterFields?: Record<string, ReportFilterFieldDto>;

  @ApiPropertyOptional({ example: true })
  supportsDateRange?: boolean;
}

export class ReportCatalogResponseDto {
  @ApiProperty({ type: [ReportCatalogItemDto] })
  data!: ReportCatalogItemDto[];
}

export class ReportMetaDto {
  @ApiProperty({ example: '2026-08-25T22:00:00.000Z' })
  generatedAt!: string;

  @ApiProperty({ example: 5 })
  rowCount!: number;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  filters?: Record<string, string>;

  @ApiPropertyOptional()
  from?: string;

  @ApiPropertyOptional()
  to?: string;
}

export class ReportExecutionResponseDto {
  @ApiProperty({ type: ReportCatalogItemDto })
  report!: Pick<
    ReportCatalogItemDto,
    'key' | 'name' | 'description' | 'columns'
  >;

  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  data!: Record<string, unknown>[];

  @ApiProperty({ type: ReportMetaDto })
  meta!: ReportMetaDto;
}
