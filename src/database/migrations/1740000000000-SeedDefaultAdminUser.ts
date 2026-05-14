import * as bcrypt from 'bcrypt';
import { type MigrationInterface, type QueryRunner } from 'typeorm';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD_DEFAULT,
} from '../seed-defaults';

/**
 * Insere um administrador inicial se ainda não existir (via `ON CONFLICT` no e-mail).
 * Password: `process.env.SEED_ADMIN_PASSWORD` ou {@link SEED_ADMIN_PASSWORD_DEFAULT}.
 * Corre em ambientes já provisionados pela migration `1736889600000-CreateUsersTable`.
 */
export class SeedDefaultAdminUser1740000000000 implements MigrationInterface {
  name = 'SeedDefaultAdminUser1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password =
      process.env.SEED_ADMIN_PASSWORD ?? SEED_ADMIN_PASSWORD_DEFAULT;
    const passwordHash = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO "users" ("email", "password_hash", "role", "created_by")
       VALUES ($1, $2, 'admin', NULL)
       ON CONFLICT ("email") DO NOTHING`,
      [SEED_ADMIN_EMAIL.toLowerCase(), passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [
      SEED_ADMIN_EMAIL.toLowerCase(),
    ]);
  }
}
