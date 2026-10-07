import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSsoConfig } from './config.ts';
import { SESSION_COOKIE, extractToken, loginRedirectUrl, verifySsoToken, type SsoClaims } from './sso.ts';

/** Returns claims if logged in and verified, or null if unauthenticated. */
export async function getOptionalSession(): Promise<SsoClaims | null> {
  const sso = getSsoConfig();
  const token = extractToken((await cookies()).get(SESSION_COOKIE)?.value, (await headers()).get('authorization'));
  if (!token) return null;
  const result = await verifySsoToken(token, sso.verify).catch(() => null);
  if (!result?.ok || !result.claims.is_ns_verified) return null;
  return result.claims;
}

/** Re-verifies the parent token inside pages/route handlers; the proxy alone is not trusted. */
export async function requireSession(): Promise<SsoClaims> {
  const sso = getSsoConfig();
  const token = extractToken((await cookies()).get(SESSION_COOKIE)?.value, (await headers()).get('authorization'));
  const result = token ? await verifySsoToken(token, sso.verify) : undefined;
  if (!result?.ok || !result.claims.is_ns_verified) {
    redirect(loginRedirectUrl(sso.loginUrl, sso.appOrigin, '/matrimony').toString());
  }
  return result.claims;
}

