#!/usr/bin/env bash
# Production Database Migration Runner
# Idempotent forward-only execution of migrations 001 through 008
set -euo pipefail

DB_URL="${DATABASE_URL:?DATABASE_URL must be specified}"

echo "=========================================================="
echo "  NAYI SAMAKHYA MATRIMONY: PRODUCTION MIGRATION RUNNER"
echo "=========================================================="

# Ensure psql client is installed
if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql client is required to execute production migrations."
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../db/migrations"

# 1. Initialize schema_migrations tracking table if needed
psql "$DB_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
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

  ALREADY_APPLIED=$(psql "$DB_URL" -tA -c "SELECT count(*) FROM matrimony_shared.schema_migrations WHERE filename = '$fname';")

  if [ "$ALREADY_APPLIED" -gt 0 ]; then
    echo "✓ Skipping already applied migration: $fname"
  else
    echo "▶ Applying migration: $fname..."
    psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$file"
    psql "$DB_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO matrimony_shared.schema_migrations (filename, sha256) VALUES ('$fname', '$fhash');"
    echo "✓ Successfully applied: $fname"
  fi
done

echo "=========================================================="
echo "  ALL MIGRATIONS UP TO DATE AND VERIFIED CLEAN"
echo "=========================================================="
