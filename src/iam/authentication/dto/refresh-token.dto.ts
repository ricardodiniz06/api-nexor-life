import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Token opaco (`sessionId.secret`). Alternativa: header `x-refresh-token`.',
  })
  @IsString({ message: 'O token de atualização deve ser texto.' })
  @IsNotEmpty({ message: 'O token de atualização é obrigatório.' })
  refreshToken!: string;
}
