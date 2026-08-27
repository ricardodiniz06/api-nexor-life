import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegrationsSchema1787836726019 implements MigrationInterface {
    name = 'IntegrationsSchema1787836726019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."integrations_status_enum" AS ENUM('connected', 'error', 'syncing', 'disconnected')`);
        await queryRunner.query(`CREATE TABLE "integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "system_key" character varying(50) NOT NULL, "name" character varying(150) NOT NULL, "description" text NOT NULL, "status" "public"."integrations_status_enum" NOT NULL DEFAULT 'connected', "last_sync" TIMESTAMP WITH TIME ZONE, "last_error" text, "is_enabled" boolean NOT NULL DEFAULT true, "total_synced_records" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_b98ee8f1c00325cabb45086b745" UNIQUE ("system_key"), CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_integration_system_key" ON "integrations" ("system_key") `);
        await queryRunner.query(`ALTER TYPE "public"."professional_profiles_council_type_enum" RENAME TO "professional_profiles_council_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."professional_profiles_council_type_enum" AS ENUM('CRM', 'COREN', 'CRF', 'CRP', 'NONE')`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" TYPE "public"."professional_profiles_council_type_enum" USING "council_type"::"text"::"public"."professional_profiles_council_type_enum"`);
        await queryRunner.query(`ALTER TABLE "professional_profiles" ALTER COLUMN "council_type" SET DEFAULT 'NONE'`);
        await queryRunner.query(`DROP TYPE "public"."professional_profiles_council_type_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_permissions_resource_action"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_resource_enum" RENAME TO "permissions_resource_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_resource_enum" AS ENUM('PATIENT', 'RECORD', 'PHARMACY', 'CONVENIO', 'SYSTEM')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "resource" TYPE "public"."permissions_resource_enum" USING "resource"::"text"::"public"."permissions_resource_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_resource_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_action_enum" RENAME TO "permissions_action_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_action_enum" AS ENUM('READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "action" TYPE "public"."permissions_action_enum" USING "action"::"text"::"public"."permissions_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_action_enum_old"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_permissions_resource_action" ON "permissions" ("resource", "action") `);
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
        await queryRunner.query(`DROP INDEX "public"."IDX_integration_system_key"`);
        await queryRunner.query(`DROP TABLE "integrations"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_status_enum"`);
    }

}
