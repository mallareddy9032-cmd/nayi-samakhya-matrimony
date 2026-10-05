// AWS Signature V4 query presigning for S3-compatible storage (MinIO). Pure node:crypto, so the
// image carries no AWS SDK. Object keys are restricted to URL-safe characters, which keeps the
// canonical URI identical to the request path on every hop (NGINX, MinIO).
import { createHash, createHmac } from 'node:crypto';

export type SigV4Credentials = { accessKey: string; secretKey: string; region: string };
export type PresignRequest = {
  method: 'GET' | 'HEAD' | 'PUT' | 'DELETE';
  host: string;
  path: string;
  expiresSeconds: number;
  now: Date;
};

const SAFE_PATH = /^\/[A-Za-z0-9._~/-]+$/;
const rfc3986 = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const hmac = (key: Buffer | string, data: string) => createHmac('sha256', key).update(data).digest();

/** Returns `path?query` for a presigned request; the signature covers method, host, path and expiry. */
export function presign(creds: SigV4Credentials, req: PresignRequest): string {
  if (!SAFE_PATH.test(req.path) || req.path.includes('..')) throw new Error('unsafe object path');
  if (!Number.isInteger(req.expiresSeconds) || req.expiresSeconds < 1 || req.expiresSeconds > 604800) throw new Error('bad expiry');
  const amzDate = req.now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${creds.region}/s3/aws4_request`;
  const query = Object.entries({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${creds.accessKey}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(req.expiresSeconds),
    'X-Amz-SignedHeaders': 'host',
  })
    .map(([k, v]) => `${rfc3986(k)}=${rfc3986(v)}`)
    .sort()
    .join('&');
  const canonical = [req.method, req.path, query, `host:${req.host}`, '', 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, createHash('sha256').update(canonical).digest('hex')].join('\n');
  const key = hmac(hmac(hmac(hmac(`AWS4${creds.secretKey}`, day), creds.region), 's3'), 'aws4_request');
  return `${req.path}?${query}&X-Amz-Signature=${createHmac('sha256', key).update(toSign).digest('hex')}`;
}
