import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardGetSummary',
    summary: 'Obter resumo de KPIs clínicos e operacionais',
  })
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('charts')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardGetCharts',
    summary: 'Obter séries temporais e dados consolidados para gráficos',
  })
  async getCharts() {
    return this.dashboardService.getCharts();
  }

  @Get('activity')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardGetActivity',
    summary: 'Obter atividades recentes e trilhas de auditoria para a home',
  })
  async getActivity() {
    return this.dashboardService.getActivity();
  }

  @Get('alerts')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardGetAlerts',
    summary: 'Obter alertas clínicos e operacionais do sistema',
  })
  async getAlerts() {
    return this.dashboardService.getAlerts();
  }
}
