import { Global, Module } from '@nestjs/common';
import { RepositoryModelFactory } from '../repository/repository-model.factory';
import { PaginatedTypeOrmRepository } from './paginated-typeorm.repository';

@Global()
@Module({
  providers: [RepositoryModelFactory, PaginatedTypeOrmRepository],
  exports: [RepositoryModelFactory, PaginatedTypeOrmRepository],
})
export class PaginationModule {}
