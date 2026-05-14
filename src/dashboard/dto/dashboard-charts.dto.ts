import { ApiProperty } from '@nestjs/swagger';

export enum ChartGranularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class TimeSeriesPointDto {
  @ApiProperty({
    example: '2026-05-01',
    description: 'Bucket start label (ISO date or datetime).',
  })
  t!: string;

  @ApiProperty({ example: 120, description: 'Numeric value for the bucket.' })
  v!: number;
}

export class NamedSeriesDto {
  @ApiProperty({ example: 'Emergency' })
  label!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    example: [10, 14, 9],
  })
  values!: number[];
}

export class DashboardChartsDto {
  @ApiProperty({
    type: [TimeSeriesPointDto],
    description: 'Admissions or encounters per bucket (stub series).',
    example: [
      { t: '2026-05-01', v: 42 },
      { t: '2026-05-02', v: 55 },
    ],
  })
  encounters!: TimeSeriesPointDto[];

  @ApiProperty({
    type: [TimeSeriesPointDto],
    description: 'Revenue per bucket — major currency units (stub).',
    example: [
      { t: '2026-05-01', v: 48000 },
      { t: '2026-05-02', v: 51200 },
    ],
  })
  revenue!: TimeSeriesPointDto[];

  @ApiProperty({
    type: [NamedSeriesDto],
    description:
      'Department mix for stacked charts (labels parallel category axis on the client).',
  })
  departmentWorkload!: NamedSeriesDto[];

  @ApiProperty({
    example: '2026-05-14T18:00:00.000Z',
    description: 'When this bundle was produced.',
  })
  generatedAt!: string;

  @ApiProperty({
    enum: ChartGranularity,
    example: ChartGranularity.DAY,
    description:
      'Granularity used to build the series (from query or default).',
  })
  granularity!: ChartGranularity;
}
