import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import type { JwtPayload } from '../iam/authentication/interfaces/jwt-payload.interface';
import { IntegrationsService } from './integrations.service';

function requestMeta(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : req.ip;
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
  return { ip, userAgent };
}

@ApiTags('integrations')
@ApiBearerAuth('access-token')
@Controller('integrations')
@UseGuards(PermissionsGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'integrationsFindAll',
    summary: 'Listar conexões e integradores com sistemas de saúde',
  })
  async findAll() {
    return this.integrationsService.findAll();
  }

  @Patch(':id/toggle')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.UPDATE)
  @ApiOperation({
    operationId: 'integrationsToggle',
    summary: 'Habilitar ou desabilitar um conector de integração',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isEnabled') isEnabled: boolean,
  ) {
    return this.integrationsService.toggleEnabled(id, isEnabled);
  }

  @Post(':id/sync')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.UPDATE)
  @ApiOperation({
    operationId: 'integrationsSync',
    summary: 'Disparar sincronização manual e ingestão de prontuários do sistema externo',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async sync(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.integrationsService.sync(id, { id: user.sub, name: user.email }, ip, userAgent);
  }
}
