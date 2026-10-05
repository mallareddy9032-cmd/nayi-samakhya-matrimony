import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireSession } from './session.ts';
import type { SsoClaims } from './sso.ts';

/** A refusal decided in app code; the message is a stable error code, never personal data. */
export class AppError extends Error {
  readonly status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}

// X-Real-IP is overwritten by NGINX with $remote_addr; the app container is reachable only via NGINX.
const IpSchema = z.union([z.ipv4(), z.ipv6()]);

// Postgres error class -> HTTP. Constraint / type failures on member input: CHECK, FK, NOT NULL, bad text.
const PG_STATUS: Record<string, [number, string]> = {
  '42501': [403, 'forbidden'],
  P0002: [404, 'not_found'],
  '55000': [409, 'conflict'],
  '23505': [409, 'conflict'],
  '54000': [429, 'limit_reached'],
  '23514': [422, 'invalid'],
  '23503': [422, 'invalid'],
  '23502': [422, 'invalid'],
  '22007': [422, 'invalid'],
  '22008': [422, 'invalid'],
  '22P02': [422, 'invalid'],
};

export const json = (status: number, body: unknown) => NextResponse.json(body, { status, headers: { 'cache-control': 'no-store' } });

export function pgCode(err: unknown): string | undefined {
  return typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string' ? err.code : undefined;
}

export type ConsentEvidence = { ip: string; userAgent: string };

/** Evidence stored with a consent row; null means refuse the consent (never store a guessed IP). */
export function consentEvidence(req: NextRequest): ConsentEvidence | null {
  const ip = IpSchema.safeParse(req.headers.get('x-real-ip'));
  return ip.success ? { ip: ip.data, userAgent: (req.headers.get('user-agent') ?? '').slice(0, 512) } : null;
}

/** Parses a JSON body against a strict schema; errors carry field paths only, never values. */
export async function readJson<S extends z.ZodType>(req: NextRequest, schema: S): Promise<{ data: z.infer<S> } | { res: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { res: json(400, { error: 'invalid_json' }) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { res: json(422, { error: 'invalid', fields: [...new Set(parsed.error.issues.map((i) => i.path.join('.')))] }) };
  return { data: parsed.data };
}

/** Maps database refusals to HTTP; anything else is logged by code and request id only. */
export function dbError(err: unknown, req: NextRequest, event: string): NextResponse {
  if (err instanceof AppError) return json(err.status, { error: err.message });
  if (err instanceof z.ZodError) return json(422, { error: 'invalid' });
  const code = pgCode(err);
  const mapped = code === undefined ? undefined : PG_STATUS[code];
  if (mapped) return json(mapped[0], { error: mapped[1] });
  console.warn(JSON.stringify({ event, code: code ?? 'unknown', request_id: req.headers.get('x-request-id') ?? '-' }));
  return json(500, { error: 'internal' });
}

/** POST handler: re-verified session, strict JSON body, database refusals mapped to HTTP. */
export function postJson<S extends z.ZodType>(
  schema: S,
  event: string,
  fn: (data: z.infer<S>, claims: SsoClaims, req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const claims = await requireSession();
    const body = await readJson(req, schema);
    if ('res' in body) return body.res;
    try {
      return await fn(body.data, claims, req);
    } catch (err) {
      return dbError(err, req, event);
    }
  };
}
