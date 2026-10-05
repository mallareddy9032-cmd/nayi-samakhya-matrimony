#!/usr/bin/env bash
# Production Database Migration Runner
# Idempotent forward-only execution of migrations 001 through 008
set -euo pipefail

# Automatically load .env.production if DATABASE_URL is not set
if [ -z "${DATABASE_URL:-}" ] && [ -f "$(dirname "$0")/../.env.production" ]; then
  echo "ℹ Loading environment variables from .env.production..."
  set -a
  source "$(dirname "$0")/../.env.production"
  set +a
fi

DB_URL="${DATABASE_URL:-}"

echo "=========================================================="
echo "  NAYI SAMAKHYA MATRIMONY: PRODUCTION MIGRATION RUNNER"
echo "=========================================================="

# Check execution method: host psql or docker container psql
if command -v psql >/dev/null 2>&1 && [ -n "$DB_URL" ]; then
  RUN_SQL() { psql "$DB_URL" "$@"; }
elif docker ps --format '{{.Names}}' | grep -q "nsm_prod_postgres"; then
  echo "ℹ Using container 'nsm_prod_postgres' to execute migrations..."
  RUN_SQL() { docker exec -i nsm_prod_postgres psql -U "${POSTGRES_USER:-nsm_app_user}" -d "${POSTGRES_DB:-nayisamakhya}" "$@"; }
elif docker ps --format '{{.Names}}' | grep -q "postgres"; then
  PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -1)
  echo "ℹ Using container '$PG_CONTAINER' to execute migrations..."
  RUN_SQL() { docker exec -i "$PG_CONTAINER" psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-nayisamakhya}" "$@"; }
else
  echo "Error: Neither host 'psql' nor a running Postgres Docker container could be found."
  echo "Please set DATABASE_URL with psql installed, or start the postgres container first."
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../db/migrations"

# 1. Initialize schema_migrations tracking table if needed
RUN_SQL -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE SCHEMA IF NOT EXISTS matrimony_shared;
CREATE TABLE IF NOT EXISTS matrimony_shared.schema_migrations (
  filename text PRIMARY KEY,
  sha256 text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

# 2. Iterate through ordered SQL files
for file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  fname="$(basename "$file")"
  fhash="$(shasum -a 256 "$file" | cut -d' ' -f1)"

  ALREADY_APPLIED=$(RUN_SQL -tA -c "SELECT count(*) FROM matrimony_shared.schema_migrations WHERE filename = '$fname';")

  if [ "$ALREADY_APPLIED" -gt 0 ]; then
    echo "✓ Skipping already applied migration: $fname"
  else
    echo "▶ Applying migration: $fname..."
    RUN_SQL -v ON_ERROR_STOP=1 -f - < "$file"
    RUN_SQL -v ON_ERROR_STOP=1 -c "INSERT INTO matrimony_shared.schema_migrations (filename, sha256) VALUES ('$fname', '$fhash');"
    echo "✓ Successfully applied: $fname"
  fi
done

echo "=========================================================="
echo "  ALL MIGRATIONS UP TO DATE AND VERIFIED CLEAN"
echo "=========================================================="
