import { ApiProperty } from '@nestjs/swagger';

export class AddressByCepResponseDto {
  @ApiProperty({ example: '01310930' })
  cep!: string;

  @ApiProperty({ example: 'Avenida Paulista' })
  street!: string;

  @ApiProperty({ example: 'Bela Vista' })
  neighborhood!: string;

  @ApiProperty({ example: 'São Paulo' })
  city!: string;

  @ApiProperty({ example: 'SP' })
  state!: string;
}
