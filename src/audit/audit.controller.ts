import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { AuditService } from './audit.service';

@ApiTags('audit-logs')
@ApiBearerAuth('access-token')
@Controller('audit-logs')
@UseGuards(PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'auditLogsFindAll',
    summary: 'Listar trilha de auditoria LGPD (Apenas administradores)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    return this.auditService.findAll(l, p);
  }
}
