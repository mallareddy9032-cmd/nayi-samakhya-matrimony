import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSsoConfig } from './config.ts';
import { SESSION_COOKIE, extractToken, loginRedirectUrl, verifySsoToken, type SsoClaims } from './sso.ts';

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
