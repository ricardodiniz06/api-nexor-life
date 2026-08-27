import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient, MedicalRecordEntry } from '../patients/entities';
import { Integration } from '../integrations/entities/integration.entity';
import { Convenio } from '../convenios/entities';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      MedicalRecordEntry,
      Integration,
      Convenio,
      AuditLog,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
