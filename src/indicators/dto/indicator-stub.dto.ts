import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IndicatorStubDto {
  @ApiProperty({ example: 'HAI_RATE' })
  code!: string;

  @ApiProperty({ example: 'Hospital-associated infection rate' })
  label!: string;

  @ApiPropertyOptional({ example: 0.42, nullable: true })
  value!: number | null;

  @ApiProperty({ example: '%' })
  unit!: string;
}
