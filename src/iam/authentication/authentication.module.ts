import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthenticationController } from './authentication.controller';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AuthenticationService } from './services/authentication.service';
import { HashingService } from './services/hashing.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Session]),
    PassportModule.register({ defaultStrategy: 'jwt-access' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    HashingService,
    SessionService,
    TokenService,
    AccessTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [
    AuthenticationService,
    HashingService,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
})
export class AuthenticationModule {}
