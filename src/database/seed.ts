import 'reflect-metadata';
import { config } from 'dotenv';
import dataSource from './data-source';
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD_DEFAULT } from './seed-defaults';
import { User } from '../iam/entities/user.entity';
import { Role } from '../iam/entities/role.entity';
import { HashingService } from '../iam/authentication/services/hashing.service';
import {
  AllergySeverity,
  LegalBasis,
  MedicalRecordEntry,
  Patient,
  PatientAllergy,
  PatientGender,
  PatientRiskAlert,
  PatientStatus,
  RecordEntryType,
  RiskSeverity,
} from '../patients/entities';

config();

/**
 * Bootstrap opcional após migrations — nunca regista password em logs.
 */
async function run(): Promise<void> {
  await dataSource.initialize();
  const hashing = new HashingService();
  try {
    const userRepo = dataSource.getRepository(User);
    const roleRepo = dataSource.getRepository(Role);
    const email = SEED_ADMIN_EMAIL.toLowerCase();
    const existing = await userRepo.findOne({ where: { email } });
    // Seed Clinical Patients
    const patientRepo = dataSource.getRepository(Patient);
    const countPatients = await patientRepo.count();
    if (countPatients === 0) {
      const patient1 = await patientRepo.save(
        patientRepo.create({
          recordNumber: '12458',
          name: 'Maria Santos',
          cpf: '12345678900',
          dateOfBirth: '1979-03-22',
          gender: PatientGender.F,
          sector: 'UTI',
          status: PatientStatus.ADMITTED,
          attendingPhysician: 'Dr. Carlos Silva',
          insuranceName: 'Unimed',
          bloodType: 'A+',
          weight: 68,
          height: 162,
          legalBasis: LegalBasis.TUTELA_DA_SAUDE,
          originSystem: 'TASY',
        }),
      );

      const patient2 = await patientRepo.save(
        patientRepo.create({
          recordNumber: '12459',
          name: 'João Oliveira',
          cpf: '98765432100',
          dateOfBirth: '1962-07-10',
          gender: PatientGender.M,
          sector: 'Enfermaria',
          status: PatientStatus.ADMITTED,
          attendingPhysician: 'Dra. Ana Costa',
          insuranceName: 'SUS',
          bloodType: 'O-',
          legalBasis: LegalBasis.TUTELA_DA_SAUDE,
          originSystem: 'ESUS',
        }),
      );

      const recordRepo = dataSource.getRepository(MedicalRecordEntry);
      await recordRepo.save([
        recordRepo.create({
          patientId: patient1.id,
          type: RecordEntryType.CONSULTATION,
          title: 'Consulta de Admissão',
          description: 'Paciente admitida com queixa de dispneia e dor torácica. ECG realizado.',
          professionalName: 'Dr. Carlos Silva',
          sector: 'Pronto-Socorro',
          originSystem: 'TASY',
        }),
        recordRepo.create({
          patientId: patient1.id,
          type: RecordEntryType.EXAM,
          title: 'Exames Laboratoriais',
          description: 'Hemograma completo, coagulograma e troponina. Troponina elevada.',
          professionalName: 'Laboratório Central',
          sector: 'Laboratório',
          originSystem: 'TASY',
        }),
        recordRepo.create({
          patientId: patient1.id,
          type: RecordEntryType.MEDICATION,
          title: 'Prescrição Medicamentosa',
          description: 'Aspirina 100mg, Atenolol 25mg, Atorvastatina 40mg.',
          prescriptions: [
            { name: 'Aspirina', dosage: '100mg', frequency: '1x ao dia', route: 'Oral' },
            { name: 'Atenolol', dosage: '25mg', frequency: '12/12h', route: 'Oral' },
          ],
          professionalName: 'Dr. Carlos Silva',
          sector: 'UTI',
          originSystem: 'TASY',
        }),
      ]);

      const allergyRepo = dataSource.getRepository(PatientAllergy);
      await allergyRepo.save([
        allergyRepo.create({
          patientId: patient1.id,
          name: 'Penicilina',
          severity: AllergySeverity.HIGH,
          reaction: 'Anafilaxia',
          reportedDate: '15/03/2024',
        }),
        allergyRepo.create({
          patientId: patient1.id,
          name: 'Dipirona',
          severity: AllergySeverity.MODERATE,
          reaction: 'Urticária',
          reportedDate: '20/06/2023',
        }),
      ]);

      const riskRepo = dataSource.getRepository(PatientRiskAlert);
      await riskRepo.save([
        riskRepo.create({
          patientId: patient1.id,
          type: 'Risco de Queda',
          severity: RiskSeverity.HIGH,
          description: 'Paciente com histórico de quedas e uso de medicamentos sedativos.',
        }),
      ]);

      console.log('Seed done: initial clinical patients and medical records created.');
    }
  } finally {
    await dataSource.destroy();
  }
}

void run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
