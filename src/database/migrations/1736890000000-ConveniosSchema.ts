import { type MigrationInterface, type QueryRunner } from 'typeorm';

const CONVENIO_ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL'] as const;

/**
 * Tabela de convênios e permissões RBAC do domínio CONVENIO.
 *
 * `transaction = false` — PostgreSQL exige commit antes de usar um valor de enum
 * adicionado com `ALTER TYPE ... ADD VALUE` na mesma sessão de migração.
 */
export class ConveniosSchema1736890000000 implements MigrationInterface {
  name = 'ConveniosSchema1736890000000';

  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "convenios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "cnpj" character varying(14) NOT NULL,
        "legal_name" character varying(200) NOT NULL,
        "trade_name" character varying(200),
        "address_zip_code" character varying(8) NOT NULL,
        "address_street" character varying(200) NOT NULL,
        "address_neighborhood" character varying(120) NOT NULL,
        "address_number" character varying(20) NOT NULL,
        "address_complement" character varying(120),
        "address_city" character varying(120) NOT NULL,
        "address_state" character varying(2) NOT NULL,
        "additional_data" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_convenios" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_convenios_cnpj" ON "convenios" ("cnpj")
    `);

    await queryRunner.query(`
      ALTER TYPE "permissions_resource_enum"
      ADD VALUE IF NOT EXISTS 'CONVENIO'
    `);

    for (const action of CONVENIO_ACTIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("resource", "action", "description")
         VALUES ('CONVENIO'::permissions_resource_enum, $1::permissions_action_enum, NULL)
         ON CONFLICT ("resource", "action") DO NOTHING`,
        [action],
      );
    }

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.name = 'ADMIN' AND p.resource = 'CONVENIO'
      ON CONFLICT ("role_id", "permission_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permission_id" IN (
        SELECT id FROM "permissions" WHERE "resource" = 'CONVENIO'
      )
    `);
    await queryRunner.query(`
      DELETE FROM "permissions" WHERE "resource" = 'CONVENIO'
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_convenios_cnpj"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "convenios"`);
  }
}
