/**
 * Claims do access token curto — sem PII clínica além do e-mail operacional.
 * `permissions` agrega todos os papéis (N:N) numa única lista para o guard.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  profileId: string | null;
  roles: string[];
  permissions: string[];
}
