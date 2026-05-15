import { BadRequestException } from '@nestjs/common';
import { type IListQuery } from '../../common/decorators/list-query.decorator';
import { parseFieldMapString } from '../../common/dto/parse-field-map.query';
import { parseFilterCondition } from '../pagination/apply-filter-condition';
import {
  type EntityListConfig,
  type FieldQueryConfig,
} from '../pagination/entity-list-config.type';
import { normalizePagination } from '../pagination/normalize-pagination';
import { type PaginatedResult } from '../pagination/paginated-result.type';
import {
  Brackets,
  type ObjectLiteral,
  type Repository,
  type SelectQueryBuilder,
} from 'typeorm';

export type FindManyWithPaginationOptions = IListQuery;

/**
 * Repositório base com listagem paginada.
 * - `search`: `campo:valor,campo:valor` → ILIKE (contém), OR entre campos
 * - `filter`: `campo:valor` → igualdade / operadores (`>=`, `null`, etc.), AND
 */
export class RepositoryModel<T extends ObjectLiteral> {
  constructor(private readonly entity: Repository<T>) {}

  async findManyWithPagination(
    listConfig: EntityListConfig,
    options: FindManyWithPaginationOptions,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = normalizePagination(options);
    const search = options.search
      ? parseFieldMapString(options.search)
      : undefined;
    const filter = options.filter
      ? parseFieldMapString(options.filter)
      : undefined;

    const alias = listConfig.alias;
    const qb = this.entity.createQueryBuilder(alias);
    const joined = new Set<string>();

    for (const relation of listConfig.relations ?? []) {
      qb.leftJoinAndSelect(`${alias}.${relation}`, relation);
      joined.add(relation);
    }

    this.applySearch(qb, alias, listConfig, search, joined);
    this.applyFilters(qb, alias, listConfig, filter, joined);

    const orderCol = listConfig.defaultOrder?.column ?? 'createdAt';
    const orderDir = listConfig.defaultOrder?.direction ?? 'DESC';
    qb.orderBy(`${alias}.${orderCol}`, orderDir);
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { page, limit, total } };
  }

  private applySearch(
    qb: SelectQueryBuilder<T>,
    alias: string,
    config: EntityListConfig,
    search: Record<string, string> | undefined,
    joined: Set<string>,
  ): void {
    if (!search) {
      return;
    }

    const entries = Object.entries(search).filter(([, v]) => v.trim());
    if (entries.length === 0) {
      return;
    }

    qb.andWhere(
      new Brackets((sub) => {
        for (const [key, rawValue] of entries) {
          const fieldConfig = config.searchFields[key];
          if (!fieldConfig) {
            throw new BadRequestException(`Busca não permitida: ${key}`);
          }
          const path = this.resolveFieldPath(
            alias,
            key,
            fieldConfig,
            joined,
            qb,
            false,
          );
          const param = `search_${key}`;
          sub.orWhere(`${path} ILIKE :${param}`, {
            [param]: `%${rawValue.trim()}%`,
          });
        }
      }),
    );
  }

  private applyFilters(
    qb: SelectQueryBuilder<T>,
    alias: string,
    config: EntityListConfig,
    filter: Record<string, string> | undefined,
    joined: Set<string>,
  ): void {
    if (!filter) {
      return;
    }

    for (const [key, rawValue] of Object.entries(filter)) {
      if (!rawValue.trim()) {
        continue;
      }

      const fieldConfig = config.filterFields[key];
      if (!fieldConfig) {
        throw new BadRequestException(`Filtro não permitido: ${key}`);
      }

      const path = this.resolveFilterPath(alias, key, fieldConfig, joined, qb);
      const param = `filter_${key}`;
      const condition = parseFilterCondition(
        rawValue,
        fieldConfig.type ?? 'string',
        key,
      );

      if (condition.kind === 'isNull') {
        qb.andWhere(`${path} IS NULL`);
        continue;
      }
      if (condition.kind === 'isNotNull') {
        qb.andWhere(`${path} IS NOT NULL`);
        continue;
      }

      qb.andWhere(`${path} ${condition.operator} :${param}`, {
        [param]: condition.value,
      });
    }
  }

  private resolveFilterPath(
    alias: string,
    fieldKey: string,
    field: FieldQueryConfig,
    joined: Set<string>,
    qb: SelectQueryBuilder<T>,
  ): string {
    const column = field.column ?? fieldKey;

    if (!field.relation) {
      return `${alias}.${column}`;
    }

    const joinAlias = field.joinAlias ?? `${field.relation}_filter`;
    if (!joined.has(joinAlias)) {
      const joinMethod = field.innerJoin ? 'innerJoin' : 'leftJoin';
      qb[joinMethod](`${alias}.${field.relation}`, joinAlias);
      joined.add(joinAlias);
    }
    return `${joinAlias}.${column}`;
  }

  private resolveFieldPath(
    alias: string,
    fieldKey: string,
    field: FieldQueryConfig,
    joined: Set<string>,
    qb: SelectQueryBuilder<T>,
    innerJoin: boolean,
  ): string {
    const column = field.column ?? fieldKey;

    if (!field.relation) {
      return `${alias}.${column}`;
    }

    const joinAlias = field.joinAlias ?? field.relation;
    if (!joined.has(joinAlias)) {
      const joinMethod = innerJoin ? 'innerJoin' : 'leftJoin';
      qb[joinMethod](`${alias}.${field.relation}`, joinAlias);
      joined.add(joinAlias);
    }
    return `${joinAlias}.${column}`;
  }
}
