import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IntegrationStatusDto {
  @ApiProperty({ example: 'fhir' })
  code!: string;

  @ApiProperty({ example: 'FHIR R4 gateway' })
  name!: string;

  @ApiProperty({ example: true })
  healthy!: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  lastSyncAt!: string | null;
}
