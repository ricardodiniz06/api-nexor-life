import { type EntityListConfig } from '../../database/pagination';

export const ROLES_LIST_CONFIG: EntityListConfig = {
  alias: 'role',
  searchFields: {
    name: { column: 'name' },
    description: { column: 'description' },
  },
  filterFields: {
    name: { type: 'string', column: 'name' },
    isActive: { type: 'boolean', column: 'isActive' },
  },
  defaultOrder: { column: 'name', direction: 'ASC' },
};
