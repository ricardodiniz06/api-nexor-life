import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { PatientsModule } from './patients/patients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { AlertsModule } from './alerts/alerts.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CoreModule,
    DatabaseModule,
    IamModule,
    PatientsModule,
    DashboardModule,
    ReportsModule,
    IndicatorsModule,
    AlertsModule,
    IntegrationsModule,
    SettingsModule,
  ],
})
export class AppModule {}
