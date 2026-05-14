import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  NotFoundException,
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
    description:
      'Paginação: `page` começa em 1; `limit` com máximo 100.',
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
}
