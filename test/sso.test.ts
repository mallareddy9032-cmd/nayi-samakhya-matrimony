import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { test } from 'node:test';
import { AUDIENCE, ISSUER, makeToken } from '../deploy/mock-sso/tokens.mjs';
import {
  extractToken,
  jwksKeyResolver,
  pemKeyResolver,
  safeReturnTo,
  verifySsoToken,
  type VerifyFailure,
} from '../src/lib/sso.ts';

const pair = () => generateKeyPairSync('rsa', { modulusLength: 2048 });
const { privateKey, publicKey } = pair();
const signer = { privateKey, publicKey, kid: 'test-kid' };
const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const opts = { issuer: ISSUER, audience: AUDIENCE, resolveKey: pemKeyResolver(pem) };

test('valid token verifies and phone/email never leave the verifier', async () => {
  const result = await verifySsoToken(makeToken(signer, 'valid'), opts);
  assert.ok(result.ok);
  assert.equal(result.claims.ns_membership_id, 'NS-TG-SRPT-10482');
  assert.equal(result.claims.is_ns_verified, true);
  assert.equal('phone' in result.claims, false);
  assert.equal('email' in result.claims, false);
});

test('unverified member: signature valid, flag surfaces as false for the 403 guard', async () => {
  const result = await verifySsoToken(makeToken(signer, 'unverified'), opts);
  assert.ok(result.ok);
  assert.equal(result.claims.is_ns_verified, false);
});

const rejected: Record<string, VerifyFailure> = {
  expired: 'expired',
  not_yet_valid: 'not_yet_valid',
  wrong_audience: 'wrong_audience',
  wrong_issuer: 'wrong_issuer',
  tampered: 'bad_signature',
  alg_none: 'unsupported_alg',
  alg_hs256: 'unsupported_alg',
  bad_claims: 'bad_claims',
};
for (const [testCase, reason] of Object.entries(rejected)) {
  test(`rejects ${testCase} as ${reason}`, async () => {
    assert.deepEqual(await verifySsoToken(makeToken(signer, testCase), opts), { ok: false, reason });
  });
}

test('rejects a token signed by a different key, and garbage input', async () => {
  const other = pair();
  const foreign = makeToken({ ...other, kid: 'test-kid' }, 'valid');
  assert.deepEqual(await verifySsoToken(foreign, opts), { ok: false, reason: 'bad_signature' });
  for (const junk of ['', 'a.b', 'a.b.c.d', '!!.??.**', 'x'.repeat(9000)]) {
    assert.deepEqual(await verifySsoToken(junk, opts), { ok: false, reason: 'malformed' });
  }
});

test('clock leeway: 30 s past exp still accepted, 120 s past rejected', async () => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const token = makeToken(signer, 'valid', issuedAt);
  assert.ok((await verifySsoToken(token, { ...opts, nowSeconds: issuedAt + 900 + 30 })).ok);
  assert.equal((await verifySsoToken(token, { ...opts, nowSeconds: issuedAt + 900 + 120 })).ok, false);
});

test('pemKeyResolver refuses RSA keys under 2048 bits', () => {
  const weak = generateKeyPairSync('rsa', { modulusLength: 1024 }).publicKey;
  assert.throws(() => pemKeyResolver(weak.export({ type: 'spki', format: 'pem' }).toString()));
});

test('jwksKeyResolver picks by kid and throttles refetch for unknown kids', async () => {
  let calls = 0;
  const jwks = { keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'test-kid', alg: 'RS256', use: 'sig' }] };
  const fetchStub: typeof fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify(jwks));
  };
  const resolveKey = jwksKeyResolver('https://nayisamakhya.org/.well-known/jwks.json', fetchStub);
  assert.ok((await verifySsoToken(makeToken(signer, 'valid'), { ...opts, resolveKey })).ok);
  assert.equal(await resolveKey('forged-kid'), undefined);
  assert.equal(await resolveKey('forged-kid-2'), undefined);
  assert.equal(calls, 1);
});

test('jwksKeyResolver throws (-> 503) when the parent JWKS is unreachable', async () => {
  const down: typeof fetch = async () => new Response('', { status: 502 });
  await assert.rejects(jwksKeyResolver('https://nayisamakhya.org/.well-known/jwks.json', down)('test-kid'));
});

test('safeReturnTo blocks open redirects', () => {
  const origin = 'https://nayisamakhya.org';
  assert.equal(safeReturnTo('/matrimony/discover?d=1', origin), '/matrimony/discover?d=1');
  assert.equal(safeReturnTo('/matrimony', origin), '/matrimony');
  for (const bad of ['//evil.com/matrimony/', '/\\evil.com', 'https://evil.com/matrimony/', '/matrimonyx', '/login', '/matrimony/../login', 'javascript:alert(1)']) {
    assert.equal(safeReturnTo(bad, origin), '/matrimony', bad);
  }
});

test('extractToken prefers the cookie and only accepts a well-formed Bearer header', () => {
  assert.equal(extractToken('cookie.tok.en', 'Bearer a.b.c'), 'cookie.tok.en');
  assert.equal(extractToken(undefined, 'Bearer a.b.c'), 'a.b.c');
  assert.equal(extractToken(undefined, 'Basic abc'), undefined);
  assert.equal(extractToken(undefined, 'Bearer a.b.c extra'), undefined);
  assert.equal(extractToken(undefined, null), undefined);
});
