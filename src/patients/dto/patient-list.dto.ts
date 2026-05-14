import { ApiProperty } from '@nestjs/swagger';

export class PatientSummaryDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({
    example: 'Patient external ref — no clinical payloads in this slice',
  })
  displayName!: string;

  @ApiProperty({
    example: '2026-01-10',
    description: 'Last encounter date (ISO date)',
  })
  lastSeenAt!: string;
}

export class PatientListResponseDto {
  @ApiProperty({ type: [PatientSummaryDto] })
  data!: PatientSummaryDto[];

  @ApiProperty({
    example: { total: 0, page: 1, limit: 20 },
    description: 'Offset pagination meta aligned with `/users`',
  })
  meta!: { total: number; page: number; limit: number };
}
