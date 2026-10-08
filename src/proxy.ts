import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getSsoConfig } from './lib/config.ts';
import { SESSION_COOKIE, extractToken, loginRedirectUrl, verifySsoToken } from './lib/sso.ts';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const NOT_VERIFIED_HTML = (portal: string): string =>
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Verification required</title>` +
  `<h1>Community verification required</h1>` +
  `<p>Nayi Samakhya Matrimony is open only to community-verified NS-ID holders.</p>` +
  `<p><a href="${portal}/">Complete verification on the Nayi Samakhya portal</a></p></html>`;

function bare(status: number, body: string, contentType = 'text/plain; charset=utf-8'): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
    },
  });
}

function contentSecurityPolicy(nonce: string, https: boolean): string {
  const dev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

function log(event: string, fields: Record<string, string>): void {
  console.warn(JSON.stringify({ event, ...fields }));
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search, basePath } = req.nextUrl;
  if (pathname === '/healthz' || pathname === '/api/healthz' || pathname === '/api/health' || pathname === '/' || pathname === '/login') return NextResponse.next();

  const sso = getSsoConfig();
  const requestId = req.headers.get('x-request-id') ?? '-';

  if (!SAFE_METHODS.has(req.method) && req.headers.get('origin') !== sso.appOrigin) {
    log('csrf_reject', { request_id: requestId });
    return bare(403, 'Forbidden');
  }

  const returnTo = basePath + (pathname === '/' ? '' : pathname) + search;
  const toLogin = (): NextResponse => NextResponse.redirect(loginRedirectUrl(sso.loginUrl, sso.appOrigin, returnTo), 302);

  const token = extractToken(req.cookies.get(SESSION_COOKIE)?.value, req.headers.get('authorization'));
  if (!token) return toLogin();

  let result;
  try {
    result = await verifySsoToken(token, sso.verify);
  } catch {
    log('sso_keys_unavailable', { request_id: requestId });
    return bare(503, 'Service temporarily unavailable');
  }
  if (!result.ok) {
    log('sso_reject', { reason: result.reason, request_id: requestId });
    return toLogin();
  }
  if (!result.claims.is_ns_verified) {
    return bare(403, NOT_VERIFIED_HTML(sso.appOrigin), 'text/html; charset=utf-8');
  }

  const nonce = randomBytes(16).toString('base64');
  const csp = contentSecurityPolicy(nonce, sso.appOrigin.startsWith('https:'));
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', csp);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('content-security-policy', csp);
  return res;
}

// '/' (the basePath root) is not covered by the regex entry and must stay listed.
// Prefetches are deliberately NOT excluded: they return RSC payloads and must be authenticated.
export const config = {
  matcher: ['/', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
