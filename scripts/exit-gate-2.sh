#!/usr/bin/env bash
# Phase 2 exit gate: fresh PostgreSQL 17, migrations (twice; the second run must be a no-op),
# SQL assertion suites (run as nsm_app_user inside rolled-back transactions), then the TypeScript
# db/crypto layer against the live database.
set -uo pipefail
cd "$(dirname "$0")/.."
compose() { docker compose -f docker-compose.phase2.yml "$@"; }
PORT="${NSM_PG_PORT:-5433}"
failed=0

compose down -v --remove-orphans >/dev/null 2>&1
compose up -d --wait postgres >/dev/null || { echo "FAIL  postgres did not start"; exit 1; }

echo "== migrations"
compose exec -T postgres sh /nsm/scripts/migrate.sh || { echo "FAIL  migrations"; exit 1; }
rerun="$(compose exec -T postgres sh /nsm/scripts/migrate.sh)" || { echo "FAIL  migration re-run"; exit 1; }
if grep -q '^apply ' <<<"$rerun"; then echo "FAIL  re-run applied migrations again"; failed=1
else echo "PASS  forward-only runner is idempotent (re-run applied nothing)"; fi

echo "== SQL assertion suites"
for f in db/tests/[0-9]*.test.sql; do
  out="$(compose exec -T postgres psql -X -q -o /dev/null -v ON_ERROR_STOP=1 -U postgres -d nayisamakhya -f "/nsm/$f" 2>&1)"
  status=$?
  sed -nE 's/.*NOTICE:  PASS (.*)/PASS  \1/p' <<<"$out"
  if [[ $status -ne 0 ]]; then
    echo "FAIL  $f"
    grep -E 'ERROR|CONTEXT|DETAIL' <<<"$out" | sed 's/^/      /'
    failed=1
  fi
done

echo "== TypeScript db/crypto layer (node:test)"
DATABASE_URL="postgresql://nsm_app_user:${NSM_APP_PASSWORD:-local-app-only}@127.0.0.1:${PORT}/nayisamakhya" \
NSM_CONTACT_KEY="${NSM_CONTACT_KEY:-$(openssl rand -hex 32)}" \
  node --conditions=react-server --test --test-reporter=spec test/db.integration.test.ts 2>&1 | grep -E '✔|✖|Error|expected|actual' || failed=1

exit "$failed"
