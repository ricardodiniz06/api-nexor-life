import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { DashboardChartsDto } from './dto/dashboard-charts.dto';
import { DashboardChartsQueryDto } from './dto/dashboard-charts-query.dto';
import { DashboardActivityDto } from './dto/dashboard-activity.dto';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardSummary',
    summary: 'KPIs executivos da home',
  })
  @ApiOkResponse({ type: DashboardSummaryDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  summary(): Promise<DashboardSummaryDto> {
    return this.dashboard.getSummary();
  }

  @Get('charts')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardCharts',
    summary: 'Séries temporais para gráficos',
  })
  @ApiOkResponse({ type: DashboardChartsDto })
  charts(@Query() query: DashboardChartsQueryDto): Promise<DashboardChartsDto> {
    return this.dashboard.getCharts(query);
  }

  @Get('activity')
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'dashboardActivity',
    summary: 'Feed de atividade operacional recente',
  })
  @ApiOkResponse({ type: DashboardActivityDto })
  @ApiNotFoundResponse()
  activity(): Promise<DashboardActivityDto> {
    return this.dashboard.getActivity();
  }
}
