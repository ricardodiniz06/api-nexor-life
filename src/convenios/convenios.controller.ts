import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiListQuery } from '../common/decorators/api-list-query.decorator';
import {
  ListQuery,
  type IListQuery,
} from '../common/decorators/list-query.decorator';
import { PermissionAction } from '../iam/authorization/enums/permission-action.enum';
import { PermissionResource } from '../iam/authorization/enums/permission-resource.enum';
import { RequirePermissions } from '../iam/authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../iam/authorization/guards/permissions.guard';
import { ConveniosErrorMessages } from './common/messages/error-messages';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { UpdateConvenioDto } from './dto/update-convenio.dto';
import { ConvenioListResponseDto } from './dto/convenio-list-response.dto';
import {
  toConvenioResponse,
  ConvenioResponseDto,
} from './dto/convenio-response.dto';
import { ConveniosService } from './convenios.service';

@ApiTags('convenios')
@ApiBearerAuth('access-token')
@Controller('convenios')
@UseGuards(PermissionsGuard)
export class ConveniosController {
  constructor(private readonly convenios: ConveniosService) {}

  @Get()
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.READ)
  @ApiOperation({
    operationId: 'conveniosFindAll',
    summary: 'Listar convênios (paginado)',
  })
  @ApiListQuery({
    searchExample:
      'name:Unimed,legalName:Cooperativa,cnpj:12345678000199,city:São Paulo',
    filterExample: 'isActive:true,state:SP,cnpj:12345678000199',
  })
  @ApiOkResponse({ type: ConvenioListResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Parâmetro de busca/filtro inválido',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão CONVENIO:READ' })
  async findAll(
    @ListQuery() query: IListQuery,
  ): Promise<ConvenioListResponseDto> {
    const result = await this.convenios.findAll(query);
    return {
      data: result.data.map((c) => toConvenioResponse(c)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.READ)
  @ApiOperation({
    operationId: 'conveniosGetById',
    summary: 'Obter convênio por ID',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ConvenioResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão CONVENIO:READ' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConvenioResponseDto> {
    const convenio = await this.convenios.findById(id);
    if (!convenio) {
      throw new NotFoundException(ConveniosErrorMessages.notFound);
    }
    return toConvenioResponse(convenio);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'conveniosCreate',
    summary: 'Criar convênio',
  })
  @ApiBody({ type: CreateConvenioDto })
  @ApiCreatedResponse({ type: ConvenioResponseDto })
  @ApiResponse({ status: 409, description: 'CNPJ em uso' })
  async create(@Body() dto: CreateConvenioDto): Promise<ConvenioResponseDto> {
    const convenio = await this.convenios.create(dto);
    return toConvenioResponse(convenio);
  }

  @Patch(':id')
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.UPDATE)
  @ApiOperation({
    operationId: 'conveniosUpdate',
    summary: 'Atualizar convênio',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateConvenioDto })
  @ApiOkResponse({ type: ConvenioResponseDto })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'CNPJ em uso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConvenioDto,
  ): Promise<ConvenioResponseDto> {
    const convenio = await this.convenios.updateById(id, dto);
    return toConvenioResponse(convenio);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionResource.CONVENIO, PermissionAction.DELETE)
  @ApiOperation({
    operationId: 'conveniosRemove',
    summary: 'Remover convênio',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.convenios.removeById(id);
  }
}
