import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../core/decorators/public.decorator';
import { AuthenticationService } from './services/authentication.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';

function sessionMeta(req: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const forwarded = req.headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : req.ip;
  return {
    ipAddress: ip ?? null,
    userAgent:
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : null,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authentication: AuthenticationService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'authSignIn', summary: 'Login (access + refresh)' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse()
  signIn(
    @Body() dto: SignInDto,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    return this.authentication.signIn(dto, sessionMeta(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    operationId: 'authRefresh',
    summary: 'Rotação de refresh token',
  })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request & { refreshToken?: string },
  ): Promise<AuthTokensResponseDto> {
    const token = req.refreshToken ?? dto.refreshToken;
    return this.authentication.refreshTokens(token, sessionMeta(req));
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ operationId: 'authSignOut', summary: 'Revogar sessão (refresh)' })
  @ApiUnauthorizedResponse()
  async signOut(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.authentication.signOut(dto.refreshToken);
  }
}
