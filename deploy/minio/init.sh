#!/bin/sh
# Private photo bucket + an app user that can only get/put/delete objects under photos/.
set -eu
export MC_CONFIG_DIR=/tmp/.mc
for _ in $(seq 1 30); do
  mc alias set nsm http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1 && break
  sleep 1
done
mc mb --ignore-existing "nsm/$S3_BUCKET"
mc anonymous set none "nsm/$S3_BUCKET"
sed "s/__BUCKET__/$S3_BUCKET/" /minio/app-policy.json > /tmp/policy.json
mc admin policy create nsm nsm-app-photos /tmp/policy.json
mc admin user add nsm "$S3_ACCESS_KEY" "$S3_SECRET_KEY"
mc admin policy attach nsm nsm-app-photos --user "$S3_ACCESS_KEY" 2>/dev/null || mc admin user info nsm "$S3_ACCESS_KEY" | grep -q nsm-app-photos
echo "bucket $S3_BUCKET ready (private)"
