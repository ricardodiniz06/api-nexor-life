import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants';

/** @deprecated Preferir `@RequirePermissions` do módulo IAM. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
