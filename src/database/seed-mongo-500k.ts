import 'reflect-metadata';
import mongoose, { Schema } from 'mongoose';
import { config } from 'dotenv';

config();

const mongoUri =
  process.env.MONGO_URI ||
  'mongodb://admin:admin123@localhost:27017/nexor_analytics?authSource=admin';

const IngestedEventSchema = new Schema(
  {
    systemKey: { type: String, required: true, index: true },
    patientRecordNumber: { type: String, required: true },
    patientName: { type: String, required: true },
    eventType: { type: String, required: true },
    sector: { type: String, required: true },
    attendingPhysician: { type: String },
    insuranceName: { type: String },
    rawPayload: { type: Object },
    costEstimated: { type: Number, default: 0 },
    attendanceDurationMinutes: { type: Number, default: 30 },
    eventDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, collection: 'ingested_events' },
);

IngestedEventSchema.index({ systemKey: 1, eventDate: -1 });
IngestedEventSchema.index({ sector: 1, eventDate: -1 });

const IngestedEventModel = mongoose.model('IngestedEvent', IngestedEventSchema);

const firstNames = [
  'Lucas', 'Gabriel', 'Mateus', 'Maria', 'Ana', 'Juliana', 'Carlos', 'Beatriz',
  'Rodrigo', 'Fernanda', 'Rafael', 'Camila', 'Guilherme', 'Larissa', 'Bruno',
  'Amanda', 'Diego', 'Leticia', 'Felipe', 'Mariana', 'Vinicius', 'Patricia',
  'Gustavo', 'Jessica', 'Leonardo', 'Bruna', 'Thiago', 'Vanessa', 'Danilo', 'Renata',
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
  'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado',
];

const physicians = [
  'Dr. Carlos Eduardo', 'Dra. Ana Paula', 'Dr. Roberto Miranda',
  'Dra. Camila Nogueira', 'Dr. Marcelo Fonseca', 'Dra. Juliana Bastos',
  'Dr. Fernando Albuquerque', 'Dra. Patricia Medeiros',
];

const systems = ['TASY', 'ESUS', 'TOTVS', 'CFM', 'ANS'];
const sectors = ['UTI', 'Enfermaria', 'Ambulatório', 'Emergência', 'Cardiologia', 'Ortopedia', 'Pediatria'];
const eventTypes = ['CONSULTATION', 'EXAM', 'PROCEDURE', 'MEDICATION', 'ADMISSION', 'DISCHARGE'];
const insurances = ['SUS', 'Unimed', 'Bradesco Saúde', 'SulAmérica', 'Amil', 'NotreDame Intermédica'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateBulkData() {
  console.log(`Conectando ao MongoDB em ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const TOTAL_RECORDS = 500_000;
  const BATCH_SIZE = 10_000;
  const totalBatches = TOTAL_RECORDS / BATCH_SIZE;

  console.log(`Iniciando geração de ${TOTAL_RECORDS.toLocaleString('pt-BR')} registros analíticos em lote...`);
  console.log(`Lotes: ${totalBatches} lotes de ${BATCH_SIZE.toLocaleString('pt-BR')} documentos cada.\n`);

  const startTime = Date.now();

  for (let b = 1; b <= totalBatches; b++) {
    const docs = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const globalIndex = (b - 1) * BATCH_SIZE + i;
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const system = randomChoice(systems);
      const sector = randomChoice(sectors);
      const eventType = randomChoice(eventTypes);
      const insurance = randomChoice(insurances);
      const physician = randomChoice(physicians);

      // Distribuir datas nos últimos 180 dias
      const pastDays = Math.floor(Math.random() * 180);
      const pastHours = Math.floor(Math.random() * 24);
      const pastMinutes = Math.floor(Math.random() * 60);
      const eventDate = new Date(Date.now() - (pastDays * 86400000 + pastHours * 3600000 + pastMinutes * 60000));

      const duration = Math.floor(Math.random() * 50 + 15);
      const cost = Math.floor(Math.random() * 2500 + 200);

      docs.push({
        systemKey: system,
        patientRecordNumber: `REC-${100000 + (globalIndex % 400000)}`,
        patientName: fullName,
        eventType,
        sector,
        attendingPhysician: physician,
        insuranceName: insurance,
        rawPayload: {
          simulatedBatch: b,
          protocolId: `HL7-${Date.now()}-${globalIndex}`,
          interoperabilityScore: (Math.random() * 0.4 + 0.6).toFixed(2),
        },
        costEstimated: cost,
        attendanceDurationMinutes: duration,
        eventDate,
      });
    }

    await IngestedEventModel.insertMany(docs, { ordered: false });
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const progress = ((b / totalBatches) * 100).toFixed(1);
    console.log(`[Lote ${b}/${totalBatches}] Inseridos ${(b * BATCH_SIZE).toLocaleString('pt-BR')} registros (${progress}%) - Tempo: ${elapsedSeconds}s`);
  }

  const totalInserted = await IngestedEventModel.countDocuments();
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Sucesso! Total de registros no MongoDB: ${totalInserted.toLocaleString('pt-BR')}`);
  console.log(`⏱️ Tempo total de ingestão: ${totalDuration}s`);

  await mongoose.disconnect();
}

generateBulkData().catch((err) => {
  console.error('Erro na geração de dados:', err);
  process.exit(1);
});
