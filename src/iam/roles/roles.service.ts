import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IListQuery } from '../../common/decorators/list-query.decorator';
import {
  PaginatedTypeOrmRepository,
  type PaginatedResult,
} from '../../database/pagination';
import { Role } from '../entities/role.entity';
import { ROLES_LIST_CONFIG } from './roles-list.config';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    private readonly paginated: PaginatedTypeOrmRepository,
  ) {}

  findAll(query: IListQuery): Promise<PaginatedResult<Role>> {
    return this.paginated.findMany(this.roles, ROLES_LIST_CONFIG, query);
  }
}
