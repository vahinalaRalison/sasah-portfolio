import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { ContactService } from './application/contactService.js';
import { loadConfig } from './config.js';
import { closePool, getPool } from './infrastructure/db.js';
import { runMigrations } from './infrastructure/migrate.js';
import { PgContactRepository } from './infrastructure/pgContactRepository.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const pool = getPool(config.DATABASE_URL);
  const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations');

  const contactService = new ContactService(new PgContactRepository(pool));

  const app = buildApp({
    contactService,
    corsOrigin: config.CORS_ORIGIN,
    logLevel: config.LOG_LEVEL,
    checkReadiness: async () => {
      await pool.query('SELECT 1');
    },
  });

  // Observer : journalise chaque message reçu (remplaçable par un envoi d'e-mail / webhook).
  contactService.onMessage((m) => app.log.info({ id: m.id, email: m.email }, 'nouveau message de contact'));

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
