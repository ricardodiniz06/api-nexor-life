import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type IPaginationOptions } from '../utils/types/pagination-options';
import { normalizePagination } from '../../database/pagination/normalize-pagination';

export type IListQuery = IPaginationOptions & {
  search?: string;
  filter?: string;
};

/**
 * Extrai `page`, `limit`, `search` e `filter` da query string.
 * Padrão Nexor: `search=cpf:546,email:546` e `filter=cpf:546,isActive:true`.
 */
export const ListQuery = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IListQuery => {
    const request = ctx.switchToHttp().getRequest<{
      query: Record<string, string | undefined>;
    }>();
    const q = request.query;
    const { page, limit } = normalizePagination({
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    });

    return {
      page,
      limit,
      search:
        typeof q.search === 'string' && q.search.trim() ? q.search : undefined,
      filter:
        typeof q.filter === 'string' && q.filter.trim() ? q.filter : undefined,
    };
  },
);
