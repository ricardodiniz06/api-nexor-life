import { type MigrationInterface, type QueryRunner } from 'typeorm';

const RESOURCES = ['PATIENT', 'RECORD', 'PHARMACY', 'SYSTEM'] as const;
const ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL'] as const;

/**
 * Alinha enums de permissão ao modelo RBAC v2 (PATIENT/RECORD/… + CREATE/ALL).
 * Idempotente para bases que já tinham PRONTUARIO/WRITE/etc.
 */
export class IamPermissionEnumsV21736889600002 implements MigrationInterface {
  name = 'IamPermissionEnumsV21736889600002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "permissions"`);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "resource" TYPE varchar(32) USING "resource"::text,
      ALTER COLUMN "action" TYPE varchar(32) USING "action"::text
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "permissions_resource_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "permissions_action_enum"`);

    await queryRunner.query(`
      CREATE TYPE "permissions_resource_enum" AS ENUM (
        'PATIENT', 'RECORD', 'PHARMACY', 'SYSTEM'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "permissions_action_enum" AS ENUM (
        'READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "resource" TYPE "permissions_resource_enum"
        USING "resource"::"permissions_resource_enum",
      ALTER COLUMN "action" TYPE "permissions_action_enum"
        USING "action"::"permissions_action_enum"
    `);

    for (const resource of RESOURCES) {
      for (const action of ACTIONS) {
        await queryRunner.query(
          `INSERT INTO "permissions" ("resource", "action", "description")
           VALUES ($1::permissions_resource_enum, $2::permissions_action_enum, NULL)
           ON CONFLICT ("resource", "action") DO NOTHING`,
          [resource, action],
        );
      }
    }

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.name = 'ADMIN'
      ON CONFLICT ("role_id", "permission_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "permissions"`);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "resource" TYPE varchar(32),
      ALTER COLUMN "action" TYPE varchar(32)
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS "permissions_resource_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "permissions_action_enum"`);

    await queryRunner.query(`
      CREATE TYPE "permissions_resource_enum" AS ENUM (
        'PRONTUARIO', 'PACIENTE', 'USUARIO', 'RELATORIO'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "permissions_action_enum" AS ENUM (
        'READ', 'WRITE', 'UPDATE', 'DELETE', 'EXECUTE'
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permissions"
      ALTER COLUMN "resource" TYPE "permissions_resource_enum"
        USING 'USUARIO'::"permissions_resource_enum",
      ALTER COLUMN "action" TYPE "permissions_action_enum"
        USING 'READ'::"permissions_action_enum"
    `);
  }
}
