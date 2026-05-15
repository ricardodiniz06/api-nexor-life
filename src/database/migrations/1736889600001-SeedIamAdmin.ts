import * as bcrypt from 'bcrypt';
import { type MigrationInterface, type QueryRunner } from 'typeorm';
import {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD_DEFAULT,
} from '../seed-defaults';

/** CPF fictício apenas para bootstrap em dev — substituir em produção. */
const SEED_ADMIN_CPF = '00000000001';

/**
 * Papel ADMIN, permissões base e utilizador inicial (idempotente por e-mail/CPF).
 * Password: `process.env.SEED_ADMIN_PASSWORD` ou {@link SEED_ADMIN_PASSWORD_DEFAULT}.
 */
export class SeedIamAdmin1736889600001 implements MigrationInterface {
  name = 'SeedIamAdmin1736889600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const password =
      process.env.SEED_ADMIN_PASSWORD ?? SEED_ADMIN_PASSWORD_DEFAULT;
    const passwordHash = await bcrypt.hash(password, 10);
    const email = SEED_ADMIN_EMAIL.toLowerCase();

    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description", "is_active")
      VALUES ('ADMIN', 'Administrador do sistema', true)
      ON CONFLICT ("name") DO NOTHING
    `);

    const resources = ['PATIENT', 'RECORD', 'PHARMACY', 'SYSTEM'] as const;
    const actions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ALL'] as const;

    for (const resource of resources) {
      for (const action of actions) {
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

    await queryRunner.query(
      `INSERT INTO "iam_users" (
         "email", "password_hash", "is_two_factor_enabled",
         "failed_login_attempts", "is_active"
       )
       VALUES ($1, $2, false, 0, true)
       ON CONFLICT ("email") DO NOTHING`,
      [email, passwordHash],
    );

    await queryRunner.query(
      `INSERT INTO "professional_profiles" (
         "full_name", "cpf", "council_type", "user_id"
       )
       SELECT 'Admin Sistema', $1, 'NONE', u.id
       FROM "iam_users" u
       WHERE u.email = $2
         AND NOT EXISTS (
           SELECT 1 FROM "professional_profiles" pp WHERE pp."user_id" = u.id
         )`,
      [SEED_ADMIN_CPF, email],
    );

    await queryRunner.query(
      `
      INSERT INTO "user_roles" ("user_id", "role_id")
      SELECT u.id, r.id
      FROM "iam_users" u
      INNER JOIN "roles" r ON r.name = 'ADMIN'
      WHERE u.email = $1
      ON CONFLICT ("user_id", "role_id") DO NOTHING
    `,
      [email],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = SEED_ADMIN_EMAIL.toLowerCase();

    await queryRunner.query(
      `DELETE FROM "user_roles"
       WHERE "user_id" IN (SELECT id FROM "iam_users" WHERE email = $1)`,
      [email],
    );
    await queryRunner.query(
      `DELETE FROM "professional_profiles"
       WHERE "user_id" IN (SELECT id FROM "iam_users" WHERE email = $1)`,
      [email],
    );
    await queryRunner.query(`DELETE FROM "iam_users" WHERE email = $1`, [
      email,
    ]);
    await queryRunner.query(
      `DELETE FROM "role_permissions"
       WHERE "role_id" IN (SELECT id FROM "roles" WHERE name = 'ADMIN')`,
    );
    await queryRunner.query(`DELETE FROM "permissions"`);
    await queryRunner.query(`DELETE FROM "roles" WHERE name = 'ADMIN'`);
  }
}
