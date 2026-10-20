import pg from 'pg';

/** Singleton : un seul pool de connexions par processus. */
let pool: pg.Pool | undefined;

export function getPool(connectionString: string): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
