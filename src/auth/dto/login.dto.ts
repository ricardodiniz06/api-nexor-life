import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD_DEFAULT,
} from '../../database/seed-defaults';

export class LoginDto {
  @ApiProperty({ example: SEED_ADMIN_EMAIL })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: SEED_ADMIN_PASSWORD_DEFAULT,
    description:
      'Senha por omissão do utilizador criado pela migration `SeedDefaultAdminUser` / `db:seed`, salvo quando `SEED_ADMIN_PASSWORD` foi definida.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
