export const REQUIRE_PERMISSIONS_KEY = 'iam:require_permissions';

export type RequiredPermission = {
  resource: string;
  action: string;
};
