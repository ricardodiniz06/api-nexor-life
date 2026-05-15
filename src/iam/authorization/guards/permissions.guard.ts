import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type JwtPayload } from '../../authentication/interfaces/jwt-payload.interface';
import { REQUIRE_PERMISSIONS_KEY, type RequiredPermission } from '../constants';
import { IamErrorMessages } from '../../common/messages/error-messages';
import { hasPermission } from '../utils/permission-key.util';

/**
 * Cruza permissões agregadas de todos os papéis do utilizador (JWT)
 * com o par recurso/ação da rota — princípio do menor privilégio em rotas clínicas.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      RequiredPermission | undefined
    >(REQUIRE_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(IamErrorMessages.authorization.missingUser);
    }

    const granted = user.permissions ?? [];
    if (!hasPermission(granted, required.resource, required.action)) {
      throw new ForbiddenException(
        IamErrorMessages.authorization.insufficientPermissions,
      );
    }
    return true;
  }
}
