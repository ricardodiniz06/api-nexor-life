import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_EXPIRES_SECONDS,
  REFRESH_TOKEN_BYTES,
  REFRESH_TOKEN_TTL_DAYS,
} from '../constants';
import { type JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  accessTokenExpiresInSeconds(): number {
    return ACCESS_TOKEN_EXPIRES_SECONDS;
  }

  refreshTokenExpiresAt(): Date {
    const ms = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }

  /** Formato opaco: `{sessionId}.{secret}` — só o hash do secret persiste na BD. */
  generateRefreshToken(sessionId: string): string {
    const secret = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    return `${sessionId}.${secret}`;
  }

  parseRefreshToken(
    token: string,
  ): { sessionId: string; secret: string } | null {
    const dot = token.indexOf('.');
    if (dot <= 0) {
      return null;
    }
    const sessionId = token.slice(0, dot);
    const secret = token.slice(dot + 1);
    if (!sessionId || !secret) {
      return null;
    }
    return { sessionId, secret };
  }
}
