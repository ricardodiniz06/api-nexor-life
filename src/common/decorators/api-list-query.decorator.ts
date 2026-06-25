import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

type ApiListQueryOptions = {
  searchExample?: string;
  filterExample?: string;
  defaultLimit?: number;
};

/** Documentação Swagger padrão para listagens paginadas. */
export function ApiListQuery(
  options: ApiListQueryOptions = {},
): MethodDecorator {
  const {
    searchExample = 'cpf:5466607920,email:546',
    filterExample = 'cpf:5466607920,isActive:true',
    defaultLimit = 20,
  } = options;

  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Número da página (inicia em 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Registros por página (máx. 100)',
      example: defaultLimit,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description:
        'Busca por contém (ILIKE). Formato: `campo:valor,campo:valor`. ' +
        'Vários campos na mesma busca são unidos com OR.',
      example: searchExample,
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: String,
      description:
        'Filtro exato. Formato: `campo:valor,campo:valor`. ' +
        'Suporta operadores: `>=`, `<=`, `>`, `<`, `=`, e literais `null` / `!null`.',
      example: filterExample,
    }),
  );
}
