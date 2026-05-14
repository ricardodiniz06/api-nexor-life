import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public } from '../core/decorators/public.decorator';
import { AuthService } from './auth.service';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD_DEFAULT,
} from '../database/seed-defaults';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'authLogin',
    summary: 'Login com e-mail e senha',
    description:
      'Retorna um access token JWT. Envie nas rotas protegidas como `Authorization: Bearer <token>`. ' +
      `Exemplo (seed): \`${SEED_ADMIN_EMAIL}\` / \`${SEED_ADMIN_PASSWORD_DEFAULT}\` quando a migration não usou \`SEED_ADMIN_PASSWORD\` — altere logo a senha.`,
  })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiBadRequestResponse({ description: 'Erro de validação' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const { accessToken, expiresIn } = await this.auth.login(dto);
    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn,
    };
  }
}
