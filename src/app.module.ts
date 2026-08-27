import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './audit/audit.module';
import { ConveniosModule } from './convenios/convenios.module';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { IamModule } from './iam/iam.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CoreModule,
    DatabaseModule,
    AnalyticsModule,
    AuditModule,
    IamModule,
    ConveniosModule,
    PatientsModule,
    IntegrationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
