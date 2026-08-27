import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as loadEnv } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { join } from 'node:path';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { Convenio } from '../convenios/entities';
import {
  Permission,
  ProfessionalProfile,
  Role,
  Session,
  User,
} from '../iam/entities';
import { Integration } from '../integrations/entities/integration.entity';
import {
  MedicalRecordEntry,
  Patient,
  PatientAllergy,
  PatientRiskAlert,
} from '../patients/entities';
import { parseSynchronizeFlag } from './parse-synchronize';

const entityList = [
  User,
  ProfessionalProfile,
  Role,
  Permission,
  Session,
  Convenio,
  Patient,
  MedicalRecordEntry,
  PatientAllergy,
  PatientRiskAlert,
  AuditLog,
  Integration,
];

/**
 * Postgres em nuvem (ex.: Supabase) usa TLS; `rejectUnauthorized: false` aceita certificados
 * sem cadeia completa verificável no cliente. Para Postgres local sem SSL: `DB_SSL=false`.
 */
function postgresSsl(): { rejectUnauthorized: boolean } | undefined {
  if (process.env.DB_SSL === 'false') {
    return undefined;
  }
  return { rejectUnauthorized: false };
}

function databaseUrlOrParts(): {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
} {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (url) {
    return { url };
  }
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'nexor_life',
  };
}

/**
 * Shared options for Nest runtime and TypeORM CLI (`data-source.ts`).
 * Never enable synchronize in production — use migrations only.
 */
export function buildTypeOrmOptions(): TypeOrmModuleOptions &
  DataSourceOptions {
  const conn = databaseUrlOrParts();
  const synchronize = parseSynchronizeFlag(process.env.TYPEORM_SYNCHRONIZE);
  const ssl = postgresSsl();

  return {
    type: 'postgres',
    ...conn,
    ...(ssl !== undefined ? { ssl } : {}),
    entities: entityList,
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    migrationsTransactionMode: 'each',
    synchronize,
    logging: process.env.DB_LOGGING === 'true',
  };
}

export function buildDataSource(): DataSource {
  loadEnv();
  const options = buildTypeOrmOptions();
  return new DataSource(options);
}
