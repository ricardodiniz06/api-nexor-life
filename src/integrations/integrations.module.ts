import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Integration } from './entities/integration.entity';
import { Patient, MedicalRecordEntry } from '../patients/entities';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BrasilApiModule } from './brasil-api/brasil-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, Patient, MedicalRecordEntry]),
    BrasilApiModule,
    AnalyticsModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService, BrasilApiModule],
})
export class IntegrationsModule {}
