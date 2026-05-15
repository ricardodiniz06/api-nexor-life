import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PermissionAction } from '../authorization/enums/permission-action.enum';
import { PermissionResource } from '../authorization/enums/permission-resource.enum';
import { hasPermission } from '../authorization/utils/permission-key.util';
import { type JwtPayload } from '../authentication/interfaces/jwt-payload.interface';
import { ProfessionalProfile } from '../entities/professional-profile.entity';
import { Role } from '../entities/role.entity';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { CouncilType } from '../enums/council-type.enum';
import { HashingService } from '../authentication/services/hashing.service';
import {
  ACCOUNT_LOCK_MINUTES,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from '../authentication/constants';
import { IamErrorMessages } from '../common/messages/error-messages';
import { type CreateUserDto } from './dto/create-user.dto';
import { type UpdateUserDto } from './dto/update-user.dto';

const MSG = IamErrorMessages.users;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Role)
    private readonly roles: Repository<Role>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly hashing: HashingService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email: email.toLowerCase() },
      relations: { roles: true, professionalProfile: true },
    });
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.users.findOne({
      where: { email: email.toLowerCase(), isActive: true },
      relations: { roles: { permissions: true }, professionalProfile: true },
    });
  }

  async findByIdForAuth(id: string): Promise<User | null> {
    return this.users.findOne({
      where: { id, isActive: true },
      relations: { roles: { permissions: true }, professionalProfile: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({
      where: { id },
      relations: { roles: true, professionalProfile: true },
    });
  }

  /** User + ProfessionalProfile na mesma transação — evita identidade órfã. */
  async createWithProfile(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException(MSG.emailInUse);
    }

    const cpfTaken = await this.dataSource
      .getRepository(ProfessionalProfile)
      .exists({ where: { cpf: dto.cpf } });
    if (cpfTaken) {
      throw new ConflictException(MSG.cpfInUse);
    }

    const passwordHash = await this.hashing.hash(dto.password);
    const roleEntities = await this.resolveRoles(dto.roleIds);

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const profileRepo = manager.getRepository(ProfessionalProfile);

      const user = userRepo.create({
        email,
        passwordHash,
        isTwoFactorEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        isActive: true,
        roles: roleEntities,
      });
      const savedUser = await userRepo.save(user);

      const profile = profileRepo.create({
        fullName: dto.fullName.trim(),
        cpf: dto.cpf,
        councilType: dto.councilType ?? CouncilType.NONE,
        councilNumber: dto.councilNumber ?? null,
        specialty: dto.specialty ?? null,
        user: savedUser,
      });
      await profileRepo.save(profile);

      const full = await userRepo.findOne({
        where: { id: savedUser.id },
        relations: { roles: true, professionalProfile: true },
      });
      if (!full) {
        throw new NotFoundException(MSG.notFoundAfterCreate);
      }
      return full;
    });
  }

  async recordFailedLogin(userId: string): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      return;
    }
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      user.lockedUntil = new Date(
        Date.now() + ACCOUNT_LOCK_MINUTES * 60 * 1000,
      );
    }
    await this.users.save(user);
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.users.update(
      { id: userId },
      { failedLoginAttempts: 0, lockedUntil: null },
    );
  }

  async count(): Promise<number> {
    return this.users.count();
  }

  async findPage(
    page: number,
    limit: number,
  ): Promise<{ rows: User[]; total: number }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const [rows, total] = await this.users.findAndCount({
      relations: { roles: true, professionalProfile: true },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return { rows, total };
  }

  async updateById(
    actor: JwtPayload,
    targetId: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    const isSelf = actor.sub === targetId;
    const canManage = hasPermission(
      actor.permissions,
      PermissionResource.SYSTEM,
      PermissionAction.UPDATE,
    );

    if (!isSelf && !canManage) {
      throw new ForbiddenException(MSG.cannotEditOthers);
    }

    if (
      !canManage &&
      (dto.roleIds !== undefined ||
        dto.isActive !== undefined ||
        dto.isTwoFactorEnabled !== undefined)
    ) {
      throw new ForbiddenException(MSG.adminOnlyFields);
    }

    if (!this.hasUpdateFields(dto)) {
      throw new BadRequestException(MSG.emptyUpdate);
    }

    const user = await this.findById(targetId);
    if (!user) {
      throw new NotFoundException(MSG.notFound);
    }

    if (dto.email !== undefined) {
      const next = dto.email.toLowerCase();
      const taken = await this.users.findOne({ where: { email: next } });
      if (taken && taken.id !== targetId) {
        throw new ConflictException(MSG.emailInUse);
      }
      user.email = next;
    }

    if (dto.password !== undefined) {
      user.passwordHash = await this.hashing.hash(dto.password);
    }

    if (dto.isActive !== undefined && canManage) {
      user.isActive = dto.isActive;
    }

    if (dto.isTwoFactorEnabled !== undefined && canManage) {
      user.isTwoFactorEnabled = dto.isTwoFactorEnabled;
    }

    if (dto.roleIds !== undefined && canManage) {
      user.roles = await this.resolveRoles(dto.roleIds);
    }

    const profile = user.professionalProfile;
    if (!profile) {
      throw new NotFoundException(MSG.notFound);
    }

    if (dto.cpf !== undefined && dto.cpf !== profile.cpf) {
      const otherWithCpf = await this.dataSource
        .getRepository(ProfessionalProfile)
        .findOne({ where: { cpf: dto.cpf } });
      if (otherWithCpf && otherWithCpf.id !== profile.id) {
        throw new ConflictException(MSG.cpfInUse);
      }
      profile.cpf = dto.cpf;
    }

    if (dto.fullName !== undefined) {
      profile.fullName = dto.fullName.trim();
    }
    if (dto.councilType !== undefined) {
      profile.councilType = dto.councilType;
    }
    if (dto.councilNumber !== undefined) {
      profile.councilNumber = dto.councilNumber;
    }
    if (dto.specialty !== undefined) {
      profile.specialty = dto.specialty;
    }

    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ProfessionalProfile).save(profile);
      await manager.getRepository(User).save(user);
      const updated = await manager.getRepository(User).findOne({
        where: { id: targetId },
        relations: { roles: true, professionalProfile: true },
      });
      if (!updated) {
        throw new NotFoundException(MSG.notFound);
      }
      return updated;
    });
  }

  /** Soft delete — preserva auditoria; revoga sessões ativas. */
  async softDeleteById(actorSub: string, targetId: string): Promise<void> {
    if (actorSub === targetId) {
      throw new BadRequestException(MSG.cannotDeleteSelf);
    }

    const user = await this.findById(targetId);
    if (!user) {
      throw new NotFoundException(MSG.notFound);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(Session)
        .update({ user: { id: targetId } }, { isRevoked: true });
      await manager.getRepository(User).softRemove(user);
    });
  }

  private hasUpdateFields(dto: UpdateUserDto): boolean {
    return (
      dto.email !== undefined ||
      dto.password !== undefined ||
      dto.fullName !== undefined ||
      dto.cpf !== undefined ||
      dto.councilType !== undefined ||
      dto.councilNumber !== undefined ||
      dto.specialty !== undefined ||
      dto.roleIds !== undefined ||
      dto.isActive !== undefined ||
      dto.isTwoFactorEnabled !== undefined
    );
  }

  private async resolveRoles(roleIds?: string[]): Promise<Role[]> {
    if (!roleIds?.length) {
      return [];
    }
    const found = await this.roles.find({ where: { id: In(roleIds) } });
    if (found.length !== roleIds.length) {
      throw new NotFoundException(MSG.rolesNotFound);
    }
    return found;
  }
}
