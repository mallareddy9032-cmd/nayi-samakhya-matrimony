import 'server-only';
import pg from 'pg';
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  SUPABASE_DB_URL: z.string().optional(),
  DATABASE_SSL: z.string().optional(),
}).transform((env) => {
  const url = env.DATABASE_URL || env.SUPABASE_DB_URL;
  if (!url) {
    throw new Error('DATABASE_URL or SUPABASE_DB_URL must be specified');
  }
  return {
    DATABASE_URL: url,
    DATABASE_SSL: env.DATABASE_SSL,
  };
});

const ContextSchema = z.object({
  sub: z.uuid(),
  roles: z.array(z.string().max(64)).max(32),
});
export type DbContext = z.infer<typeof ContextSchema>;

let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (pool) return pool;
  const env = EnvSchema.parse(process.env);
  const isRemote = env.DATABASE_URL.includes('supabase') || env.DATABASE_URL.includes('.com') || env.DATABASE_URL.includes('.co') || env.DATABASE_URL.includes('.net');
  const useSsl = env.DATABASE_SSL === 'true' || (env.DATABASE_SSL !== 'false' && isRemote && !env.DATABASE_URL.includes('localhost') && !env.DATABASE_URL.includes('127.0.0.1'));

  pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    application_name: 'nsm-app',
  });
  return pool;
}

/** Verifies database connectivity and returns metadata. */
export async function verifyDatabaseConnection(): Promise<{ ok: boolean; version?: string; schemaExists?: boolean; error?: string }> {
  try {
    const client = await getPool().connect();
    try {
      const res = await client.query('SELECT version()');
      const schemaRes = await client.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'matrimony_shared') AS exists"
      );
      return {
        ok: true,
        version: res.rows[0]?.version,
        schemaExists: schemaRes.rows[0]?.exists === true,
      };
    } finally {
      client.release();
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * The only way to touch the database. Opens a transaction and sets the request identity with
 * set_config(..., true) — the parameterised form of SET LOCAL — so it dies with the transaction
 * and can never leak to the next borrower of a pooled connection.
 */
export async function withTx<T>(ctx: DbContext, fn: (tx: pg.PoolClient) => Promise<T>): Promise<T> {
  const { sub, roles } = ContextSchema.parse(ctx);
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.roles', $2, true)",
      [sub, JSON.stringify(roles)],
    );
    const result = await fn(client);
    await client.query('COMMIT');
    client.release();
    return result;
  } catch (err) {
    await client.query('ROLLBACK').then(
      () => client.release(),
      (rollbackErr: unknown) => client.release(rollbackErr instanceof Error ? rollbackErr : true),
    );
    throw err;
  }
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
