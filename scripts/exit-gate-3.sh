#!/usr/bin/env bash
# Phase 3 exit gate: unit tests, typecheck, all SQL suites, then a full 7-step onboarding through
# NGINX -> Next.js -> PostgreSQL with database-level assertions on what was actually stored.
# Leaves the stack running on $BASE for manual inspection.
set -uo pipefail
cd "$(dirname "$0")/.."
export NSM_PORT="${NSM_PORT:-8088}"
export NSM_PG_PORT="${NSM_PG_PORT:-5434}"   # 5433 belongs to the exit-gate-2 stack
export NSM_CONTACT_KEY="${NSM_CONTACT_KEY:-$(openssl rand -hex 32)}"
BASE="http://localhost:$NSM_PORT"
YEAR="$(TZ=Asia/Kolkata date +%Y)"
SUB1=3f6c1d2e-8b4a-4c1e-9f2d-5a7b8c9d0e1f   # mock-sso default member
SUB2=7d1e5c3a-2b4f-4a6e-9c8d-1e2f3a4b5c6d
COORD=c0000000-0000-4000-8000-000000000001
failed=0

compose() { docker compose -f docker-compose.phase1.yml -f docker-compose.phase2.yml -f docker-compose.phase3.yml "$@"; }
sql() { compose exec -T postgres psql -X -qtA -v ON_ERROR_STOP=1 -U postgres -d nayisamakhya -v key="$NSM_CONTACT_KEY" "$@"; }
check() { if [[ "$2" == "$3" ]]; then echo "PASS  $1"; else echo "FAIL  $1 (expected '$2', got '$3')"; failed=1; fi; }
yes_if() { if eval "$1"; then echo yes; else echo no; fi; }
submit() { # token payload [origin] -> "<status> <body>"
  curl -s -w ' %{http_code}' -X POST -H "Origin: ${3:-$BASE}" -H 'content-type: application/json' -H 'user-agent: nsm-exit-gate-3' \
    -b "ns_session_token=$1" --data "$2" "$BASE/matrimony/api/onboarding/submit"
}
status_of() { echo "${1##* }"; }
payload() { # JS statements that mutate p
  GOTHRA_ID="$GOTHRA_ID" node --input-type=module -e "
import { NOTICES } from './src/lib/onboarding.ts';
const p = {
  lang: 'te',
  pledge: { accepted: true, noticeVersion: NOTICES.pledge.version },
  heritage: { displayName: 'Gate Member', gender: 'male', dateOfBirth: '$((YEAR - 30))-04-14',
    gothra: { kind: 'listed', id: process.env.GOTHRA_ID }, maternalLineage: 'Vasishtha', vocation: 'nadopasana',
    ancestralNativeDistrict: 'suryapet', ancestralNativeMandal: 'Kodad' },
  career: { educationDegree: 'B.Mus (Carnatic)', occupation: 'Temple Nadaswaram Vidwan', incomeBracket: '6l_12l',
    salonHubSlug: null, birthTime: '05:42', birthPlace: 'Kodad', nakshatra: 'rohini' },
  privacy: { photoVisibility: 'blurred', contactMaskingAcknowledged: true, profileProcessingConsent: true,
    coordinatorVerificationConsent: true, profileNoticeVersion: NOTICES.profileProcessing.version,
    coordinatorNoticeVersion: NOTICES.coordinatorVerification.version },
  contact: { phone: '+91 99001 12233', email: 'gate.member@example.invalid', whatsapp: '+919900112233',
    doorAddress: '12-3-45 Nadaswaram Street, Kodad' },
};
$1
process.stdout.write(JSON.stringify(p));"
}

echo "== unit tests and typecheck"
if npm test --silent >/dev/null 2>&1; then echo "PASS  npm test (SSO + onboarding contract)"; else echo "FAIL  npm test"; failed=1; fi
if npx tsc --noEmit; then echo "PASS  typecheck"; else echo "FAIL  typecheck"; failed=1; fi

echo "== stack (nginx + nsm-app + mock-sso + postgres)"
compose down -v --remove-orphans >/dev/null 2>&1
log="$(mktemp)"
compose build nsm-app >"$log" 2>&1 || { echo "FAIL  image build"; tail -40 "$log"; exit 1; }
compose up -d --wait >"$log" 2>&1 || { echo "FAIL  stack did not become healthy"; tail -40 "$log"; exit 1; }
compose exec -T postgres sh /nsm/scripts/migrate.sh >/dev/null || { echo "FAIL  migrations"; exit 1; }
echo "PASS  stack healthy, migrations 001-006 applied"

echo "== SQL assertion suites"
for f in db/tests/[0-9]*.test.sql; do
  out="$(compose exec -T postgres psql -X -q -o /dev/null -v ON_ERROR_STOP=1 -U postgres -d nayisamakhya -f "/nsm/$f" 2>&1)"
  if [[ $? -eq 0 ]]; then echo "PASS  $f ($(grep -c 'NOTICE:  PASS' <<<"$out") assertions)"
  else echo "FAIL  $f"; grep -E 'ERROR|CONTEXT' <<<"$out" | sed 's/^/      /'; failed=1; fi
done

sql <<SQL >/dev/null
INSERT INTO matrimony_shared.sub_admins (root_user_id, role, district, mandal, assigned_by) VALUES
  ('$COORD', 'mandal_coordinator', 'suryapet', 'kodad', 'c0000000-0000-4000-8000-0000000000ff'),
  ('c0000000-0000-4000-8000-000000000002', 'mandal_coordinator', 'suryapet', 'huzurnagar', 'c0000000-0000-4000-8000-0000000000ff');
SQL
T1="$(curl -sf "$BASE/mock/token?case=valid")"
T2="$(curl -sf "$BASE/mock/token?case=valid&sub=$SUB2")"

echo "== Step 1: session and membership guard"
check "1.1 no session -> 302 to parent login with return_to" "302 $BASE/login?return_to=%2Fmatrimony%2Fonboarding" \
  "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/matrimony/onboarding")"
check "1.2 unverified member -> 403" "403" "$(curl -s -o /dev/null -w '%{http_code}' -b "ns_session_token=$(curl -sf "$BASE/mock/token?case=unverified")" "$BASE/matrimony/onboarding")"
page="$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/onboarding")"
check "1.3 wizard renders with NS-ID from the verified token" "yes" "$(yes_if '[[ "$page" == *"NS-TG-SRPT-10482"* && "$page" == *"Step 1: Membership"* ]]')"
check "1.4 Trishikha Deepam + Nadaswaram header, bilingual (lang=te)" "yes" "$(yes_if '[[ "$page" == *"Trishikha Deepam"*"Nadaswaram"* && "$page" == *"lang=\"te\""* ]]')"
check "1.5 no scissors/shears/dating iconography" "0" "$(grep -ciE 'scissor|shear|heart-icon|cupid' <<<"$page")"
check "1.6 no inline style attributes (strict CSP)" "0" "$(grep -c ' style="' <<<"$page")"

echo "== APIs"
gothras="$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/api/gothras")"
GOTHRA_ID="$(node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(j.gothras.find(g=>g.slug==="bharadwaja").id)' <<<"$gothras")"
check "2.1 GET /api/gothras -> 22 verified gothras + proposal support" "22 true" \
  "$(node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(j.gothras.length+" "+j.proposal.allowed)' <<<"$gothras")"
check "2.2 GET /api/onboarding/status before -> not_started, step 1" '"state":"not_started","step":1' \
  "$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/api/onboarding/status" | grep -o '"state":"[a-z_]*","step":[0-9]')"

echo "== submission guards"
check "3.1 cross-origin submit -> 403" "403" "$(status_of "$(submit "$T1" "$(payload '')" https://evil.example)")"
r="$(submit "$T1" "$(payload "p.heritage.dateOfBirth = '$((YEAR - 20))-01-01';")")"
check "3.2 under-age (male 20) -> 422 on heritage.dateOfBirth" "yes" "$(yes_if '[[ "$(status_of "$r")" == 422 && "$r" == *heritage.dateOfBirth* ]]')"
r="$(submit "$T1" "$(payload "p.sub = '00000000-0000-4000-8000-000000000000';")")"
check "3.3 identity in body rejected -> 422" "422" "$(status_of "$r")"
r="$(submit "$T1" "$(payload 'p.privacy.profileProcessingConsent = false;')")"
check "3.4 missing DPDP s.6 consent -> 422" "422" "$(status_of "$r")"
r="$(submit "$T1" "$(payload 'p.pledge.accepted = false;')")"
check "3.5 unsigned Self-Respect Pledge -> 422" "422" "$(status_of "$r")"
check "3.6 nothing stored for rejected attempts (incl. the under-age one)" "0|0" \
  "$(sql -c "SELECT (SELECT count(*) FROM matrimony_shared.profiles) || '|' || (SELECT count(*) FROM matrimony_shared.dpdp_consent_logs)")"

echo "== Steps 2-7: complete onboarding (Telugu notices)"
r="$(submit "$T1" "$(payload '')")"
check "4.1 POST /api/onboarding/submit -> 201" "201" "$(status_of "$r")"
check "4.2 matrimonial ID NSM-TG-SRPT-$YEAR-0001, coordinator assigned" "\"matrimonialId\":\"NSM-TG-SRPT-$YEAR-0001\",\"coordinatorAssigned\":true" \
  "$(grep -o '"matrimonialId":"[^"]*","coordinatorAssigned":[a-z]*' <<<"$r")"

echo "== database assertions"
check "5.1 phone/email/whatsapp/door_address stored as non-empty bytea" "bytea|bytea|bytea|bytea|true" "$(sql -c "
  SELECT pg_typeof(phone_enc) || '|' || pg_typeof(email_enc) || '|' || pg_typeof(whatsapp_enc) || '|' || pg_typeof(door_address_enc) || '|' ||
         (octet_length(phone_enc) > 0 AND octet_length(email_enc) > 0 AND octet_length(door_address_enc) > 0)
    FROM matrimony_shared.profiles WHERE root_user_id = '$SUB1'")"
check "5.2 ciphertext is symmetric PGP and decrypts with the runtime key to the submitted values" "true|SYMKEY" "$(sql <<SQL
SET search_path = matrimony_shared;
SELECT (pgp_sym_decrypt(phone_enc, :'key') = '+919900112233'
        AND pgp_sym_decrypt(email_enc, :'key') = 'gate.member@example.invalid'
        AND pgp_sym_decrypt(door_address_enc, :'key') = '12-3-45 Nadaswaram Street, Kodad')
       || '|' || pgp_key_id(phone_enc)
  FROM profiles WHERE root_user_id = '$SUB1';
SQL
)"
check "5.3a wrong key cannot decrypt" "denied" \
  "$(sql -c "SELECT matrimony_shared.pgp_sym_decrypt(phone_enc, 'not-the-key') FROM matrimony_shared.profiles WHERE root_user_id = '$SUB1'" >/dev/null 2>&1 && echo allowed || echo denied)"
dump="$(compose exec -T postgres pg_dump -U postgres -n matrimony_shared nayisamakhya)"
check "5.3 no plaintext contact anywhere in matrimony_shared (pg_dump)" "0" "$(grep -cE '9900112233|gate\.member@|Nadaswaram Street' <<<"$dump")"
check "5.4 token phone/email never persisted (DPDP minimisation)" "0" "$(grep -cE '\+910000000000|member@example\.invalid' <<<"$dump")"
check "5.5 one consent row per purpose: Telugu notice version, granted, IP, user agent" \
  "community_pledge|pledge-v1.te|t|t|nsm-exit-gate-3,profile_processing|dpdp-profile-v1.te|t|t|nsm-exit-gate-3,coordinator_verification|dpdp-coord-v1.te|t|t|nsm-exit-gate-3" \
  "$(sql -c "SELECT string_agg(purpose || '|' || notice_version || '|' || (CASE WHEN granted THEN 't' ELSE 'f' END) || '|' || (CASE WHEN ip IS NOT NULL THEN 't' ELSE 'f' END) || '|' || user_agent, ',' ORDER BY seq)
               FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$SUB1'")"
check "5.6 signed pledge row stores the exact Telugu statement shown" "t" \
  "$(sql -c "SELECT statement LIKE 'ఆత్మగౌరవ ప్రతిజ్ఞ.%' FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$SUB1' AND purpose = 'community_pledge'")"
check "5.7 consent hash chain verifies" "t" "$(sql -c "SELECT matrimony_shared.fn_verify_consent_chain() IS NULL")"
check "5.8 consent log append-only: app UPDATE denied" "denied" \
  "$(sql -c "SET ROLE nsm_app_user; UPDATE matrimony_shared.dpdp_consent_logs SET granted = false" >/dev/null 2>&1 && echo allowed || echo denied)"
check "5.9 consent log append-only: owner DELETE rejected by trigger" "denied" \
  "$(sql -c "SET ROLE nsm_owner; DELETE FROM matrimony_shared.dpdp_consent_logs" >/dev/null 2>&1 && echo allowed || echo denied)"
check "5.10 profile Pending_Mandal_Review, assigned to the Kodad coordinator" "pending_mandal_review|t|NSM-TG-SRPT-$YEAR-0001|kodad" \
  "$(sql -c "SELECT status || '|' || (CASE WHEN assigned_coordinator_user_id = '$COORD' THEN 't' ELSE 'f' END) || '|' || matrimonial_id || '|' || ancestral_native_mandal
               FROM matrimony_shared.profiles WHERE root_user_id = '$SUB1'")"
check "5.11 heritage/career/privacy fields stored" "nadopasana|6l_12l|rohini|blurred|Vasishtha" \
  "$(sql -c "SELECT vocation || '|' || income_bracket || '|' || nakshatra || '|' || photo_visibility || '|' || maternal_lineage
               FROM matrimony_shared.profiles WHERE root_user_id = '$SUB1'")"

echo "== after submission"
check "6.1 GET /api/onboarding/status -> pending_mandal_review, step 7" '"state":"pending_mandal_review","step":7' \
  "$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/api/onboarding/status" | grep -o '"state":"[a-z_]*","step":[0-9]')"
check "6.2 onboarding page shows the confirmation + matrimonial ID" "yes" \
  "$(yes_if '[[ "$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/onboarding")" == *"NSM-TG-SRPT-$YEAR-0001"* ]]')"
check "6.3 resubmission while under review -> 409" "409" "$(status_of "$(submit "$T1" "$(payload '')")")"

echo "== second member: Other / Propose Gothra, mandal without coordinator"
r="$(submit "$T2" "$(payload "p.heritage.gender = 'female'; p.heritage.displayName = 'Second Member'; p.heritage.gothra = { kind: 'proposed', nameEn: 'Kasyapa', nameTe: 'కశ్యప' }; p.heritage.ancestralNativeDistrict = 'hyderabad'; p.heritage.ancestralNativeMandal = 'Ameerpet'; p.contact.phone = '+919900445566'; p.contact.whatsapp = null; p.contact.email = null; p.lang = 'en';")")"
check "7.1 proposed gothra accepted, Hyderabad ID, routed to district queue" "201 NSM-TG-HYDB-$YEAR-0001 false" \
  "$(status_of "$r") $(grep -o 'NSM-TG-[A-Z]*-[0-9]*-[0-9]*' <<<"$r") $(grep -o '"coordinatorAssigned":[a-z]*' <<<"$r" | cut -d: -f2)"
check "7.2 proposal stored unverified, linked to the member, not offered to others" "f|t|22" \
  "$(sql -c "SELECT (CASE WHEN g.is_verified THEN 't' ELSE 'f' END) || '|' || (CASE WHEN g.proposed_by = '$SUB2' AND p.gothra_id = g.id THEN 't' ELSE 'f' END)
               FROM matrimony_shared.gothra_master g JOIN matrimony_shared.profiles p ON p.root_user_id = '$SUB2' WHERE g.slug = 'kasyapa'")|$(curl -s -b "ns_session_token=$T1" "$BASE/matrimony/api/gothras" | grep -o '"slug"' | wc -l | tr -d ' ')"
check "7.3 English notices logged for the English session" "dpdp-profile-v1.en" \
  "$(sql -c "SELECT notice_version FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$SUB2' AND purpose = 'profile_processing'")"

echo "== log hygiene"
logs="$(compose logs --no-color nsm-app nginx postgres 2>&1)"
check "8.1 no names, contact data, address or gothra in container logs" "0" \
  "$(grep -ciE '9900112233|9900445566|gate\.member|Nadaswaram Street|Gate Member|Second Member|kasyapa|bharadwaja' <<<"$logs")"

echo "stack left running on $BASE (compose project nsm-phase3)"
exit "$failed"
