import { type MigrationInterface, type QueryRunner } from 'typeorm';

/**
 * Schema IAM: identidade, perfil profissional, RBAC e sessões.
 * Ordem respeita dependências de FK (Postgres).
 */
export class IamSchema1736889600000 implements MigrationInterface {
  name = 'IamSchema1736889600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "professional_profiles_council_type_enum" AS ENUM (
        'CRM', 'COREN', 'CRF', 'CRP', 'NONE'
      )
    `);
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
      CREATE TABLE "iam_users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(320) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "is_two_factor_enabled" boolean NOT NULL DEFAULT false,
        "failed_login_attempts" integer NOT NULL DEFAULT 0,
        "locked_until" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_iam_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_iam_users_email" ON "iam_users" ("email")
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(80) NOT NULL,
        "description" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_roles_name" ON "roles" ("name")
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "resource" "permissions_resource_enum" NOT NULL,
        "action" "permissions_action_enum" NOT NULL,
        "description" character varying(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_permissions_resource_action"
        ON "permissions" ("resource", "action")
    `);

    await queryRunner.query(`
      CREATE TABLE "professional_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "full_name" character varying(200) NOT NULL,
        "cpf" character varying(11) NOT NULL,
        "council_type" "professional_profiles_council_type_enum" NOT NULL DEFAULT 'NONE',
        "council_number" character varying(30),
        "specialty" character varying(120),
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_professional_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_professional_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_professional_profiles_user_id"
          FOREIGN KEY ("user_id") REFERENCES "iam_users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_professional_profiles_cpf"
        ON "professional_profiles" ("cpf")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_professional_profiles_council_number"
        ON "professional_profiles" ("council_number")
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "refresh_token_hash" character varying(255) NOT NULL,
        "ip_address" character varying(45),
        "user_agent" character varying(512),
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sessions_user_id"
          FOREIGN KEY ("user_id") REFERENCES "iam_users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_user_id" ON "sessions" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sessions_expires_at" ON "sessions" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "FK_user_roles_user_id"
          FOREIGN KEY ("user_id") REFERENCES "iam_users"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_user_roles_role_id"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_user_id" ON "user_roles" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_roles_role_id" ON "user_roles" ("role_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role_id"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id")
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_role_permissions_permission_id"
          FOREIGN KEY ("permission_id") REFERENCES "permissions"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_role_id" ON "role_permissions" ("role_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_role_permissions_permission_id"
        ON "role_permissions" ("permission_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "professional_profiles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "iam_users"`);
    await queryRunner.query(`DROP TYPE "permissions_action_enum"`);
    await queryRunner.query(`DROP TYPE "permissions_resource_enum"`);
    await queryRunner.query(
      `DROP TYPE "professional_profiles_council_type_enum"`,
    );
  }
}
