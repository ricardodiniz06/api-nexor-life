import { ApiProperty } from '@nestjs/swagger';
import { ConvenioResponseDto } from './convenio-response.dto';

export class ConvenioListMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;
}

export class ConvenioListResponseDto {
  @ApiProperty({ type: [ConvenioResponseDto] })
  data!: ConvenioResponseDto[];

  @ApiProperty({ type: ConvenioListMetaDto })
  meta!: ConvenioListMetaDto;
}
