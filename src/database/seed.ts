import 'reflect-metadata';
import { config } from 'dotenv';
import dataSource from './data-source';
import { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD_DEFAULT } from './seed-defaults';
import { User } from '../iam/entities/user.entity';
import { Role } from '../iam/entities/role.entity';
import { HashingService } from '../iam/authentication/services/hashing.service';

config();

/**
 * Bootstrap opcional após migrations — nunca regista password em logs.
 */
async function run(): Promise<void> {
  await dataSource.initialize();
  const hashing = new HashingService();
  try {
    const userRepo = dataSource.getRepository(User);
    const roleRepo = dataSource.getRepository(Role);
    const email = SEED_ADMIN_EMAIL.toLowerCase();
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      console.log('Seed skipped: admin user already exists.');
      return;
    }
    const adminRole = await roleRepo.findOne({ where: { name: 'ADMIN' } });
    const pwd = process.env.SEED_ADMIN_PASSWORD ?? SEED_ADMIN_PASSWORD_DEFAULT;
    const passwordHash = await hashing.hash(pwd);
    await userRepo.save(
      userRepo.create({
        email,
        passwordHash,
        isActive: true,
        roles: adminRole ? [adminRole] : [],
      }),
    );
    console.log(
      `Seed done: ${SEED_ADMIN_EMAIL} (altere a senha imediatamente).`,
    );
  } finally {
    await dataSource.destroy();
  }
}

void run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
