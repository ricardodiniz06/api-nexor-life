import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type JwtPayload } from '../../iam/authentication/interfaces/jwt-payload.interface';
import { IamErrorMessages } from '../../iam/common/messages/error-messages';
import { ROLES_KEY } from '../constants';

/**
 * Guard legado por nome de papel — preferir {@link PermissionsGuard} em rotas novas.
 * Suporta múltiplos papéis no JWT (`roles[]`).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException(IamErrorMessages.authorization.missingUser);
    }
    const roles = user.roles ?? [];
    const allowed = required.some((role) => roles.includes(role));
    if (!allowed) {
      throw new ForbiddenException(IamErrorMessages.authorization.insufficientRole);
    }
    return true;
  }
}
