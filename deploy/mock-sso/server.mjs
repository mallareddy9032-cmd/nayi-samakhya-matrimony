// Local stand-in for the nayisamakhya.org parent portal: login page, session cookie, JWKS.
// Signing key is generated in memory at startup and never written anywhere.
import { generateKeyPairSync } from 'node:crypto';
import { createServer } from 'node:http';
import { CASES, makeToken } from './tokens.mjs';

if (process.env.NODE_ENV === 'production') {
  console.error('mock-sso refuses to run with NODE_ENV=production');
  process.exit(1);
}

const PORT = Number(process.env.PORT ?? 4000);
const COOKIE = 'ns_session_token';
const ORIGIN = 'http://parent.local';
const kid = `mock-${Date.now().toString(36)}`;
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const signer = { privateKey, publicKey, kid };
const jwks = JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid, alg: 'RS256', use: 'sig' }] });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function safeReturnTo(value) {
  try {
    const url = new URL(value ?? '', ORIGIN);
    if (url.origin === ORIGIN && (url.pathname === '/matrimony' || url.pathname.startsWith('/matrimony/'))) {
      return url.pathname + url.search;
    }
  } catch {
    // fall through
  }
  return '/matrimony';
}

const ROLES = ['member', 'mandal_coordinator', 'district_lineage_officer', 'grievance_officer'];
const PERSONAS = [
  ['valid', 'Verified member (Kodad, Suryapet)'],
  ['coordinator', 'Verified member + mandal coordinator'],
  ['unverified', 'Member, NOT community-verified'],
  ['expired', 'Expired session'],
];

const loginPage = (returnTo) => `<!doctype html><html lang="en"><meta charset="utf-8">
<title>Mock Nayi Samakhya login</title>
<h1>Mock Nayi Samakhya parent login</h1>
<p>Local development only. Choose a persona:</p>
<form method="post" action="/login">
<input type="hidden" name="return_to" value="${escapeHtml(returnTo)}">
${PERSONAS.map(([value, label]) => `<p><button name="case" value="${value}">${label}</button></p>`).join('\n')}
</form></html>`;

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'no-store',
    'content-security-policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'",
    ...headers,
  });
  res.end(body);
}

function readBody(req, limit = 4096) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > limit) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', ORIGIN);
  const route = `${req.method} ${url.pathname}`;
  try {
    if (route === 'GET /.well-known/jwks.json') return send(res, 200, jwks, { 'content-type': 'application/json' });
    if (route === 'GET /mock/public-key.pem') return send(res, 200, publicPem);
    if (route === 'GET /mock/token') {
      const testCase = url.searchParams.get('case') ?? 'valid';
      if (!CASES.includes(testCase)) return send(res, 400, `unknown case; use one of: ${CASES.join(', ')}`);
      const sub = url.searchParams.get('sub') ?? undefined;
      if (sub !== undefined && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(sub)) return send(res, 400, 'sub must be a v4 uuid');
      const overrides = {};
      const roles = url.searchParams.get('roles');
      if (roles !== null) {
        overrides.roles = roles.split(',');
        if (!overrides.roles.every((r) => ROLES.includes(r))) return send(res, 400, `roles: comma list of ${ROLES.join(', ')}`);
      }
      for (const [param, claim] of [['district', 'assigned_district'], ['mandal', 'assigned_mandal']]) {
        const value = url.searchParams.get(param);
        if (value === null) continue;
        if (!/^[A-Za-z][A-Za-z -]{1,39}$/.test(value)) return send(res, 400, `${param}: letters only`);
        overrides[claim] = value;
      }
      return send(res, 200, makeToken(signer, testCase, undefined, sub, overrides));
    }
    if (route === 'GET /login') {
      const page = loginPage(safeReturnTo(url.searchParams.get('return_to')));
      return send(res, 200, page, { 'content-type': 'text/html; charset=utf-8' });
    }
    if (route === 'POST /login') {
      const form = new URLSearchParams(await readBody(req));
      const testCase = form.get('case') ?? 'valid';
      if (!CASES.includes(testCase)) return send(res, 400, 'unknown case');
      return send(res, 303, '', {
        'set-cookie': `${COOKIE}=${makeToken(signer, testCase)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`,
        location: safeReturnTo(form.get('return_to')),
      });
    }
    if (route === 'GET /logout') {
      return send(res, 303, '', { 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`, location: '/' });
    }
    if (route === 'GET /') {
      const page = '<!doctype html><meta charset="utf-8"><title>Mock parent portal</title><h1>Mock nayisamakhya.org</h1><p><a href="/matrimony">Matrimony</a> · <a href="/logout">Log out</a></p>';
      return send(res, 200, page, { 'content-type': 'text/html; charset=utf-8' });
    }
    return send(res, 404, 'not found');
  } catch {
    return send(res, 400, 'bad request');
  }
}).listen(PORT, () => console.log(`mock-sso listening on :${PORT} (kid=${kid})`));
