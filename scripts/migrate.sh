#!/bin/sh
# Forward-only migration runner (POSIX sh + psql; runs inside the postgres container or a CI job).
# Applies db/migrations/NNN_*.sql in order, each once, each in a single transaction, recording
# filename + sha256. An applied file whose content changed aborts the run: write a new migration.
# 001 runs as ADMIN_URL (superuser bootstrap: roles); everything after runs as MIGRATOR_URL.
set -eu
: "${ADMIN_URL:?}" "${MIGRATOR_URL:?}"
: "${NSM_APP_PASSWORD:?}" "${NSM_MIGRATOR_PASSWORD:?}" "${NSM_GRIEVANCE_RO_PASSWORD:?}"

dir="$(cd "$(dirname "$0")/../db/migrations" && pwd)"
record="
SET ROLE nsm_owner;
INSERT INTO matrimony_shared.schema_migrations (filename, sha256) VALUES (:'f', :'s');"

for file in "$dir"/[0-9][0-9][0-9]_*.sql; do
  name="$(basename "$file")"
  sum="$(sha256sum "$file" | cut -d' ' -f1)"

  applied=""
  if [ "$(psql "$ADMIN_URL" -XqtA -c "SELECT to_regclass('matrimony_shared.schema_migrations') IS NOT NULL")" = "t" ]; then
    applied="$(echo "SELECT sha256 FROM matrimony_shared.schema_migrations WHERE filename = :'f'" | psql "$ADMIN_URL" -XqtA -v f="$name")"
  fi
  if [ -n "$applied" ]; then
    [ "$applied" = "$sum" ] || { echo "migration $name changed after it was applied" >&2; exit 1; }
    continue
  fi

  echo "apply $name"
  case "$name" in
    001_*)
      { cat "$file"; echo "$record"; } | psql "$ADMIN_URL" -Xq -o /dev/null -1 -v ON_ERROR_STOP=1 -v f="$name" -v s="$sum" \
        -v app_password="$NSM_APP_PASSWORD" -v migrator_password="$NSM_MIGRATOR_PASSWORD" \
        -v grievance_ro_password="$NSM_GRIEVANCE_RO_PASSWORD" -f - ;;
    *)
      { cat "$file"; echo "$record"; } | psql "$MIGRATOR_URL" -Xq -o /dev/null -1 -v ON_ERROR_STOP=1 -v f="$name" -v s="$sum" -f - ;;
  esac
done

psql "$MIGRATOR_URL" -XqtA -v ON_ERROR_STOP=1 -c "SELECT matrimony_shared.fn_assert_isolation()" >/dev/null
echo "migrations up to date; isolation verified"
