import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, type UserRole } from './entities/user.entity';

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

  async create(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    createdBy: string | null;
  }): Promise<User> {
    const entity = this.repo.create({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      createdBy: data.createdBy,
    });
    return this.repo.save(entity);
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
