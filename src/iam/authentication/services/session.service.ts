import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../entities/session.entity';
import { IamErrorMessages } from '../../common/messages/error-messages';
import { HashingService } from './hashing.service';
import { TokenService } from './token.service';

const MSG = IamErrorMessages.auth;

export type SessionMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessions: Repository<Session>,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
  ) {}

  async createForUser(
    userId: string,
    meta: SessionMeta,
  ): Promise<{ session: Session; refreshToken: string }> {
    const expiresAt = this.tokens.refreshTokenExpiresAt();
    const session = this.sessions.create({
      user: { id: userId },
      refreshToken: '',
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
      expiresAt,
      isRevoked: false,
    });
    const saved = await this.sessions.save(session);
    const refreshToken = this.tokens.generateRefreshToken(saved.id);
    saved.refreshToken = await this.hashing.hash(refreshToken);
    await this.sessions.save(saved);
    return { session: saved, refreshToken };
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<Session> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) {
      throw new UnauthorizedException(MSG.refreshTokenInvalid);
    }

    const session = await this.sessions.findOne({
      where: { id: parsed.sessionId },
      relations: { user: { roles: { permissions: true }, professionalProfile: true } },
    });
    if (!session || session.isRevoked) {
      throw new UnauthorizedException(MSG.refreshTokenInvalid);
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(MSG.refreshTokenExpired);
    }

    const valid = await this.hashing.verify(session.refreshToken, refreshToken);
    if (!valid) {
      throw new UnauthorizedException(MSG.refreshTokenInvalid);
    }

    return session;
  }

  /** Rotação: revoga a sessão atual e emite par novo (detecção de reutilização). */
  async rotate(
    refreshToken: string,
    meta: SessionMeta,
  ): Promise<{ session: Session; refreshToken: string; userId: string }> {
    const current = await this.validateRefreshToken(refreshToken);
    const userId =
      current.user?.id ??
      (
        await this.sessions.findOne({
          where: { id: current.id },
          select: { id: true, user: { id: true } },
          relations: { user: true },
        })
      )?.user?.id;
    if (!userId) {
      throw new UnauthorizedException(MSG.refreshTokenInvalid);
    }
    current.isRevoked = true;
    await this.sessions.save(current);
    const created = await this.createForUser(userId, meta);
    return { ...created, userId };
  }

  async revokeByRefreshToken(refreshToken: string): Promise<void> {
    const parsed = this.tokens.parseRefreshToken(refreshToken);
    if (!parsed) {
      return;
    }
    await this.sessions.update(
      { id: parsed.sessionId },
      { isRevoked: true },
    );
  }
}
