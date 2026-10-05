import 'server-only';
import pg from 'pg';
import { z } from 'zod';

const EnvSchema = z.object({ DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }) });

const ContextSchema = z.object({
  sub: z.uuid(),
  roles: z.array(z.string().max(64)).max(32),
});
export type DbContext = z.infer<typeof ContextSchema>;

let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  pool ??= new pg.Pool({
    connectionString: EnvSchema.parse(process.env).DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: 'nsm-app',
  });
  return pool;
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
