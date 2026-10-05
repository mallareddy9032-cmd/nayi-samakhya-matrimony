import assert from 'node:assert/strict';
import { test } from 'node:test';
import { presign, type PresignRequest } from '../src/lib/sigv4.ts';

const creds = { accessKey: 'AKIAIOSFODNN7EXAMPLE', secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', region: 'us-east-1' };
const req: PresignRequest = { method: 'GET', host: 'examplebucket.s3.amazonaws.com', path: '/test.txt', expiresSeconds: 86400, now: new Date('2013-05-24T00:00:00Z') };

test('matches the AWS SigV4 presigned-URL reference example', () => {
  const url = presign(creds, req);
  assert.ok(url.startsWith('/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host'));
  assert.ok(url.endsWith('&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404'));
});

test('signature binds host, path and method; unsafe paths and expiries are refused', () => {
  const sig = (r: Partial<PresignRequest>) => presign(creds, { ...req, ...r }).split('X-Amz-Signature=')[1];
  const base = sig({});
  assert.notEqual(sig({ host: 'evil.example' }), base);
  assert.notEqual(sig({ path: '/other.txt' }), base);
  assert.notEqual(sig({ method: 'PUT' }), base);
  assert.throws(() => presign(creds, { ...req, path: '/a/../b' }));
  assert.throws(() => presign(creds, { ...req, path: '/a b' }));
  assert.throws(() => presign(creds, { ...req, expiresSeconds: 0 }));
});
