import { SetMetadata } from '@nestjs/common';
import { type UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../constants';

export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
