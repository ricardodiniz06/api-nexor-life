import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 10;

function normalizeNameSegment(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findByEmailWithSecret(email: string): Promise<User | null> {
    return this.findByEmail(email);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Cria utilizador já com hash (sementes/migrações internas).
   */
  async create(data: {
    nome: string;
    sobrenome: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdBy: string | null;
  }): Promise<User> {
    const entity = this.repo.create({
      nome: normalizeNameSegment(data.nome),
      sobrenome: normalizeNameSegment(data.sobrenome),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      createdBy: data.createdBy,
    });
    return this.repo.save(entity);
  }

  async createFromPlainInput(
    dto: CreateUserDto,
    createdByUserId: string | null,
  ): Promise<User> {
    const email = dto.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Este e-mail já está registado.');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const role = dto.role ?? UserRole.VIEWER;
    return this.create({
      nome: dto.nome as string,
      sobrenome: dto.sobrenome as string,
      email,
      passwordHash,
      role,
      createdBy: createdByUserId,
    });
  }

  async updateById(
    actorSub: string,
    actorRole: UserRole,
    targetId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const hasField =
      dto.email !== undefined ||
      dto.password !== undefined ||
      dto.role !== undefined ||
      dto.nome !== undefined ||
      dto.sobrenome !== undefined;
    if (!hasField) {
      throw new BadRequestException(
        'Envie pelo menos um dos campos: nome, sobrenome, email, password ou role.',
      );
    }

    const isAdmin = actorRole === UserRole.ADMIN;
    const isSelf = actorSub === targetId;
    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('Não pode editar outro utilizador.');
    }
    if (!isAdmin && dto.role !== undefined) {
      throw new ForbiddenException(
        'Apenas administrador pode alterar o perfil (role).',
      );
    }

    const user = await this.findById(targetId);
    if (!user) {
      throw new NotFoundException('Utilizador não encontrado.');
    }

    if (dto.email !== undefined) {
      const next = dto.email.toLowerCase();
      const taken = await this.findByEmail(next);
      if (taken && taken.id !== targetId) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      user.email = next;
    }

    if (dto.role !== undefined && isAdmin) {
      user.role = dto.role;
    }

    if (dto.nome !== undefined) {
      user.nome = normalizeNameSegment(dto.nome);
    }
    if (dto.sobrenome !== undefined) {
      user.sobrenome = normalizeNameSegment(dto.sobrenome);
    }

    if (dto.password !== undefined) {
      user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }

    return this.repo.save(user);
  }

  async removeById(
    actorSub: string,
    actorRole: UserRole,
    targetId: string,
  ): Promise<void> {
    if (actorRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas administrador pode remover utilizadores.',
      );
    }
    if (actorSub === targetId) {
      throw new BadRequestException('Não é possível remover a própria conta.');
    }
    const result = await this.repo.delete(targetId);
    if (!result.affected) {
      throw new NotFoundException('Utilizador não encontrado.');
    }
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async findPage(
    page: number,
    limit: number,
  ): Promise<{ rows: User[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const [rows, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return { rows, total };
  }
}
