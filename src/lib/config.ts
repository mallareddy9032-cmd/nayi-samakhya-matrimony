import { z } from 'zod';
import { jwksKeyResolver, pemKeyResolver, type VerifyOptions } from './sso.ts';

const httpUrl = z.url({ protocol: /^https?$/ });

const EnvSchema = z.object({
  SSO_ISSUER: httpUrl.default('https://nayisamakhya.org'),
  SSO_AUDIENCE: z.string().min(1).default('nayisamakhya-matrimony'),
  SSO_JWKS_URL: httpUrl.default('https://nayisamakhya.org/.well-known/jwks.json'),
  SSO_PUBLIC_KEY: z.string().min(1).optional(),
  SSO_LOGIN_URL: httpUrl.default('https://nayisamakhya.org/login'),
  APP_ORIGIN: httpUrl.default('https://nayisamakhya.org'),
});

export type SsoConfig = { verify: VerifyOptions; loginUrl: string; appOrigin: string };

let cached: SsoConfig | undefined;

/** Parsed lazily so `next build` does not need runtime env. */
export function getSsoConfig(): SsoConfig {
  if (cached) return cached;
  const env = EnvSchema.parse(process.env);
  cached = {
    verify: {
      issuer: env.SSO_ISSUER,
      audience: env.SSO_AUDIENCE,
      resolveKey: env.SSO_PUBLIC_KEY ? pemKeyResolver(env.SSO_PUBLIC_KEY) : jwksKeyResolver(env.SSO_JWKS_URL),
    },
    loginUrl: env.SSO_LOGIN_URL,
    appOrigin: new URL(env.APP_ORIGIN).origin,
  };
  return cached;
}
