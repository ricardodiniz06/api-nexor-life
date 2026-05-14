import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { type JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { type LoginDto } from './dto/login.dto';
import { type User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findByEmailWithSecret(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const user = await this.validateUser(dto.email, dto.password);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const expiresIn = 3600;
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: `${expiresIn}s`,
    });
    return { accessToken, expiresIn };
  }
}
