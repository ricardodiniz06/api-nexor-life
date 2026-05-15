import { SetMetadata } from '@nestjs/common';
import { type PermissionAction } from '../enums/permission-action.enum';
import { type PermissionResource } from '../enums/permission-resource.enum';
import { REQUIRE_PERMISSIONS_KEY, type RequiredPermission } from '../constants';

/** Declara recurso/ação exigidos na rota (cruzado com JWT no PermissionsGuard). */
export const RequirePermissions = (
  resource: PermissionResource,
  action: PermissionAction,
): ReturnType<typeof SetMetadata> => {
  const value: RequiredPermission = {
    resource: String(resource),
    action: String(action),
  };
  return SetMetadata(REQUIRE_PERMISSIONS_KEY, value);
};
