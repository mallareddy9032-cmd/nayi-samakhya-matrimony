const http = require('http');
const crypto = require('crypto');

// Generate RS256 Keypair in memory
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Convert public key PEM to JWKS format
const jwkPublicKey = crypto.createPublicKey(publicKey).export({ format: 'jwk' });
const jwks = {
  keys: [
    {
      ...jwkPublicKey,
      kid: 'ns-mock-key-1',
      use: 'sig',
      alg: 'RS256',
    },
  ],
};

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createSignedJwt(payload) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: 'ns-mock-key-1',
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();

  const signature = signer.sign(privateKey);
  const encodedSignature = base64url(signature);

  return `${data}.${encodedSignature}`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. JWKS Endpoint
  if (url.pathname === '/.well-known/jwks.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(jwks, null, 2));
    return;
  }

  // 2. Token Issuance Endpoint
  if (url.pathname === '/issue-token') {
    const verifiedParam = url.searchParams.get('verified');
    const role = url.searchParams.get('role') || 'member';
    const district = url.searchParams.get('district') || 'Hyderabad';
    const sub = url.searchParams.get('sub') || '00000000-0000-4000-8000-000000000001';

    // verified defaults to true unless explicitly 'false'
    const is_ns_verified = verifiedParam !== 'false';

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: 'https://nayisamakhya.org',
      sub: sub,
      aud: 'https://nayisamakhya.org/matrimony',
      iat: now,
      exp: now + 3600, // 1 hour validity
      is_ns_verified: is_ns_verified,
      role: role,
      district: district,
    };

    const token = createSignedJwt(payload);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          token,
          claims: payload,
        },
        null,
        2
      )
    );
    return;
  }

  // 3. Mock Login page for redirect testing
  if (url.pathname === '/login') {
    const returnTo = url.searchParams.get('return_to') || '/matrimony';
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Parent Portal SSO Login</title></head>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h1>Nayi Samakhya Parent Portal SSO</h1>
          <p>Redirected from: <code>${returnTo}</code></p>
          <p>Login with community verification status.</p>
        </body>
      </html>
    `);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock SSO Auth Server running at http://0.0.0.0:${PORT}`);
  console.log(`JWKS Endpoint: http://0.0.0.0:${PORT}/.well-known/jwks.json`);
});
