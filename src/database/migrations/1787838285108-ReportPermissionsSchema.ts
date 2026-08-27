import { MigrationInterface, QueryRunner } from "typeorm";

export class ReportPermissionsSchema1787838285108 implements MigrationInterface {
    name = 'ReportPermissionsSchema1787838285108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."professional_profiles_council_type_enum" RENAME TO "professional_profiles_council_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."professional_profiles_council_type_enum" AS ENUM('CRM', 'COREN', 'CRF', 'CRP', 'NONE')`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" TYPE "public"."professional_profiles_council_type_enum" USING "council_type"::"text"::"public"."professional_profiles_council_type_enum"`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" SET DEFAULT 'NONE'`);
        await queryRunner.query(`DROP TYPE "public"."professional_profiles_council_type_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_permissions_resource_action"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum" RENAME TO "permissions_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('PATIENT', 'RECORD', 'PHARMACY', 'CONVENIO', 'SYSTEM', 'REPORT')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum" USING "resource"::"text"::"public"."permissions_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_action_enum" RENAME TO "permissions_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "public"."permissions_action_enum" USING "action"::"text"::"public"."permissions_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_permissions_resource_action" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`
            INSERT INTO "permissions" ("resource", "action")
            VALUES ('REPORT', 'READ'), ('REPORT', 'ALL')
            ON CONFLICT DO NOTHING;
        `);
        await queryRunner.query(`
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r.id, p.id
            FROM "roles" r
            CROSS JOIN "permissions" p
            WHERE r.name = 'ADMIN' AND p.resource = 'REPORT'
            ON CONFLICT DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_permissions_resource_action"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum_old" AS ENUM('READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "public"."permissions_action_enum_old" USING "action"::"text"::"public"."permissions_action_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_action_enum_old" RENAME TO "permissions_action_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum_old" AS ENUM('PATIENT', 'RECORD', 'PHARMACY', 'CONVENIO', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum_old" USING "resource"::"text"::"public"."permissions_resource_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum_old" RENAME TO "permissions_resource_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_permissions_resource_action" ON "permissions" ("resource", "action") `);
        await queryRunner.query(`CREATE TYPE "public"."professional_profiles_council_type_enum_old" AS ENUM('CRM', 'COREN', 'CRF', 'CRP', 'NONE')`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" TYPE "public"."professional_profiles_council_type_enum_old" USING "council_type"::"text"::"public"."professional_profiles_council_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" SET DEFAULT 'NONE'`);
        await queryRunner.query(`DROP TYPE "public"."professional_profiles_council_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."professional_profiles_council_type_enum_old" RENAME TO "professional_profiles_council_type_enum"`);
    }

}
