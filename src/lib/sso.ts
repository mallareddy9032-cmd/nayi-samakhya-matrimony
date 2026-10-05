import { createPublicKey, verify, type KeyObject } from 'node:crypto';
import { z } from 'zod';

export const SESSION_COOKIE = 'ns_session_token';

const MAX_TOKEN_LENGTH = 8192;
const CLOCK_LEEWAY_S = 60;
const MIN_RSA_BITS = 2048;
const JWKS_TTL_MS = 10 * 60_000;
const JWKS_MIN_REFETCH_MS = 30_000;
const B64URL = /^[A-Za-z0-9_-]+$/;

const HeaderSchema = z.object({
  alg: z.string(),
  kid: z.string().max(256).optional(),
  crit: z.unknown().optional(),
});

// phone and email are intentionally not declared: zod strips them, so they never leave this module.
const ClaimsSchema = z.object({
  iss: z.string(),
  aud: z.union([z.string(), z.array(z.string())]),
  exp: z.number(),
  nbf: z.number().optional(),
  iat: z.number().optional(),
  sub: z.uuid(),
  ns_membership_id: z.string().regex(/^NS-[A-Z]{2}-[A-Z]{2,8}-\d{1,12}$/),
  is_ns_verified: z.boolean(),
  assigned_district: z.string().min(1).max(64),
  assigned_mandal: z.string().min(1).max(64),
  roles: z.array(z.string().max(64)).max(32),
});

const JwksSchema = z.object({
  keys: z
    .array(
      z.object({
        kty: z.string(),
        kid: z.string().optional(),
        use: z.string().optional(),
        alg: z.string().optional(),
        n: z.string().optional(),
        e: z.string().optional(),
      }),
    )
    .max(50),
});

export type SsoClaims = z.infer<typeof ClaimsSchema>;
export type KeyResolver = (kid: string | undefined) => Promise<KeyObject | undefined>;
export type VerifyOptions = {
  issuer: string;
  audience: string;
  resolveKey: KeyResolver;
  nowSeconds?: number;
};
export type VerifyFailure =
  | 'malformed'
  | 'unsupported_alg'
  | 'unknown_key'
  | 'bad_signature'
  | 'bad_claims'
  | 'wrong_issuer'
  | 'wrong_audience'
  | 'expired'
  | 'not_yet_valid';
export type VerifyResult = { ok: true; claims: SsoClaims } | { ok: false; reason: VerifyFailure };

const fail = (reason: VerifyFailure): VerifyResult => ({ ok: false, reason });

function decodeJson(segment: string): unknown {
  if (!B64URL.test(segment)) return undefined;
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
}

function strongRsa(key: KeyObject): KeyObject {
  if (key.asymmetricKeyType !== 'rsa' || (key.asymmetricKeyDetails?.modulusLength ?? 0) < MIN_RSA_BITS) {
    throw new Error(`SSO signing key must be RSA >= ${MIN_RSA_BITS} bits`);
  }
  return key;
}

/** Throws only when signing keys cannot be obtained at all (caller should answer 503). */
export async function verifySsoToken(token: string, opts: VerifyOptions): Promise<VerifyResult> {
  if (token.length > MAX_TOKEN_LENGTH) return fail('malformed');
  const [h, p, s, ...rest] = token.split('.');
  if (h === undefined || p === undefined || s === undefined || rest.length > 0) return fail('malformed');

  const header = HeaderSchema.safeParse(decodeJson(h));
  if (!header.success) return fail('malformed');
  if (header.data.alg !== 'RS256' || header.data.crit !== undefined) return fail('unsupported_alg');
  if (!B64URL.test(s)) return fail('malformed');

  const key = await opts.resolveKey(header.data.kid);
  if (!key) return fail('unknown_key');
  let signatureOk = false;
  try {
    signatureOk = verify('sha256', Buffer.from(`${h}.${p}`), key, Buffer.from(s, 'base64url'));
  } catch {
    signatureOk = false;
  }
  if (!signatureOk) return fail('bad_signature');

  const parsed = ClaimsSchema.safeParse(decodeJson(p));
  if (!parsed.success) return fail('bad_claims');
  const claims = parsed.data;
  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);

  if (claims.iss !== opts.issuer) return fail('wrong_issuer');
  const audOk = Array.isArray(claims.aud) ? claims.aud.includes(opts.audience) : claims.aud === opts.audience;
  if (!audOk) return fail('wrong_audience');
  if (now > claims.exp + CLOCK_LEEWAY_S) return fail('expired');
  if (claims.nbf !== undefined && now + CLOCK_LEEWAY_S < claims.nbf) return fail('not_yet_valid');
  return { ok: true, claims };
}

/** Local/dev: a single pinned RSA public key (PEM, `\n` escapes allowed). */
export function pemKeyResolver(pem: string): KeyResolver {
  const key = strongRsa(createPublicKey(pem.replace(/\\n/g, '\n')));
  return async () => key;
}

/** Production: parent JWKS, cached; unknown `kid` triggers at most one refetch per 30 s. */
export function jwksKeyResolver(url: string, fetchImpl: typeof fetch = fetch): KeyResolver {
  let keys = new Map<string, KeyObject>();
  let fetchedAt = 0;
  let attemptedAt = 0;
  let inflight: Promise<void> | undefined;

  const refresh = async (): Promise<void> => {
    const res = await fetchImpl(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
    const next = new Map<string, KeyObject>();
    for (const jwk of JwksSchema.parse(await res.json()).keys) {
      if (jwk.kty !== 'RSA' || !jwk.kid || !jwk.n || !jwk.e) continue;
      if ((jwk.use && jwk.use !== 'sig') || (jwk.alg && jwk.alg !== 'RS256')) continue;
      try {
        next.set(jwk.kid, strongRsa(createPublicKey({ key: { kty: 'RSA', n: jwk.n, e: jwk.e }, format: 'jwk' })));
      } catch {
        continue;
      }
    }
    keys = next;
    fetchedAt = Date.now();
  };

  return async (kid) => {
    if (!kid) return undefined;
    const now = Date.now();
    const due = now - fetchedAt > JWKS_TTL_MS || !keys.has(kid);
    if (!inflight && due && now - attemptedAt > JWKS_MIN_REFETCH_MS) {
      attemptedAt = now;
      inflight = refresh().finally(() => {
        inflight = undefined;
      });
    }
    if (inflight) {
      await inflight.catch((err: unknown) => {
        if (keys.size === 0) throw err;
      });
    }
    if (keys.size === 0) throw new Error('JWKS unavailable');
    return keys.get(kid);
  };
}

export function extractToken(cookie: string | undefined, authorization: string | null): string | undefined {
  if (cookie) return cookie;
  return authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
}

/** Only same-origin paths under /matrimony survive; anything else falls back to /matrimony. */
export function safeReturnTo(candidate: string, appOrigin: string): string {
  try {
    const url = new URL(candidate, appOrigin);
    const underApp = url.pathname === '/matrimony' || url.pathname.startsWith('/matrimony/');
    if (url.origin === new URL(appOrigin).origin && underApp) return url.pathname + url.search;
  } catch {
    // fall through
  }
  return '/matrimony';
}

export function loginRedirectUrl(loginUrl: string, appOrigin: string, returnTo: string): URL {
  const url = new URL(loginUrl);
  url.searchParams.set('return_to', safeReturnTo(returnTo, appOrigin));
  return url;
}
