#!/usr/bin/env bash
# Phase 4 exit gate: unit tests, typecheck, all SQL suites, then through NGINX -> Next.js ->
# PostgreSQL + MinIO: coordinator scope, photo signing and expiry, the bilateral interest/contact
# cycle, consent withdrawal, dual-officer grievance actions and erasure, plus data/log hygiene.
# Leaves the stack running on $BASE for manual inspection.
set -uo pipefail
cd "$(dirname "$0")/.."
export NSM_PORT="${NSM_PORT:-8090}"
export NSM_PG_PORT="${NSM_PG_PORT:-5435}"
export NSM_CONTACT_KEY="${NSM_CONTACT_KEY:-$(openssl rand -hex 32)}"
export PHOTO_URL_TTL_SECONDS="${PHOTO_URL_TTL_SECONDS:-5}"
BASE="http://localhost:$NSM_PORT"
YEAR="$(TZ=Asia/Kolkata date +%Y)"
A=a0000000-0000-4000-8000-00000000000a   # groom, Kodad, Bharadwaja
B=a0000000-0000-4000-8000-00000000000b   # bride, Kodad, Kashyapa, blurred photo
C=a0000000-0000-4000-8000-00000000000c   # bride, Kodad, Bharadwaja (Sagothra with A)
D=a0000000-0000-4000-8000-00000000000d   # bride, Hyderabad/Ameerpet, proposes a gothra
CS=c0000000-0000-4000-8000-000000000001  # Suryapet / Kodad mandal coordinator
CH=c0000000-0000-4000-8000-000000000002  # Hyderabad / Ameerpet mandal coordinator
DH=c0000000-0000-4000-8000-000000000003  # Hyderabad district lineage officer
G1=c0000000-0000-4000-8000-000000000004  # grievance officers
G2=c0000000-0000-4000-8000-000000000005
ADMIN=c0000000-0000-4000-8000-0000000000ff
failed=0

compose() { docker compose -f docker-compose.phase1.yml -f docker-compose.phase2.yml -f docker-compose.phase3.yml -f docker-compose.phase4.yml "$@"; }
sql() { compose exec -T postgres psql -X -qtA -v ON_ERROR_STOP=1 -U postgres -d nayisamakhya "$@"; }
mcq() { compose run --rm --no-deps -T --entrypoint mc -e MC_CONFIG_DIR=/tmp/.mc \
  -e "MC_HOST_nsm=http://${NSM_MINIO_ROOT_USER:-nsm-minio-root}:${NSM_MINIO_ROOT_PASSWORD:-local-minio-root-only}@minio:9000" minio-init "$@"; }
check() { if [[ "$2" == "$3" ]]; then echo "PASS  $1"; else echo "FAIL  $1 (expected '$2', got '$3')"; failed=1; fi; }
yes_if() { if eval "$1"; then echo yes; else echo no; fi; }
CURL=(curl -s --retry 6 --retry-delay 1)   # 429 from the edge rate limiter counts as transient
tok() { curl -sf "$BASE/mock/token?case=valid&sub=$1${2:+&roles=$2}"; }
api() { # token path json -> "<body> <status>"
  "${CURL[@]}" -w ' %{http_code}' -X POST -H "Origin: $BASE" -H 'content-type: application/json' -H 'user-agent: nsm-exit-gate-4' \
    -b "ns_session_token=$1" --data "$3" "$BASE/matrimony/api/$2"
}
page() { "${CURL[@]}" -b "ns_session_token=$1" "$BASE/matrimony/$2"; }
code() { "${CURL[@]}" -o /dev/null -w '%{http_code}' "$@"; }
status_of() { echo "${1##* }"; }
field() { node -e 'const s=require("fs").readFileSync(0,"utf8"); const j=JSON.parse(s.slice(0,s.lastIndexOf(" "))); process.stdout.write(String(j[process.argv[1]] ?? ""))' "$2" <<<"$1"; }
pid() { sql -c "SELECT id FROM matrimony_shared.profiles WHERE root_user_id = '$1'"; }
pstatus() { sql -c "SELECT status FROM matrimony_shared.profiles WHERE root_user_id = '$1'"; }
media_url() { grep -oE '/matrimony/media/nsm-profile-photos/photos/[0-9a-f-]+/'"$2"'\.webp\?[^"]+' <<<"$1" | head -1 | sed 's/&amp;/\&/g'; }
payload() { # $1 = JS statements that mutate p
  node --input-type=module -e "
import { NOTICES } from './src/lib/onboarding.ts';
const gothras = JSON.parse(process.env.GOTHRAS);
const p = {
  lang: 'te',
  pledge: { accepted: true, noticeVersion: NOTICES.pledge.version },
  heritage: { displayName: 'Gate Member', gender: 'female', dateOfBirth: '$((YEAR - 26))-04-14',
    gothra: { kind: 'listed', id: gothras.bharadwaja }, maternalLineage: null, vocation: 'nadopasana',
    ancestralNativeDistrict: 'suryapet', ancestralNativeMandal: 'kodad' },
  career: { educationDegree: 'B.Mus (Carnatic)', occupation: 'Temple Nadaswaram Vidwan', incomeBracket: '6l_12l',
    salonHubSlug: null, birthTime: '05:42', birthPlace: 'Kodad', nakshatra: 'rohini' },
  privacy: { photoVisibility: 'blurred', contactMaskingAcknowledged: true, profileProcessingConsent: true,
    coordinatorVerificationConsent: true, profileNoticeVersion: NOTICES.profileProcessing.version,
    coordinatorNoticeVersion: NOTICES.coordinatorVerification.version },
  contact: { phone: '+919900000000', email: null, whatsapp: null, doorAddress: '1 Gate Street, Kodad' },
};
$1
process.stdout.write(JSON.stringify(p));"
}

echo "== unit tests and typecheck"
if npm test --silent >/dev/null 2>&1; then echo "PASS  npm test (SSO, onboarding, Phase 4 contracts, SigV4 vector)"; else echo "FAIL  npm test"; failed=1; fi
if npx tsc --noEmit; then echo "PASS  typecheck"; else echo "FAIL  typecheck"; failed=1; fi

echo "== stack (nginx + nsm-app + mock-sso + postgres + minio)"
compose down -v --remove-orphans >/dev/null 2>&1
log="$(mktemp)"
compose build nsm-app minio-init >"$log" 2>&1 || { echo "FAIL  image build"; tail -40 "$log"; exit 1; }
compose up -d --wait nginx >"$log" 2>&1 || { echo "FAIL  stack did not become healthy"; tail -40 "$log"; compose logs --no-color minio-init | tail -20; exit 1; }
compose exec -T postgres sh /nsm/scripts/migrate.sh >/dev/null || { echo "FAIL  migrations"; exit 1; }
echo "PASS  stack healthy, private bucket provisioned, migrations 001-008 applied"

echo "== SQL assertion suites"
for f in db/tests/[0-9]*.test.sql; do
  out="$(compose exec -T postgres psql -X -q -o /dev/null -v ON_ERROR_STOP=1 -U postgres -d nayisamakhya -f "/nsm/$f" 2>&1)"
  if [[ $? -eq 0 ]]; then echo "PASS  $f ($(grep -c 'NOTICE:  PASS' <<<"$out") assertions)"
  else echo "FAIL  $f"; grep -E 'ERROR|CONTEXT' <<<"$out" | sed 's/^/      /'; failed=1; fi
done

sql <<SQL >/dev/null
INSERT INTO matrimony_shared.sub_admins (root_user_id, role, district, mandal, assigned_by) VALUES
  ('$CS', 'mandal_coordinator', 'suryapet', 'kodad', '$ADMIN'),
  ('$CH', 'mandal_coordinator', 'hyderabad', 'ameerpet', '$ADMIN'),
  ('$DH', 'district_lineage_officer', 'hyderabad', NULL, '$ADMIN'),
  ('$G1', 'grievance_officer', NULL, NULL, '$ADMIN'),
  ('$G2', 'grievance_officer', NULL, NULL, '$ADMIN');
SQL
TA="$(tok $A)"; TB="$(tok $B)"; TC="$(tok $C)"; TD="$(tok $D)"
TCS="$(tok $CS member,mandal_coordinator)"; TCH="$(tok $CH member,mandal_coordinator)"
TDH="$(tok $DH member,district_lineage_officer)"; TG1="$(tok $G1 member,grievance_officer)"; TG2="$(tok $G2 member,grievance_officer)"
export GOTHRAS="$("${CURL[@]}" -b "ns_session_token=$TA" "$BASE/matrimony/api/gothras" | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(JSON.stringify(Object.fromEntries(j.gothras.map(g=>[g.slug,g.id]))))')"

echo "== onboarding four members through the API"
r1="$(api "$TA" onboarding/submit "$(payload "p.heritage.displayName='Arjun Gate'; p.heritage.gender='male'; p.heritage.dateOfBirth='$((YEAR - 29))-02-10'; p.contact.phone='+919811111111'; p.contact.email='arjun.gate@example.invalid';")")"
r2="$(api "$TB" onboarding/submit "$(payload "p.heritage.displayName='Bhavani Gate'; p.heritage.gothra={kind:'listed', id: gothras.kashyapa}; p.heritage.vocation='wellness_artisan'; p.career.salonHubSlug='kodad-glow-studio'; p.contact.phone='+919822222222'; p.contact.email='bhavani.gate@example.invalid'; p.contact.doorAddress='22 Lotus Lane, Kodad';")")"
r3="$(api "$TC" onboarding/submit "$(payload "p.heritage.displayName='Chandrika Gate'; p.contact.phone='+919833333333';")")"
r4="$(api "$TD" onboarding/submit "$(payload "p.heritage.displayName='Deepika Gate'; p.heritage.gothra={kind:'proposed', nameEn:'Kasyapa', nameTe:null}; p.heritage.ancestralNativeDistrict='hyderabad'; p.heritage.ancestralNativeMandal='ameerpet'; p.heritage.vocation='corporate_tech_civil'; p.contact.phone='+919844444444';")")"
check "0.1 four submissions accepted (201)" "201 201 201 201" "$(status_of "$r1") $(status_of "$r2") $(status_of "$r3") $(status_of "$r4")"
r="$(api "$TA" onboarding/submit "$(payload "p.heritage.ancestralNativeMandal='ameerpet';")")"
check "0.2 mandal outside the chosen district refused (master list)" "422" "$(status_of "$r")"
PA="$(pid $A)"; PB="$(pid $B)"; PC="$(pid $C)"; PD="$(pid $D)"
check "0.3 routing: Kodad -> Suryapet coordinator, Ameerpet -> Hyderabad coordinator" "t|t" \
  "$(sql -c "SELECT bool_and(assigned_coordinator_user_id = '$CS') FROM matrimony_shared.profiles WHERE id IN ('$PA','$PB','$PC')")|$(sql -c "SELECT assigned_coordinator_user_id = '$CH' FROM matrimony_shared.profiles WHERE id = '$PD'")"

echo "== nsm-admin: coordinator scope (Suryapet vs Hyderabad)"
adm="$(page "$TCS" nsm-admin)"
check "1.1 Suryapet coordinator queue lists the 3 Kodad profiles, not the Hyderabad one" "yes" \
  "$(yes_if '[[ "$adm" == *"Arjun Gate"* && "$adm" == *"Bhavani Gate"* && "$adm" == *"Chandrika Gate"* && "$adm" != *"Deepika Gate"* ]]')"
check "1.2 Suryapet coordinator cannot approve the Hyderabad profile (404, still pending)" "404 pending_mandal_review" \
  "$(status_of "$(api "$TCS" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$PD\"}")") $(pstatus $D)"
check "1.3 Suryapet coordinator cannot read the Hyderabad door address (403)" "403" \
  "$(status_of "$(api "$TCS" admin/profiles "{\"action\":\"door_address\",\"profileId\":\"$PD\"}")")"
r="$(api "$TCS" admin/profiles "{\"action\":\"door_address\",\"profileId\":\"$PB\"}")"
check "1.4 assigned coordinator reads the door address; decryption audited (field_verification)" "200 22 Lotus Lane, Kodad 1" \
  "$(status_of "$r") $(field "$r" address) $(sql -c "SELECT count(*) FROM matrimony_shared.audit_access_logs WHERE target_profile_id = '$PB' AND viewer_user_id = '$CS' AND basis = 'field_verification'")"
check "1.5 member and token-less coordinator get no admin console / no review power" "404 404" \
  "$(code -b "ns_session_token=$TA" "$BASE/matrimony/nsm-admin") $(status_of "$(api "$(tok $CS)" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$PA\"}")")"
check "1.6 rejection without a reason refused (422)" "422" "$(status_of "$(api "$TCS" admin/profiles "{\"action\":\"reject\",\"profileId\":\"$PC\",\"reason\":\" \"}")")"
check "1.7 Suryapet coordinator verifies A, B, C" "200 200 200" \
  "$(for p in $PA $PB $PC; do status_of "$(api "$TCS" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$p\"}")"; done | xargs)"
check "1.8 door address unreadable once verified (403)" "403" "$(status_of "$(api "$TCS" admin/profiles "{\"action\":\"door_address\",\"profileId\":\"$PB\"}")")"

echo "== nsm-admin: gothra discrepancy queue"
GK="$(sql -c "SELECT id FROM matrimony_shared.gothra_master WHERE slug = 'kasyapa'")"
check "2.1 Hyderabad coordinator cannot verify while the gothra is unratified (422)" "422" \
  "$(status_of "$(api "$TCH" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$PD\"}")")"
check "2.2 lineage officer sees the proposal; a coordinator cannot resolve it (403)" "yes 403" \
  "$(yes_if '[[ "$(page "$TDH" nsm-admin)" == *"Kasyapa"* ]]') $(status_of "$(api "$TCH" admin/gothras "{\"gothraId\":\"$GK\"}")")"
r="$(api "$TDH" admin/gothras "{\"gothraId\":\"$GK\",\"mergeInto\":\"$(node -e 'process.stdout.write(JSON.parse(process.env.GOTHRAS).kashyapa)')\"}")"
check "2.3 Hyderabad lineage officer merges 'Kasyapa' into Kashyapa (lineage joined, picker hidden)" "200 t|f|kashyapa" \
  "$(status_of "$r") $(sql -c "SELECT (CASE WHEN is_verified THEN 't' ELSE 'f' END) || '|' || (CASE WHEN active THEN 't' ELSE 'f' END) || '|' || lineage_group FROM matrimony_shared.gothra_master WHERE id = '$GK'")"
check "2.4 Hyderabad coordinator verifies D" "200 verified" "$(status_of "$(api "$TCH" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$PD\"}")") $(pstatus $D)"

echo "== photos: private bucket, signed short-lived URLs"
node --input-type=module -e "
import sharp from 'sharp';
await sharp({ create: { width: 640, height: 800, channels: 3, background: '#7a4b2a' } })
  .jpeg().withExif({ IFD0: { Copyright: 'NSM-GATE-EXIF-MARKER', Artist: 'NSM-GATE-EXIF-MARKER' }, IFD3: { GPSLatitudeRef: 'N', GPSLongitudeRef: 'E' } })
  .toFile('/tmp/nsm-gate-photo.jpg');"
check "3.0 test photo carries EXIF (marker + GPS IFD)" "yes" "$(yes_if 'grep -q NSM-GATE-EXIF-MARKER /tmp/nsm-gate-photo.jpg')"
upload() { "${CURL[@]}" -o /dev/null -w '%{http_code}' -X POST -H "Origin: $BASE" -b "ns_session_token=$1" -F 'photo=@/tmp/nsm-gate-photo.jpg;type=image/jpeg' -F lang=te -F "consent=$2" -F noticeVersion=dpdp-photo-v1 "$BASE/matrimony/api/photos"; }
check "3.1 upload without photo consent refused (422)" "422" "$(upload "$TB" no)"
check "3.2 upload with consent -> 201; verified profile goes back to review" "201 pending_mandal_review" "$(upload "$TB" yes) $(pstatus $B)"
check "3.3 photo consent row logged (dpdp-photo-v1.te)" "1" "$(sql -c "SELECT count(*) FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$B' AND purpose = 'photo_display' AND granted AND notice_version = 'dpdp-photo-v1.te'")"
OBJ="$(sql -c "SELECT photo_object_id FROM matrimony_shared.profiles WHERE id = '$PB'")"
check "3.4 objects stored privately (full + blurred) under photos/<random id>/" "2" "$(mcq ls "nsm/nsm-profile-photos/photos/$OBJ/" 2>/dev/null | grep -c webp)"
check "3.5 reviewing coordinator re-verifies after the new photo" "200" "$(status_of "$(api "$TCS" admin/profiles "{\"action\":\"verify\",\"profileId\":\"$PB\"}")")"
grid="$(page "$TA" discover)"
BLUR="$(media_url "$grid" blur)"
check "3.6 A's grid: B shown with the blurred variant only (no full URL)" "yes" \
  "$(yes_if '[[ -n "$BLUR" && "$grid" == *"Bhavani"* && -z "$(media_url "$grid" full)" ]]')"
check "3.7 A's grid excludes the Sagothra member C; badges rendered" "yes" \
  "$(yes_if '[[ "$grid" != *"Chandrika"* && "$grid" == *"NS-ID Verified"* && "$grid" == *"Enterprise Modernist"* && "$grid" == *"Heritage Stream · Wellness Artisan"* ]]')"
check "3.8 proximity ranking: same-mandal B before Hyderabad D" "yes" "$(yes_if '[[ "$grid" == *"Bhavani"*"Deepika"* ]]')"
check "3.9 signed URL serves the image (200 image/webp)" "200 image/webp" "$("${CURL[@]}" -o /dev/null -w '%{http_code} %{content_type}' "$BASE$BLUR")"
check "3.10 tampered signature -> 403" "403" "$(code "$BASE${BLUR%?}0")"
check "3.11 unsigned request -> 403" "403" "$(code "$BASE${BLUR%%\?*}")"
check "3.12 same signature on the full variant (key swap) -> 403" "403" "$(code "$BASE${BLUR/blur.webp/full.webp}")"
check "3.13 non-GET to the media path -> 403" "403" "$(code -X PUT --data x "$BASE${BLUR%%\?*}")"
check "3.14 session cookie not forwarded / not needed: anonymous signed fetch only works within TTL" "200" "$(code "$BASE$BLUR")"
own="$(page "$TB" settings/privacy)"; FULL="$(media_url "$own" full)"
"${CURL[@]}" -o /tmp/nsm-gate-served.webp "$BASE$FULL"
check "3.15 served photo is re-encoded WebP with no EXIF/GPS (marker gone)" "webp no-exif clean" \
  "$(node --input-type=module -e "import sharp from 'sharp'; const m = await sharp('/tmp/nsm-gate-served.webp').metadata(); process.stdout.write(m.format + ' ' + (m.exif ? 'exif' : 'no-exif'))") $(grep -q NSM-GATE-EXIF-MARKER /tmp/nsm-gate-served.webp && echo leaked || echo clean)"
sleep "$((PHOTO_URL_TTL_SECONDS + 2))"
check "3.16 signed URL rejected after its ${PHOTO_URL_TTL_SECONDS}s TTL (403)" "403" "$(code "$BASE$BLUR")"

echo "== bilateral cycle: express -> accept -> both consent -> contact decrypts"
check "4.1 interest to a Sagothra member refused (403)" "403" "$(status_of "$(api "$TA" interests/express "{\"profileId\":\"$PC\"}")")"
r="$(api "$TA" interests/express "{\"profileId\":\"$PB\"}")"; IAB="$(field "$r" id)"
check "4.2 A expresses interest in B (201 sent)" "201 sent" "$(status_of "$r") $(field "$r" status)"
check "4.3 duplicate interest refused (409)" "409" "$(status_of "$(api "$TA" interests/express "{\"profileId\":\"$PB\"}")")"
check "4.4 identity cannot be injected (strict body, 422)" "422" "$(status_of "$(api "$TC" interests/express "{\"profileId\":\"$PB\",\"fromProfileId\":\"$PA\"}")")"
check "4.5 before acceptance neither side can decrypt (403 403)" "403 403" \
  "$(status_of "$(api "$TA" interests/contact "{\"interestId\":\"$IAB\"}")") $(status_of "$(api "$TB" interests/contact "{\"interestId\":\"$IAB\"}")")"
check "4.6 sender cannot accept their own interest (404)" "404" "$(status_of "$(api "$TA" interests/respond "{\"interestId\":\"$IAB\",\"decision\":\"accepted\"}")")"
check "4.7 B accepts (200 accepted)" "200 accepted" "$(r="$(api "$TB" interests/respond "{\"interestId\":\"$IAB\",\"decision\":\"accepted\"}")"; echo "$(status_of "$r") $(field "$r" status)")"
check "4.8 accepted interest = explicit approval: A now gets B's full photo" "yes" "$(yes_if '[[ -n "$(media_url "$(page "$TA" "profiles/$PB")" full)" ]]')"
check "4.9 accepted but no contact consent yet: A cannot decrypt (403)" "403" "$(status_of "$(api "$TA" interests/contact "{\"interestId\":\"$IAB\"}")")"
r="$(api "$TA" interests/consent-contact "{\"interestId\":\"$IAB\",\"grant\":true,\"lang\":\"te\",\"noticeVersion\":\"dpdp-contact-v1\"}")"
check "4.10 A consents to share contact (still accepted: B has not)" "200 accepted" "$(status_of "$r") $(field "$r" status)"
check "4.11 one-sided consent: A still cannot decrypt (403)" "403" "$(status_of "$(api "$TA" interests/contact "{\"interestId\":\"$IAB\"}")")"
r="$(api "$TB" interests/consent-contact "{\"interestId\":\"$IAB\",\"grant\":true,\"lang\":\"en\",\"noticeVersion\":\"dpdp-contact-v1\"}")"
check "4.12 B consents -> contact_unlocked" "200 contact_unlocked" "$(status_of "$r") $(field "$r" status)"
rA="$(api "$TA" interests/contact "{\"interestId\":\"$IAB\"}")"; rB="$(api "$TB" interests/contact "{\"interestId\":\"$IAB\"}")"
check "4.13 contact card decrypts both ways" "200 +919822222222 bhavani.gate@example.invalid | 200 +919811111111" \
  "$(status_of "$rA") $(field "$rA" phone) $(field "$rA" email) | $(status_of "$rB") $(field "$rB" phone)"
check "4.14 two mutual_interest disclosures audited, visible to each target" "2" \
  "$(sql -c "SELECT count(*) FROM matrimony_shared.audit_access_logs WHERE basis = 'mutual_interest' AND target_profile_id IN ('$PA','$PB')")"
check "4.15 contact_share ledger rows carry the notice version + language shown" "dpdp-contact-v1.en,dpdp-contact-v1.te" \
  "$(sql -c "SELECT string_agg(notice_version, ',' ORDER BY notice_version) FROM matrimony_shared.dpdp_consent_logs WHERE purpose = 'contact_share' AND interest_id = '$IAB'")"
check "4.16 an outsider cannot decrypt this pair (403)" "403" "$(status_of "$(api "$TD" interests/contact "{\"interestId\":\"$IAB\"}")")"

echo "== photo report with dual-officer takedown"
r="$(api "$TC" grievances "{\"category\":\"unauthorized_photo\",\"profileId\":\"$PB\",\"description\":\"This photo is not of this member.\"}")"; TK="$(field "$r" id)"
check "5.1 member files an unauthorized-photo report (201)" "201" "$(status_of "$r")"
check "5.2 G1 assigns it to self" "200" "$(status_of "$(api "$TG1" admin/grievances "{\"action\":\"assign\",\"ticketId\":\"$TK\"}")")"
r="$(api "$TG1" admin/grievances "{\"action\":\"propose\",\"ticketId\":\"$TK\",\"kind\":\"remove_photo\",\"note\":\"Photo does not match the verified member.\"}")"; AK="$(field "$r" actionId)"
check "5.3 G1 proposes removal; G1 cannot approve own proposal (403)" "200 403" "$(status_of "$r") $(status_of "$(api "$TG1" admin/grievances "{\"action\":\"approve\",\"actionId\":\"$AK\"}")")"
check "5.4 G2 approves -> photo detached and both objects deleted from the bucket" "200 t 0" \
  "$(status_of "$(api "$TG2" admin/grievances "{\"action\":\"approve\",\"actionId\":\"$AK\"}")") $(sql -c "SELECT photo_object_id IS NULL FROM matrimony_shared.profiles WHERE id = '$PB'") $(mcq ls "nsm/nsm-profile-photos/photos/$OBJ/" 2>/dev/null | grep -c webp)"

echo "== consent withdrawal (DPDP s.6): one click -> suspended"
r="$(api "$TB" consents "{\"purpose\":\"profile_processing\",\"grant\":false,\"lang\":\"te\",\"noticeVersion\":\"dpdp-profile-v1\"}")"
check "6.1 B withdraws profile-processing consent -> suspended" "200 suspended" "$(status_of "$r") $(field "$r" status)"
check "6.2 withdrawal is a new ledger row (granted=false); chain verifies" "f t" \
  "$(sql -c "SELECT CASE WHEN granted THEN 't' ELSE 'f' END FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$B' AND purpose = 'profile_processing' ORDER BY seq DESC LIMIT 1") $(sql -c "SELECT matrimony_shared.fn_verify_consent_chain() IS NULL")"
check "6.3 B hidden from A's grid and profile page; contact unmask halted" "yes 404 403" \
  "$(yes_if '[[ "$(page "$TA" discover)" != *"Bhavani"* ]]') $(code -b "ns_session_token=$TA" "$BASE/matrimony/profiles/$PB") $(status_of "$(api "$TA" interests/contact "{\"interestId\":\"$IAB\"}")")"
r="$(api "$TB" consents "{\"purpose\":\"profile_processing\",\"grant\":true,\"lang\":\"te\",\"noticeVersion\":\"dpdp-profile-v1\"}")"
check "6.4 re-granting resumes via coordinator review (pending_mandal_review)" "200 pending_mandal_review" "$(status_of "$r") $(field "$r" status)"

echo "== erasure request with dual-officer approval"
r="$(api "$TC" grievances "{\"category\":\"data_erasure\",\"profileId\":null,\"description\":\"Please erase my matrimonial data.\"}")"; TE="$(field "$r" id)"
check "7.1 C requests erasure (201); erasure of someone else is refused (422)" "201 422" \
  "$(status_of "$r") $(status_of "$(api "$TC" grievances "{\"category\":\"data_erasure\",\"profileId\":\"$PB\",\"description\":\"Erase her.\"}")")"
api "$TG1" admin/grievances "{\"action\":\"assign\",\"ticketId\":\"$TE\"}" >/dev/null
r="$(api "$TG1" admin/grievances "{\"action\":\"propose\",\"ticketId\":\"$TE\",\"kind\":\"erase_profile\",\"note\":\"Verified request from the data principal.\"}")"; AE="$(field "$r" actionId)"
check "7.2 G2 approves the erasure" "200" "$(status_of "$(api "$TG2" admin/grievances "{\"action\":\"approve\",\"actionId\":\"$AE\"}")")"
check "7.3 profile anonymised, ciphertext wiped; consent ledger and dual-officer trail kept" "erased|Erased member|t|t|t" \
  "$(sql -c "SELECT p.status || '|' || p.display_name || '|' || (p.phone_enc IS NULL AND p.door_address_enc IS NULL AND p.gothra_id IS NULL AND p.date_of_birth IS NULL)::text::char
                    || '|' || ((SELECT count(*) FROM matrimony_shared.dpdp_consent_logs WHERE root_user_id = '$C') >= 3)::text::char
                    || '|' || (SELECT bool_and(approved_by <> proposed_by) FROM matrimony_shared.grievance_actions WHERE action <> 'resolve')::text::char
               FROM matrimony_shared.profiles p WHERE p.id = '$PC'")"

echo "== hygiene"
dump="$(compose exec -T postgres pg_dump -U postgres -n matrimony_shared nayisamakhya)"
check "8.1 no plaintext contact or door address in pg_dump" "0" "$(grep -cE '98[1-4]{2}[0-9]{6}|gate@example|Lotus Lane|Gate Street' <<<"$dump")"
logs="$(compose logs --no-color nsm-app nginx postgres minio 2>&1)"
check "8.2 logs: no names, contact, address, gothra, photo paths or signatures" "0" \
  "$(grep -ciE 'Arjun|Bhavani|Chandrika|Deepika|98[1-4]{2}[0-9]{6}|gate@example|Lotus Lane|kashyapa|kasyapa|bharadwaja|photos/[0-9a-f-]{36}|X-Amz-Signature' <<<"$logs")"

echo "stack left running on $BASE (compose project nsm-phase4)"
exit "$failed"
