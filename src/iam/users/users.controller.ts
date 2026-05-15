import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
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
    operationId: 'usersList',
    summary: 'Listar utilizadores (paginado)',
    description: 'Paginação: `page` começa em 1; `limit` máximo 100.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiResponse({ status: 403, description: 'Sem permissão SYSTEM:READ' })
  async list(
    @Query() query: PaginationQueryDto,
  ): Promise<UserListResponseDto> {
    const page = query.page;
    const limit = query.limit;
    const { rows, total } = await this.users.findPage(page, limit);
    return {
      data: rows.map((u) => toUserResponse(u)),
      meta: { page, limit, total },
    };
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'usersGetById',
    summary: 'Obter utilizador por ID',
    description:
      'Administrador (`SYSTEM:READ`) ou o próprio utilizador.',
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
    description:
      'Administrador (`SYSTEM:UPDATE`): todos os campos. Utilizador: apenas o próprio registo (sem papéis/estado/2FA).',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Body vazio ou inválido' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'E-mail ou CPF em uso' })
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
    description:
      'Revoga sessões e marca `deleted_at`. Não é permitido remover a própria conta.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Removido' })
  @ApiResponse({ status: 400, description: 'Não pode remover a própria conta' })
  @ApiResponse({ status: 403, description: 'Sem permissão SYSTEM:DELETE' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async remove(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.users.softDeleteById(auth.sub, id);
  }
}
