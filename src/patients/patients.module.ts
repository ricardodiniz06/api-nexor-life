import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MedicalRecordEntry,
  Patient,
  PatientAllergy,
  PatientRiskAlert,
} from './entities';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      MedicalRecordEntry,
      PatientAllergy,
      PatientRiskAlert,
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
