import {
  ApiBearerAuth,
  ApiBody,
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
import { CurrentUser } from '../core/decorators/current-user.decorator';
import { Roles } from '../core/decorators/roles.decorator';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'usersGetMe',
    summary: 'Perfil do usuário autenticado',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async me(@CurrentUser() auth: JwtPayload): Promise<UserResponseDto> {
    const u = await this.users.findById(auth.sub);
    if (!u) {
      throw new NotFoundException('User not found');
    }
    return toUserResponse(u);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    operationId: 'usersList',
    summary: 'Listar usuários (administrador)',
    description: 'Paginação: `page` começa em 1; `limit` com máximo 100.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async list(@Query() query: PaginationQueryDto): Promise<{
    data: UserResponseDto[];
    meta: { page: number; limit: number; total: number };
  }> {
    const page = query.page;
    const limit = query.limit;
    const { rows, total } = await this.users.findPage(page, limit);
    return {
      data: rows.map((u) => toUserResponse(u)),
      meta: { page, limit, total },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    operationId: 'usersCreate',
    summary: 'Criar utilizador',
    description:
      'Apenas administrador. Auditoria `createdBy` definida pelo token.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Criado' })
  @ApiResponse({ status: 400, description: 'Validação falhou' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 409, description: 'E-mail já em uso' })
  async create(
    @CurrentUser() auth: JwtPayload,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const u = await this.users.createFromPlainInput(dto, auth.sub);
    return toUserResponse(u);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'usersGetById',
    summary: 'Obter utilizador por ID',
    description: 'Administrador ou o próprio utilizador.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async getById(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    if (auth.role !== UserRole.ADMIN && auth.sub !== id) {
      throw new ForbiddenException('Não pode ver este utilizador.');
    }
    const u = await this.users.findById(id);
    if (!u) {
      throw new NotFoundException('Utilizador não encontrado.');
    }
    return toUserResponse(u);
  }

  @Patch(':id')
  @ApiOperation({
    operationId: 'usersUpdate',
    summary: 'Atualizar utilizador',
    description:
      'Administrador: pode alterar e-mail, senha e role. Utilizador: apenas o próprio registo — e-mail e senha (não pode alterar role).',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 400, description: 'Body inválido ou vazio' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  @ApiResponse({ status: 409, description: 'E-mail em uso' })
  async update(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const u = await this.users.updateById(auth.sub, auth.role, id, dto);
    return toUserResponse(u);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    operationId: 'usersRemove',
    summary: 'Remover utilizador',
    description:
      'Apenas administrador. Não é permitido remover a própria conta.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 400, description: 'Pedido inválido' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Não encontrado' })
  async remove(
    @CurrentUser() auth: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ deleted: boolean; id: string }> {
    await this.users.removeById(auth.sub, auth.role, id);
    return { deleted: true, id };
  }
}
