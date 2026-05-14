import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityItemDto {
  @ApiProperty({ example: 'report.exported' })
  type!: string;

  @ApiProperty({ example: 'Monthly compliance bundle generated' })
  title!: string;

  @ApiProperty({ example: '2026-05-14T17:45:00.000Z' })
  at!: string;

  @ApiPropertyOptional({ example: 'reports' })
  module?: string;
}

export class DashboardActivityDto {
  @ApiProperty({ type: [ActivityItemDto] })
  items!: ActivityItemDto[];

  @ApiProperty({ example: '2026-05-14T18:00:00.000Z' })
  generatedAt!: string;
}
