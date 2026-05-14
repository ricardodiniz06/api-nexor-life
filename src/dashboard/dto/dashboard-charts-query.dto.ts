import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ChartGranularity } from './dashboard-charts.dto';

export class DashboardChartsQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-01T00:00:00.000Z',
    description: 'Range start (inclusive), ISO 8601',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-05-14T23:59:59.999Z',
    description: 'Range end (inclusive), ISO 8601',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    enum: ChartGranularity,
    example: ChartGranularity.DAY,
  })
  @IsOptional()
  @IsEnum(ChartGranularity)
  granularity?: ChartGranularity;

  @ApiPropertyOptional({
    example: 'c4c7f0e2-1b2a-4b8e-9d6f-123456789abc',
    description: 'Optional care unit filter',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
