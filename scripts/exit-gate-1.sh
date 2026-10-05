#!/usr/bin/env bash
# Phase 1 exit gate. Run against the local stack:
#   docker compose -f docker-compose.phase1.yml up -d --build && ./scripts/exit-gate-1.sh
set -uo pipefail
BASE="${BASE:-http://localhost:8080}"
failed=0

check() { # name expected actual
  if [[ "$2" == "$3" ]]; then echo "PASS  $1"; else echo "FAIL  $1 (expected '$2', got '$3')"; failed=1; fi
}
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
token() { curl -sf "$BASE/mock/token?case=$1"; }

VALID="$(token valid)"

check "1. no session -> 302 to parent login with return_to" \
  "302 $BASE/login?return_to=%2Fmatrimony%2Fdiscover%3Fdistrict%3Dsuryapet" \
  "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/matrimony/discover?district=suryapet")"

check "1b. basePath root is gated by the proxy (302, not the page fallback 307)" \
  "302 $BASE/login?return_to=%2Fmatrimony" \
  "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/matrimony")"

body="$(curl -s -b "ns_session_token=$VALID" "$BASE/matrimony")"
check "2. valid cookie -> NSM page served" "yes" "$([[ "$body" == *"Signed in as NS-TG-SRPT-10482"* ]] && echo yes || echo no)"
check "3. valid Bearer header -> 200" "200" "$(code -H "Authorization: Bearer $VALID" "$BASE/matrimony")"
check "4. community_verified=false -> 403" "403" "$(code -b "ns_session_token=$(token unverified)" "$BASE/matrimony")"

for c in expired not_yet_valid wrong_audience wrong_issuer tampered alg_none alg_hs256 bad_claims; do
  check "5. $c token -> 302 to login" "302" "$(code -b "ns_session_token=$(token "$c")" "$BASE/matrimony")"
done

check "6. spoofed identity + x-middleware-subrequest headers, no token -> 302" "302" \
  "$(code -H 'X-NS-ID: NS-TG-SRPT-10482' -H 'x-middleware-subrequest: src/proxy:src/proxy:src/proxy:src/proxy:src/proxy' "$BASE/matrimony")"
check "7. cross-origin POST with valid session -> 403" "403" \
  "$(code -X POST -H 'Origin: https://evil.example' -b "ns_session_token=$VALID" "$BASE/matrimony")"
check "8. /matrimony/healthz is public -> 200" "200" "$(code "$BASE/matrimony/healthz")"
check "9. /matrimonyx is not the app (prefix guard) -> 404 from Next" "404" "$(code -b "ns_session_token=$VALID" "$BASE/matrimonyx")"

headers="$(curl -s -D - -o /dev/null -b "ns_session_token=$VALID" "$BASE/matrimony" | tr -d '\r')"
check "10. nonce CSP with strict-dynamic" "yes" "$(grep -qiE "^content-security-policy: default-src 'self'; script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'" <<<"$headers" && echo yes || echo no)"
check "11. frame-ancestors 'none' + X-Frame-Options DENY" "yes" "$(grep -qi "frame-ancestors 'none'" <<<"$headers" && grep -qi '^x-frame-options: DENY' <<<"$headers" && echo yes || echo no)"
check "12. no CORS headers emitted" "no" "$(grep -qi '^access-control-allow-origin' <<<"$headers" && echo yes || echo no)"
check "13. no Server version / X-Powered-By leak" "no" "$(grep -qiE '^(x-powered-by|server: nginx/)' <<<"$headers" && echo yes || echo no)"

got429=no
for _ in $(seq 1 30); do [[ "$(code "$BASE/matrimony/api/discover")" == "429" ]] && got429=yes; done
check "14. 30 rapid discovery requests -> rate limited (429)" "yes" "$got429"

exit "$failed"
