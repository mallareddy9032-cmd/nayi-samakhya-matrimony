// sharp loaded lazily in processPhoto
import { z } from 'zod';
import { getSsoConfig } from './config.ts';
import { presign, type SigV4Credentials } from './sigv4.ts';

// Private bucket. The app writes through the internal endpoint; browsers read only through
// NGINX's /matrimony/media/<bucket>/ location with a short-lived URL signed for the public host.
const RawEnvSchema = z.object({
  S3_ENDPOINT: z.string().transform((url) => (url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`)),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  MINIO_ROOT_USER: z.string().optional(),
  MINIO_ROOT_PASSWORD: z.string().optional(),
  PHOTO_URL_TTL_SECONDS: z.coerce.number().int().min(1).max(3600).default(300),
});

const EnvSchema = RawEnvSchema.transform((env) => ({
  S3_ENDPOINT: z.url({ protocol: /^https?$/ }).parse(env.S3_ENDPOINT),
  S3_REGION: env.S3_REGION,
  S3_BUCKET: env.S3_BUCKET || env.S3_BUCKET_NAME || 'nsm-profile-photos',
  S3_ACCESS_KEY: env.S3_ACCESS_KEY || env.MINIO_ROOT_USER || 'nsm-app-photos',
  S3_SECRET_KEY: env.S3_SECRET_KEY || env.MINIO_ROOT_PASSWORD || 'local-s3-app-only',
  PHOTO_URL_TTL_SECONDS: env.PHOTO_URL_TTL_SECONDS,
}));
export const MEDIA_PREFIX = '/matrimony/media';
export type PhotoVariant = 'full' | 'blurred';

export class PhotoError extends Error {}

let cached: { env: z.infer<typeof EnvSchema>; creds: SigV4Credentials } | undefined;
function storage() {
  if (cached) return cached;
  const env = EnvSchema.parse(process.env);
  cached = { env, creds: { accessKey: env.S3_ACCESS_KEY, secretKey: env.S3_SECRET_KEY, region: env.S3_REGION } };
  return cached;
}

const objectPath = (bucket: string, objectId: string, variant: PhotoVariant) =>
  `/${bucket}/photos/${z.uuid().parse(objectId)}/${variant === 'full' ? 'full' : 'blur'}.webp`;

async function send(method: 'PUT' | 'DELETE', objectId: string, variant: PhotoVariant, body?: Buffer): Promise<void> {
  const { env, creds } = storage();
  const endpoint = new URL(env.S3_ENDPOINT);
  const path = presign(creds, { method, host: endpoint.host, path: objectPath(env.S3_BUCKET, objectId, variant), expiresSeconds: 60, now: new Date() });
  const res = await fetch(new URL(path, endpoint), {
    method,
    body: body ? new Uint8Array(body) : undefined,
    headers: body ? { 'content-type': 'image/webp' } : undefined,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok && !(method === 'DELETE' && res.status === 404)) throw new Error(`storage_${method.toLowerCase()}_${res.status}`);
}

export async function putPhoto(objectId: string, photo: { full: Buffer; blurred: Buffer }): Promise<void> {
  await send('PUT', objectId, 'full', photo.full);
  await send('PUT', objectId, 'blurred', photo.blurred);
}

export async function deletePhoto(objectId: string): Promise<void> {
  await Promise.all([send('DELETE', objectId, 'full'), send('DELETE', objectId, 'blurred')]);
}

/** Call only with an (object, variant) pair returned by fn_photo_access() for this viewer. */
export function photoUrl(objectId: string, variant: PhotoVariant): string {
  const { env, creds } = storage();
  const host = new URL(getSsoConfig().appOrigin).host;
  return MEDIA_PREFIX + presign(creds, { method: 'GET', host, path: objectPath(env.S3_BUCKET, objectId, variant), expiresSeconds: env.PHOTO_URL_TTL_SECONDS, now: new Date() });
}

/**
 * Re-encodes the upload: sniffs the real format, applies EXIF orientation, then writes WebP without
 * any metadata (GPS, device, timestamps). The blurred variant is generated here, never client-side.
 */
export async function processPhoto(input: Buffer): Promise<{ full: Buffer; blurred: Buffer }> {
  try {
    const { default: sharp } = await import('sharp');
    const img = sharp(input, { limitInputPixels: 40_000_000, failOn: 'error' });
    const { format } = await img.metadata();
    if (format !== 'jpeg' && format !== 'png' && format !== 'webp') throw new PhotoError('unsupported_format');
    const upright = img.rotate();
    const [full, blurred] = await Promise.all([
      upright.clone().resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
      upright.clone().resize(360, 360, { fit: 'inside' }).blur(30).webp({ quality: 50 }).toBuffer(),
    ]);
    return { full, blurred };
  } catch (err) {
    throw err instanceof PhotoError ? err : new PhotoError('unreadable_image');
  }
}
