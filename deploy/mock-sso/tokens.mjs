// Test-token factory for the local mock parent portal and node:test. Never shipped in the NSM image.
import { createHmac, createSign } from 'node:crypto';

export const ISSUER = 'https://nayisamakhya.org';
export const AUDIENCE = 'nayisamakhya-matrimony';
export const CASES = [
  'valid',
  'coordinator',
  'unverified',
  'expired',
  'not_yet_valid',
  'wrong_audience',
  'wrong_issuer',
  'tampered',
  'alg_none',
  'alg_hs256',
  'bad_claims',
];

const enc = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

/**
 * @param {{ privateKey: import('node:crypto').KeyObject, publicKey: import('node:crypto').KeyObject, kid: string }} signer
 * @param {string} testCase one of CASES
 * @param {number} now unix seconds
 * @param {string} [sub] member uuid (tests that need several members)
 * @param {{ roles?: string[], assigned_district?: string, assigned_mandal?: string }} [overrides] persona claims
 * @returns {string}
 */
export function makeToken(signer, testCase = 'valid', now = Math.floor(Date.now() / 1000), sub = '3f6c1d2e-8b4a-4c1e-9f2d-5a7b8c9d0e1f', overrides = {}) {
  const claims = {
    iss: ISSUER,
    aud: AUDIENCE,
    iat: now,
    nbf: now,
    exp: now + 900,
    sub,
    ns_membership_id: 'NS-TG-SRPT-10482',
    is_ns_verified: true,
    phone: '+910000000000',
    email: 'member@example.invalid',
    assigned_district: 'Suryapet',
    assigned_mandal: 'Kodad',
    roles: ['member'],
    ...overrides,
  };
  if (testCase === 'coordinator') claims.roles = ['member', 'mandal_coordinator'];
  if (testCase === 'unverified') claims.is_ns_verified = false;
  if (testCase === 'expired') Object.assign(claims, { iat: now - 1000, nbf: now - 1000, exp: now - 120 });
  if (testCase === 'not_yet_valid') Object.assign(claims, { nbf: now + 600, exp: now + 1500 });
  if (testCase === 'wrong_audience') claims.aud = 'nayisamakhya-portal';
  if (testCase === 'wrong_issuer') claims.iss = 'https://evil.example';
  if (testCase === 'bad_claims') claims.ns_membership_id = 'bogus';

  if (testCase === 'alg_none') return `${enc({ alg: 'none', typ: 'JWT' })}.${enc(claims)}.`;
  if (testCase === 'alg_hs256') {
    const input = `${enc({ alg: 'HS256', typ: 'JWT', kid: signer.kid })}.${enc(claims)}`;
    const secret = signer.publicKey.export({ type: 'spki', format: 'pem' });
    return `${input}.${createHmac('sha256', secret).update(input).digest('base64url')}`;
  }

  const header = enc({ alg: 'RS256', typ: 'JWT', kid: signer.kid });
  const input = `${header}.${enc(claims)}`;
  const signature = createSign('RSA-SHA256').update(input).sign(signer.privateKey, 'base64url');
  if (testCase === 'tampered') {
    return `${header}.${enc({ ...claims, roles: ['member', 'district_coordinator'] })}.${signature}`;
  }
  return `${input}.${signature}`;
}
