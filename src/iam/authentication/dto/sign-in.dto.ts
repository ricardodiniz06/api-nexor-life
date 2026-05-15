import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD_DEFAULT,
} from '../../../database/seed-defaults';

export class SignInDto {
  @ApiProperty({ example: SEED_ADMIN_EMAIL })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @ApiProperty({ example: SEED_ADMIN_PASSWORD_DEFAULT, minLength: 8 })
  @IsString({ message: 'A senha deve ser texto.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  password!: string;
}
