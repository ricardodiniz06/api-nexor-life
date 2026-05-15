import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { aggregatePermissionKeys } from '../../authorization/utils/permission-key.util';
import { type JwtPayload } from '../interfaces/jwt-payload.interface';
import { type SignInDto } from '../dto/sign-in.dto';
import { IamErrorMessages } from '../../common/messages/error-messages';
import { HashingService } from './hashing.service';
import { SessionService, type SessionMeta } from './session.service';
import { TokenService } from './token.service';
import { UsersService } from 'src/iam/users/users.service';

const MSG = IamErrorMessages.auth;

export type AuthTokensResult = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresAt: string;
};

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly usersService: UsersService,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionService,
  ) {}

  async signIn(dto: SignInDto, meta: SessionMeta): Promise<AuthTokensResult> {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmailForAuth(email);
    if (!user) {
      throw new UnauthorizedException(MSG.invalidCredentials);
    }

    this.assertAccountUsable(user);

    const passwordOk = await this.hashing.verify(
      user.passwordHash,
      dto.password,
    );
    if (!passwordOk) {
      await this.usersService.recordFailedLogin(user.id);
      throw new UnauthorizedException(MSG.invalidCredentials);
    }

    await this.usersService.resetLoginAttempts(user.id);

    if (this.hashing.needsRehash(user.passwordHash)) {
      user.passwordHash = await this.hashing.hash(dto.password);
      await this.users.save(user);
    }

    return this.issueTokensForUser(user, meta);
  }

  async refreshTokens(
    refreshToken: string,
    meta: SessionMeta,
  ): Promise<AuthTokensResult> {
    const rotated = await this.sessions.rotate(refreshToken, meta);
    const user = await this.usersService.findByIdForAuth(rotated.userId);
    if (!user) {
      await this.sessions.revokeByRefreshToken(rotated.refreshToken);
      throw new UnauthorizedException(MSG.refreshTokenInvalid);
    }

    this.assertAccountUsable(user);
    const payload = this.buildPayload(user);
    const accessToken = await this.tokens.signAccessToken(payload);

    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken: rotated.refreshToken,
      expiresIn: this.tokens.accessTokenExpiresInSeconds(),
      refreshExpiresAt: rotated.session.expiresAt.toISOString(),
    };
  }

  async signOut(refreshToken: string): Promise<void> {
    await this.sessions.revokeByRefreshToken(refreshToken);
  }

  private assertAccountUsable(user: User): void {
    if (!user.isActive) {
      throw new UnauthorizedException(MSG.accountDisabled);
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException(MSG.accountLocked);
    }
  }

  private buildPayload(user: User): JwtPayload {
    const roles = (user.roles ?? [])
      .filter((r) => r.isActive)
      .map((r) => r.name);
    return {
      sub: user.id,
      email: user.email,
      profileId: user.professionalProfile?.id ?? null,
      roles,
      permissions: aggregatePermissionKeys(user.roles ?? []),
    };
  }

  private async issueTokensForUser(
    user: User,
    meta: SessionMeta,
  ): Promise<AuthTokensResult> {
    const payload = this.buildPayload(user);
    const accessToken = await this.tokens.signAccessToken(payload);
    const created = await this.sessions.createForUser(user.id, meta);

    return {
      tokenType: 'Bearer',
      accessToken,
      refreshToken: created.refreshToken,
      expiresIn: this.tokens.accessTokenExpiresInSeconds(),
      refreshExpiresAt: created.session.expiresAt.toISOString(),
    };
  }
}
