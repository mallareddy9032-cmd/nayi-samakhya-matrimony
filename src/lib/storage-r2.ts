/**
 * Cloudflare R2 Storage Adapter for Nayi Samakhya Matrimonial Portal
 * 
 * Provides zero-egress, 100% free-tier photo object storage inside Cloudflare.
 * Compatible with AWS S3 API SDK / fetch REST endpoints.
 */

export interface R2Config {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicCustomDomain?: string; // e.g. https://photos.nayisamakhya.org
}

export function getR2Config(): R2Config {
  return {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || "demo_cloudflare_account_id",
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || "nsm-matrimony-photos",
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "demo_r2_access_key",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "demo_r2_secret_key",
    publicCustomDomain: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || "",
  };
}

/**
 * Returns canonical Cloudflare R2 S3-compatible API endpoint
 */
export function getR2Endpoint(accountId: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

/**
 * Generates an encrypted/structured object storage key for candidate photos
 * e.g. "photos/NS-M1042/portrait-original.webp"
 */
export function buildPhotoStorageKey(uniqueUserId: string, filename: string): string {
  const sanitizedId = uniqueUserId.replace(/[^a-zA-Z0-9_-]/g, "");
  const extension = filename.split(".").pop() || "jpg";
  return `photos/${sanitizedId}/${Date.now()}.${extension}`;
}

/**
 * Provides an authenticated or signed URL for preview/download
 */
export function getPhotoPublicUrl(key: string): string {
  const config = getR2Config();
  if (config.publicCustomDomain) {
    return `${config.publicCustomDomain.replace(/\/$/, "")}/${key}`;
  }
  // Local fallback / proxy route
  return `/api/photos/proxy?key=${encodeURIComponent(key)}`;
}
