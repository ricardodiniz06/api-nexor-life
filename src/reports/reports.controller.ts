import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { type JwtPayload } from '../iam/authentication/interfaces/jwt-payload.interface';
import { ReportQuery } from './framework/decorators/report-query.decorator';
import { type IReportQuery } from './framework/types/report-query.type';
import { ReportRunner } from './framework/report-runner.service';
import {
  ReportCatalogResponseDto,
  ReportExecutionResponseDto,
} from './dto/report-response.dto';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
@UseGuards(PermissionsGuard)
export class ReportsController {
  constructor(private readonly runner: ReportRunner) {}

  @Get()
  @RequirePermissions(PermissionResource.REPORT, PermissionAction.READ)
  @ApiOperation({
    operationId: 'reportsCatalog',
    summary: 'Catálogo de relatórios disponíveis',
    description:
      'Lista relatórios registrados no framework filtrados pelas permissões do utilizador autenticado.',
  })
  @ApiOkResponse({ type: ReportCatalogResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão REPORT:READ' })
  catalog(@CurrentUser() user: JwtPayload): ReportCatalogResponseDto {
    const definitions = this.runner.listAccessibleDefinitions(user);
    return {
      data: definitions.map((definition) => ({
        key: definition.key,
        name: definition.name,
        description: definition.description,
        columns: definition.columns,
        filterFields: definition.filterFields,
        supportsDateRange: definition.supportsDateRange,
      })),
    };
  }

  @Get(':key')
  @RequirePermissions(PermissionResource.REPORT, PermissionAction.READ)
  @ApiOperation({
    operationId: 'reportsRun',
    summary: 'Executar relatório',
    description:
      'Pipeline do framework: valida filtros → executa provider → retorna JSON ou CSV (`format=csv`).',
  })
  @ApiParam({
    name: 'key',
    example: 'convenios-by-state',
    description: 'Identificador do relatório registrado no framework',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    example: 'state:SP,isActive:true',
    description: 'Filtros permitidos pelo relatório (campo:valor,...)',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    example: '2026-01-01T00:00:00.000Z',
    description: 'Início do intervalo (ISO 8601), se suportado',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    example: '2026-08-01T23:59:59.999Z',
    description: 'Fim do intervalo (ISO 8601), se suportado',
  })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['json', 'csv'],
    example: 'json',
  })
  @ApiOkResponse({ type: ReportExecutionResponseDto })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 400, description: 'Filtro ou parâmetro inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão para o relatório' })
  @ApiResponse({ status: 404, description: 'Relatório não encontrado' })
  async run(
    @Param('key') key: string,
    @ReportQuery() query: IReportQuery,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReportExecutionResponseDto | StreamableFile> {
    const result = await this.runner.run(key, query, user);
    if (result.kind === 'csv') {
      return result.file;
    }
    return result.body;
  }
}
