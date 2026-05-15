import { PermissionAction } from '../enums/permission-action.enum';
import { PermissionResource } from '../enums/permission-resource.enum';

export function toPermissionKey(
  resource: PermissionResource | string,
  action: PermissionAction | string,
): string {
  return `${resource}:${action}`;
}

/** Agrega permissões de múltiplos papéis (N:N) num conjunto único para o JWT. */
export function aggregatePermissionKeys(
  roles: Array<{
    isActive: boolean;
    permissions?: Array<{ resource: string; action: string }>;
  }>,
): string[] {
  const keys = new Set<string>();
  for (const role of roles) {
    if (!role.isActive) {
      continue;
    }
    for (const permission of role.permissions ?? []) {
      keys.add(toPermissionKey(permission.resource, permission.action));
    }
  }
  return [...keys];
}

/**
 * Verifica se o utilizador possui a permissão exigida.
 * Suporta wildcard `ALL` na ação ou permissão concedida.
 */
export function hasPermission(
  granted: readonly string[],
  resource: PermissionResource | string,
  action: PermissionAction | string,
): boolean {
  const requiredResource = String(resource);
  const requiredAction = String(action);

  if (granted.includes(toPermissionKey(requiredResource, PermissionAction.ALL))) {
    return true;
  }
  if (requiredAction === PermissionAction.ALL) {
    return granted.some((key) => key.startsWith(`${requiredResource}:`));
  }
  if (granted.includes(toPermissionKey(requiredResource, requiredAction))) {
    return true;
  }
  return granted.includes(toPermissionKey(requiredResource, PermissionAction.ALL));
}
