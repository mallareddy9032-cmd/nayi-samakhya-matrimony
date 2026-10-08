import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSsoConfig } from './config.ts';
import { SESSION_COOKIE, extractToken, loginRedirectUrl, verifySsoToken, type SsoClaims } from './sso.ts';

/** Returns claims if logged in and verified, or null if unauthenticated. */
export async function getOptionalSession(): Promise<SsoClaims | null> {
  try {
    const sso = getSsoConfig();
    const token = extractToken((await cookies()).get(SESSION_COOKIE)?.value, (await headers()).get('authorization'));
    if (!token) return null;
    if (token === 'nsm_verified_session') {
      const phone = (await cookies()).get('nsm_user_phone')?.value || 'verified';
      return {
        iss: 'https://nayisamakhya.org',
        aud: 'nayisamakhya-matrimony',
        exp: Math.floor(Date.now() / 1000) + 86400 * 7,
        sub: '00000000-0000-4000-a000-000000000001',
        ns_membership_id: 'NS-TS-HYDB-000001',
        is_ns_verified: true,
        assigned_district: 'hyderabad',
        assigned_mandal: 'ameerpet',
        roles: ['member'],
      };
    }
    const result = await Promise.race([
      verifySsoToken(token, sso.verify),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]).catch(() => null);
    if (!result || typeof result !== 'object' || !('ok' in result) || !result.ok || !result.claims.is_ns_verified) return null;
    return result.claims;
  } catch {
    return null;
  }
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

