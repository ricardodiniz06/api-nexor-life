import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({
    example: 842,
    description:
      'Patients with activity in the reporting window (stub until patient module is live).',
  })
  activePatients!: number;

  @ApiProperty({
    example: 18,
    description: 'Scheduled inpatient beds in use (stub).',
  })
  occupiedBeds!: number;

  @ApiProperty({
    example: 24,
    description: 'Outpatient visits in the last 24h (stub).',
  })
  visitsLast24h!: number;

  @ApiProperty({
    example: 1284000.5,
    description: 'Rolling revenue indicator (stub, major currency).',
  })
  revenueMtd!: number;

  @ApiProperty({
    example: 7,
    description: 'Count of staff accounts in the system.',
  })
  registeredUsers!: number;

  @ApiProperty({
    example: '2026-05-14T18:00:00.000Z',
    description: 'Snapshot generation time (ISO 8601).',
  })
  generatedAt!: string;
}
