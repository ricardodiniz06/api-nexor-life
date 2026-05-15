/**
 * TypeORM CLI datasource. Used by:
 * - `npm run typeorm:migration:generate -- src/database/migrations/Name`
 * - `npm run typeorm:migration:run`
 * - `npm run typeorm:migration:revert`
 * - `npm run schema:drop`
 *
 * After changing an entity, generate a migration, review SQL, run in dev, commit the file.
 * Never rely on `synchronize` outside ephemeral dev (`TYPEORM_SYNCHRONIZE=true`).
 */
import 'reflect-metadata';
import { buildDataSource } from './typeorm.config';

/**
 * TypeORM CLI entry (`typeorm-ts-node-commonjs -p tsconfig.typeorm.json -d src/database/data-source.ts`).
 * Do not register this file in Nest DI — it is for migrations only.
 */
export default buildDataSource();
