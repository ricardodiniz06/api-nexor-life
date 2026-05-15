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
  ForbiddenException,
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
import { ApiListQuery } from '../../common/decorators/api-list-query.decorator';
import {
  ListQuery,
  type IListQuery,
} from '../../common/decorators/list-query.decorator';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { PermissionAction } from '../authorization/enums/permission-action.enum';
import { PermissionResource } from '../authorization/enums/permission-resource.enum';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { hasPermission } from '../authorization/utils/permission-key.util';
import { type JwtPayload } from '../authentication/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { toUserResponse, UserResponseDto } from './dto/user-response.dto';
import { IamErrorMessages } from '../common/messages/error-messages';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'usersGetMe',
    summary: 'Perfil do utilizador autenticado',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async me(@CurrentUser() auth: JwtPayload): Promise<UserResponseDto> {
    const user = await this.users.findById(auth.sub);
    if (!user) {
      throw new NotFoundException(IamErrorMessages.users.notFound);
    }
    return toUserResponse(user);
  }

  @Get()
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.READ)
  @ApiOperation({
    operationId: 'usersFindAll',
    summary: 'Listar utilizadores (paginado)',
  })
  @ApiListQuery({
    searchExample: 'cpf:5466607920,email:546,name:546',
    filterExample: 'cpf:5466607920,isActive:true',
  })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Parâmetro de busca/filtro inválido',
  })
  @ApiResponse({ status: 403, description: 'Sem permissão SYSTEM:READ' })
  async findAll(@ListQuery() query: IListQuery): Promise<UserListResponseDto> {
    const result = await this.users.findAll(query);
    return {
      data: result.data.map((u) => toUserResponse(u)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'usersGetById',
    summary: 'Obter utilizador por ID',
    description: 'Administrador (`SYSTEM:READ`) ou o próprio utilizador.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async getById(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const canReadAll = hasPermission(
      auth.permissions,
      PermissionResource.SYSTEM,
      PermissionAction.READ,
    );
    if (!canReadAll && auth.sub !== id) {
      throw new ForbiddenException(IamErrorMessages.users.cannotViewOthers);
    }
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundException(IamErrorMessages.users.notFound);
    }
    return toUserResponse(user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.CREATE)
  @ApiOperation({
    operationId: 'usersCreate',
    summary: 'Criar utilizador com perfil profissional',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'E-mail ou CPF em uso' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.users.createWithProfile(dto);
    return toUserResponse(user);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'usersUpdate',
    summary: 'Atualizar utilizador',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  async update(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.users.updateById(auth, id, dto);
    return toUserResponse(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionResource.SYSTEM, PermissionAction.DELETE)
  @ApiOperation({
    operationId: 'usersRemove',
    summary: 'Remover utilizador (soft delete)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse()
  async remove(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.users.softDeleteById(auth.sub, id);
  }
}
