export type FilterFieldType = 'string' | 'boolean' | 'uuid' | 'number';

/** Configuração de um campo em `search` (contém) ou `filter` (igualdade). */
export type FieldQueryConfig = {
  /** Propriedade na entidade; por omissão usa a chave do mapa. */
  column?: string;
  relation?: string;
  joinAlias?: string;
  innerJoin?: boolean;
  /** Obrigatório em `filterFields`; ignorado em `search` (sempre ILIKE). */
  type?: FilterFieldType;
};

export type EntityListConfig = {
  alias: string;
  relations?: string[];
  /** `search[cpf]=546` — contém (ILIKE), AND entre campos. */
  searchFields: Record<string, FieldQueryConfig>;
  /** `filter[status]=active` — igualdade exata, AND entre campos. */
  filterFields: Record<string, FieldQueryConfig>;
  defaultOrder?: { column: string; direction?: 'ASC' | 'DESC' };
};
