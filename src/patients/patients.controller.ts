import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { CurrentUser } from '../core/decorators/current-user.decorator';
import type { JwtPayload } from '../iam/authentication/interfaces/jwt-payload.interface';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { CreateMedicalRecordEntryDto } from './dto/medical-record-entry.dto';

function requestMeta(req: Request) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : req.ip;
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
  return { ip, userAgent };
}

@ApiTags('patients')
@ApiBearerAuth('access-token')
@Controller('patients')
@UseGuards(PermissionsGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @RequirePermissions(PermissionResource.PATIENT, PermissionAction.READ)
  @ApiOperation({
    operationId: 'patientsFindAll',
    summary: 'Listar pacientes com busca e paginação',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'sector', required: false, type: String })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('sector') sector?: string,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      sector,
      user: { id: user.sub, name: user.email },
      ip,
      userAgent,
    });
  }

  @Get(':id')
  @RequirePermissions(PermissionResource.PATIENT, PermissionAction.READ)
  @ApiOperation({
    operationId: 'patientsFindById',
    summary: 'Obter dados do paciente e histórico clínico',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.findById(id, { id: user.sub, name: user.email }, ip, userAgent);
  }

  @Post()
  @RequirePermissions(PermissionResource.PATIENT, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'patientsCreate',
    summary: 'Cadastrar novo paciente',
  })
  async create(
    @Body() dto: CreatePatientDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.create(dto, { id: user.sub, name: user.email }, ip, userAgent);
  }

  @Patch(':id')
  @RequirePermissions(PermissionResource.PATIENT, PermissionAction.UPDATE)
  @ApiOperation({
    operationId: 'patientsUpdate',
    summary: 'Atualizar dados cadastrais do paciente',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.update(id, dto, { id: user.sub, name: user.email }, ip, userAgent);
  }

  @Get(':id/records')
  @RequirePermissions(PermissionResource.RECORD, PermissionAction.READ)
  @ApiOperation({
    operationId: 'patientsGetRecords',
    summary: 'Obter histórico e evoluções clínicas do prontuário',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async getRecords(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.getRecords(id, { id: user.sub, name: user.email }, ip, userAgent);
  }

  @Post(':id/records')
  @RequirePermissions(PermissionResource.RECORD, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'patientsAddRecordEntry',
    summary: 'Adicionar nova evolução clínica / exame / diagnóstico ao prontuário',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  async addRecordEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMedicalRecordEntryDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    const { ip, userAgent } = requestMeta(req);
    return this.patientsService.addRecordEntry(id, dto, { id: user.sub, name: user.email }, ip, userAgent);
  }
}
