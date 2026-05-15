import { Injectable } from '@nestjs/common';
import { type ObjectLiteral, type Repository } from 'typeorm';
import { type IListQuery } from '../../common/decorators/list-query.decorator';
import { RepositoryModelFactory } from '../repository/repository-model.factory';
import { type EntityListConfig } from './entity-list-config.type';
import { type PaginatedResult } from './paginated-result.type';

/** Ponte Nest DI → {@link RepositoryModel}. */
@Injectable()
export class PaginatedTypeOrmRepository {
  constructor(private readonly factory: RepositoryModelFactory) {}

  findMany<T extends ObjectLiteral>(
    repo: Repository<T>,
    config: EntityListConfig,
    query: IListQuery,
  ): Promise<PaginatedResult<T>> {
    return this.factory.create(repo).findManyWithPagination(config, query);
  }
}
