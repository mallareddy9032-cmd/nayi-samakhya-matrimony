import { verifyDatabaseConnection } from '../../../lib/db.ts';

export async function GET(): Promise<Response> {
  const dbStatus = await verifyDatabaseConnection();

  const diagnostics = {
    status: dbStatus.ok ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus.ok ? 'connected' : 'unreachable',
      schemaReady: dbStatus.schemaExists ?? false,
      ssoConfig: !!process.env.SSO_PUBLIC_KEY || !!process.env.JWT_PUBLIC_KEY || !!process.env.SSO_JWKS_URL,
    },
    version: '0.1.0-enterprise',
  };

  return new Response(JSON.stringify(diagnostics, null, 2), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
