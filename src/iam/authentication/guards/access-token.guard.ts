import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../core/constants';
import { IamErrorMessages } from '../../common/messages/error-messages';
import { ACCESS_TOKEN_STRATEGY } from '../constants';

/** Valida JWT de curta duração (access token) em rotas protegidas. */
@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_TOKEN_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  override handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err ?? !user) {
      throw new UnauthorizedException(
        IamErrorMessages.authorization.missingUser,
      );
    }
    return user;
  }
}
