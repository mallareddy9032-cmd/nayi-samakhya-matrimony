import { NextResponse } from 'next/server';
import { verifyDatabaseConnection } from '../../../lib/db.ts';

export async function GET() {
  let dbStatus: { ok: boolean; schemaExists?: boolean; error?: string } = { ok: true };
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
    dbStatus = await verifyDatabaseConnection();
  }

  return NextResponse.json({
    status: dbStatus.ok ? 'HEALTHY' : 'DEGRADED',
    service: 'nayi-samakhya-matrimony',
    base_path: '/matrimony',
    database: {
      connected: dbStatus.ok,
      schema_ready: dbStatus.schemaExists ?? false,
      error: dbStatus.error,
    },
    timestamp: new Date().toISOString(),
  });
}
