import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';
import {
  ListQuery,
  type IListQuery,
} from '../../common/decorators/list-query.decorator';
import { PermissionAction } from '../authorization/enums/permission-action.enum';
import { PermissionResource } from '../authorization/enums/permission-resource.enum';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RoleListResponseDto } from './dto/role-list-response.dto';
import { toRoleResponse } from './dto/role-response.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'rolesFindAll',
    summary: 'Listar papéis (perfis RBAC)',
    description: 'Para preencher seletores no formulário de utilizadores (`roleIds`).',
  })
  @ApiListQuery({
    searchExample: 'name:ADMIN',
    filterExample: 'isActive:true',
  })
  @ApiOkResponse({ type: RoleListResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão SYSTEM:READ' })
  async findAll(@ListQuery() query: IListQuery): Promise<RoleListResponseDto> {
    const result = await this.roles.findAll(query);
    return {
      data: result.data.map((r) => toRoleResponse(r)),
      meta: result.meta,
    };
  }
}
