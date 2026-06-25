import { type EntityListConfig } from '../database/pagination';

export const CONVENIOS_LIST_CONFIG: EntityListConfig = {
  alias: 'convenio',
  searchFields: {
    name: { column: 'name' },
    cnpj: { column: 'cnpj' },
    legalName: { column: 'legalName' },
    tradeName: { column: 'tradeName' },
    zipCode: { column: 'addressZipCode' },
    street: { column: 'addressStreet' },
    neighborhood: { column: 'addressNeighborhood' },
    city: { column: 'addressCity' },
    state: { column: 'addressState' },
  },
  filterFields: {
    name: { type: 'string', column: 'name' },
    cnpj: { type: 'string', column: 'cnpj' },
    legalName: { type: 'string', column: 'legalName' },
    zipCode: { type: 'string', column: 'addressZipCode' },
    city: { type: 'string', column: 'addressCity' },
    state: { type: 'string', column: 'addressState' },
    isActive: { type: 'boolean', column: 'isActive' },
  },
  defaultOrder: { column: 'name', direction: 'ASC' },
};
