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
import { Roles } from '../core/decorators/roles.decorator';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { DashboardChartsDto } from './dto/dashboard-charts.dto';
import { DashboardChartsQueryDto } from './dto/dashboard-charts-query.dto';
import { DashboardActivityDto } from './dto/dashboard-activity.dto';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.CLINICIAN, UserRole.VIEWER)
  @ApiOperation({
    operationId: 'dashboardSummary',
    summary: 'KPIs executivos da home',
    description:
      'Agregação somente leitura para cartões executivos. Evolui de forma independente dos CRUDs dos domínios.',
  })
  @ApiOkResponse({ type: DashboardSummaryDto })
  @ApiUnauthorizedResponse({ description: 'JWT em falta ou inválido' })
  @ApiForbiddenResponse({ description: 'Perfil insuficiente' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  summary(): Promise<DashboardSummaryDto> {
    return this.dashboard.getSummary();
  }

  @Get('charts')
  @Roles(UserRole.ADMIN, UserRole.CLINICIAN, UserRole.VIEWER)
  @ApiOperation({
    operationId: 'dashboardCharts',
    summary: 'Séries temporais para gráficos',
    description:
      'Filtros opcionais alinhados com seletores de data no front. Dados de exemplo por agora; substituir por SQL/views depois.',
  })
  @ApiOkResponse({ type: DashboardChartsDto })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  @ApiNotFoundResponse({
    description:
      '(Reservado) quando um filtro referenciar recursos inexistentes',
  })
  charts(@Query() query: DashboardChartsQueryDto): Promise<DashboardChartsDto> {
    return this.dashboard.getCharts(query);
  }

  @Get('activity')
  @Roles(UserRole.ADMIN, UserRole.CLINICIAN)
  @ApiOperation({
    operationId: 'dashboardActivity',
    summary: 'Feed de atividade operacional recente',
  })
  @ApiOkResponse({ type: DashboardActivityDto })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  activity(): Promise<DashboardActivityDto> {
    return this.dashboard.getActivity();
  }
}
