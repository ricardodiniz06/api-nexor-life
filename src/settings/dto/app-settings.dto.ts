import { ApiProperty } from '@nestjs/swagger';

export class AppSettingsDto {
  @ApiProperty({ example: 'America/Sao_Paulo' })
  timezone!: string;

  @ApiProperty({ example: 'pt-BR' })
  locale!: string;

  @ApiProperty({
    example: { alerts: true, integrations: true },
    description: 'Feature toggles (stub)',
  })
  features!: Record<string, boolean>;

  @ApiProperty({ example: '2026-05-14T18:00:00.000Z' })
  updatedAt!: string;
}
