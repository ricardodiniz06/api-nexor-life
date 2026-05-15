import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { PermissionsGuard } from './authorization/guards/permissions.guard';
import { Permission } from './entities/permission.entity';
import { ProfessionalProfile } from './entities/professional-profile.entity';
import { Role } from './entities/role.entity';
import { Session } from './entities/session.entity';
import { User } from './entities/user.entity';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ProfessionalProfile,
      Role,
      Permission,
      Session,
    ]),
    AuthenticationModule,
    AuthorizationModule,
    UsersModule,
    RolesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthenticationModule, AuthorizationModule, UsersModule, RolesModule],
})
export class IamModule {}
