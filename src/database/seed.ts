import 'reflect-metadata';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import dataSource from './data-source';
import { User, UserRole } from '../users/entities/user.entity';

config();

/**
 * Optional bootstrap user — run only in dev/stage after migrations.
 * Never log {@link User.passwordHash} or raw passwords.
 */
async function run(): Promise<void> {
  await dataSource.initialize();
  try {
    const repo = dataSource.getRepository(User);
    const email = 'admin@nexor.life';
    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      console.log('Seed skipped: admin user already exists.');
      return;
    }
    const pwd = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
    const passwordHash = await bcrypt.hash(pwd, 10);
    await repo.save(
      repo.create({
        email,
        passwordHash,
        role: UserRole.ADMIN,
        createdBy: null,
      }),
    );

    console.log('Seed done: admin@nexor.life (change password immediately).');
  } finally {
    await dataSource.destroy();
  }
}

void run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
