import { type MigrationInterface, type QueryRunner } from 'typeorm';
import { SEED_ADMIN_EMAIL } from '../seed-defaults';

/** Colunas opcionais no histórico; linhas antigas ficam com string vazia até PATCH. Bootstrap admin ganha etiqueta por omissão. */
export class AddUserNomeSobrenome1740000000001 implements MigrationInterface {
  name = 'AddUserNomeSobrenome1740000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "nome" character varying(120) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "sobrenome" character varying(120) NOT NULL DEFAULT ''
    `);
    const email = SEED_ADMIN_EMAIL.toLowerCase();
    await queryRunner.query(
      `UPDATE "users" SET "nome" = $1, "sobrenome" = $2 WHERE "email" = $3`,
      ['Admin', 'Sistema', email],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sobrenome"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nome"`);
  }
}
