import { ApiProperty } from '@nestjs/swagger';

export class AlertItemDto {
  @ApiProperty({ example: 'integration-latency' })
  id!: string;

  @ApiProperty({ example: 'warning', enum: ['info', 'warning', 'critical'] })
  severity!: 'info' | 'warning' | 'critical';

  @ApiProperty({ example: 'HL7 listener backlog' })
  title!: string;

  @ApiProperty({ example: '2026-05-14T16:00:00.000Z' })
  triggeredAt!: string;
}
