import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { ProfileService } from './application/profileService.js';
import { loadConfig } from './config.js';
import { closePool, getPool } from './infrastructure/db.js';
import { runMigrations } from './infrastructure/migrate.js';
import { PgProfileRepository } from './infrastructure/pgProfileRepository.js';

/** Composition root : seul endroit où les implémentations concrètes sont câblées. */
async function main(): Promise<void> {
  const config = loadConfig();
  const pool = getPool(config.DATABASE_URL);
  const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations');

  const app = buildApp({
    profileService: new ProfileService(new PgProfileRepository(pool)),
    corsOrigin: config.CORS_ORIGIN,
    logLevel: config.LOG_LEVEL,
    checkReadiness: async () => {
      await pool.query('SELECT 1');
    },
  });

  await runMigrations(pool, migrationsDir, (msg) => app.log.info(msg));
  await app.listen({ port: config.PORT, host: config.HOST });

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`${signal} reçu, arrêt propre`);
    await app.close();
    await closePool();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
