import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IamErrorMessages } from '../../common/messages/error-messages';
import { SessionService } from '../services/session.service';
import { REFRESH_TOKEN_HEADER } from '../constants';

type RefreshBody = { refreshToken?: string };

/**
 * Valida refresh token opaco contra `sessions` (hash, expiração, isRevoked).
 * Anexa a sessão validada ao request para rotação no handler.
 */
@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      body?: RefreshBody;
      headers: Record<string, string | string[] | undefined>;
      refreshToken?: string;
      iamSession?: unknown;
    }>();
    const token = this.extractRefreshToken(request);
    if (!token) {
      throw new UnauthorizedException(
        IamErrorMessages.auth.refreshTokenRequired,
      );
    }
    const session = await this.sessions.validateRefreshToken(token);
    request.refreshToken = token;
    request.iamSession = session;
    return true;
  }

  private extractRefreshToken(request: {
    body?: RefreshBody;
    headers: Record<string, string | string[] | undefined>;
  }): string | undefined {
    const header = request.headers[REFRESH_TOKEN_HEADER];
    if (typeof header === 'string' && header.length > 0) {
      return header;
    }
    const bodyToken = request.body?.refreshToken;
    if (typeof bodyToken === 'string' && bodyToken.length > 0) {
      return bodyToken;
    }
    return undefined;
  }
}
