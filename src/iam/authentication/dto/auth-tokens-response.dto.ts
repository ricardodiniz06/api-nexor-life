import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty()
  accessToken!: string;

  @ApiProperty({
    description:
      'Token opaco de longa duração — armazenar com cuidado (HttpOnly cookie recomendado).',
  })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ example: '2026-05-22T12:00:00.000Z' })
  refreshExpiresAt!: string;
}
