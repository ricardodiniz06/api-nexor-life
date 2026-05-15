import { type EntityListConfig } from '../../database/pagination';

const profileJoin = {
  relation: 'professionalProfile',
  joinAlias: 'professionalProfile',
} as const;

/** Chaves = nomes enviados pelo front em `search[campo]` / `filter[campo]`. */
export const USERS_LIST_CONFIG: EntityListConfig = {
  alias: 'user',
  relations: ['roles', 'professionalProfile'],
  searchFields: {
    email: { column: 'email' },
    cpf: { ...profileJoin, column: 'cpf' },
    fullName: { ...profileJoin, column: 'fullName' },
    name: { ...profileJoin, column: 'fullName' },
    code: { column: 'email' },
  },
  filterFields: {
    email: { type: 'string', column: 'email' },
    cpf: { type: 'string', ...profileJoin, column: 'cpf' },
    isActive: { type: 'boolean', column: 'isActive' },
    isTwoFactorEnabled: { type: 'boolean', column: 'isTwoFactorEnabled' },
    roleId: {
      type: 'uuid',
      relation: 'roles',
      joinAlias: 'roles_filter',
      column: 'id',
      innerJoin: true,
    },
  },
  defaultOrder: { column: 'createdAt', direction: 'DESC' },
};
