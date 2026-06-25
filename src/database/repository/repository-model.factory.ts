import { Injectable } from '@nestjs/common';
import { type ObjectLiteral, type Repository } from 'typeorm';
import { RepositoryModel } from './repository.model';

@Injectable()
export class RepositoryModelFactory {
  create<T extends ObjectLiteral>(
    repository: Repository<T>,
  ): RepositoryModel<T> {
    return new RepositoryModel(repository);
  }
}
