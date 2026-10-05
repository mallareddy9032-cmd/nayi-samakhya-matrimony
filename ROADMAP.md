# Nayi Samakhya Matrimony (NSM) — Production Roadmap

NSM is the matrimonial service of the Nayi-Brahmin community portal, served at
`https://nayisamakhya.org/matrimony` for all 33 districts of Telangana. It carries the community's
heritage (Dhanvantari Kalasha wellness, Mangala Nadaswaram music, modern salon enterprise) into a
matchmaking service that is private by default and compliant with the Digital Personal Data
Protection (DPDP) Act, 2023.

Each phase ends with an **exit gate**: a runnable check that must pass before the next phase starts.
Rules in `.cursor/rules/*.mdc` apply to every phase.

| Phase | Status |
|---|---|
| 1. Ingress, SSO gateway, core security | **Done** — exit gate green (`scripts/exit-gate-1.sh`) |
| 2. Schema & DPDP engine | **Done** — exit gate green (`scripts/exit-gate-2.sh`) |
| 3. Onboarding | **Done** — exit gate green (`scripts/exit-gate-3.sh`); coordinator UI and photo upload pending (see Phase 3) |
| 4. Discovery, interests, admin | Not started |
| 5. District anchors, sync, production | Not started |

---

## Baseline decisions

| Concern | Decision |
|---|---|
| Routing | NGINX path routing, `/matrimony/` -> NSM container. No sub-domains. |
| App | One Next.js 16 (App Router, TypeScript) app, `basePath: '/matrimony'`, request gate in `src/proxy.ts`. Admin at `/matrimony/nsm-admin`. |
| Database | PostgreSQL 15+, schema `matrimony_shared`, `pgcrypto`, RLS forced on every table. |
| DB access | `pg` + parameterised SQL through a single `withTx(ctx, fn)` helper. No ORM. |
| Identity | Parent-portal RS256 JWT (`ns_session_token` cookie or Bearer), verified against parent JWKS; DB keys users on `sub` (`root_user_id`, immutable); `ns_membership_id` is indexed metadata. |
| Validation | `zod` at every trust boundary. |
| Tests | Plain SQL `ASSERT` files for policies; `node:test` for app logic; `k6` for load. |
| Migrations | Numbered plain SQL files, forward-only, expand/contract. |

### Directory layout

```
src/proxy.ts                         SSO gate, CSRF origin check, nonce CSP (Next 16 Proxy)
src/lib/sso.ts                       JWT verification, JWKS cache, return_to guard (pure, tested)
src/lib/config.ts                    zod-validated env
src/lib/session.ts                   requireSession() for pages/route handlers (server-only)
src/app/                             routes: onboarding/, api/onboarding/{submit,status}, api/gothras; later: discover/ interests/ nsm-admin/
src/lib/onboarding.ts                wizard contract: zod schemas, versioned bilingual notices, option lists (client-safe, tested)
src/lib/onboarding-store.ts          onboarding DB operations (server-only)
deploy/nginx/matrimony.conf          http-context: rate-limit zones, log format, upstream (+ local server)
deploy/nginx/matrimony-locations.conf  server-context /matrimony location, included by parent portal
deploy/mock-sso/                     local stand-in for the parent portal (never in the NSM image)
src/lib/db.ts                        withTx(ctx, fn): pooled pg, transaction-local request identity
src/lib/crypto.ts                    contact key per transaction; setContactDetails / unmaskContact
db/migrations/NNN_*.sql              DDL, roles, policies, functions (applied by scripts/migrate.sh)
db/tests/NNN_*.test.sql              RLS / privilege assertions acting as nsm_app_user
db/fixtures/parent_portal.sql        LOCAL stand-in parent tables for isolation tests
test/*.test.ts                       node:test suites
scripts/exit-gate-<n>.sh             phase exit gates
docker-compose.phase1.yml            local stack: nginx + nsm-app + mock-sso
docker-compose.phase2.yml            local PostgreSQL 17 (127.0.0.1:5433)
docker-compose.phase3.yml            overlay: phase1 + phase2 stacks wired together (app -> Postgres)
load/search.k6.js                    Phase 5 benchmark
```

---

## Phase 1: Ingress routing, SSO gateway and core security

**Goal:** Only authenticated, community-verified NS-ID holders reach the NSM container, and the
edge blocks bulk scraping.

### Deliverables (built)

1. **NGINX path routing** (`deploy/nginx/`)
   - `location ^~ /matrimony` proxies to the NSM upstream with no URI rewrite (the app owns the
     base path); `^~` keeps parent regex locations from capturing NSM assets.
   - Sets `X-Request-ID`, `X-Forwarded-*`; blanks client-sent `X-Middleware-Subrequest`.
   - Per-IP `limit_req`: general 10 r/s burst 20; discovery 2 r/s burst 5; status 429.
   - Access log records `$uri` only, so query strings never reach logs.
2. **Security headers**
   - NGINX: HSTS (no `includeSubDomains`/`preload`; that is a parent-domain decision), `nosniff`,
     `X-Frame-Options: DENY`, `Referrer-Policy: same-origin`, `Permissions-Policy`, COOP/CORP,
     `X-Robots-Tag: noindex`, and a script-agnostic fallback CSP.
   - App: per-request nonce CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`,
     `base-uri 'none'`, `frame-ancestors 'none'`); pages render dynamically so nonces apply.
3. **SSO gate** (`src/proxy.ts`, `src/lib/sso.ts`)
   - Token from `ns_session_token` cookie, else `Authorization: Bearer`.
   - RS256 pinned; JWKS cached 10 min, unknown `kid` refetch throttled to once per 30 s;
     RSA keys under 2048 bits refused; `iss`, `aud`, `exp`, `nbf` checked with 60 s leeway.
   - `phone`/`email` claims stripped at parse time; never stored or logged.
   - No/invalid token -> 302 to `SSO_LOGIN_URL?return_to=` (same-origin `/matrimony` paths only).
     `is_ns_verified !== true` -> 403. Parent JWKS unreachable -> 503 (no login loop).
   - Pages re-verify through `requireSession()`; no identity is passed via headers.
4. **CORS & CSRF**: no CORS headers; non-GET/HEAD/OPTIONS requires `Origin === APP_ORIGIN`.
5. **Health endpoint** `/matrimony/healthz` (public, returns `ok`).
6. **Local harness**: `docker-compose.phase1.yml` (nginx + nsm-app + mock parent portal with an
   in-memory RSA key, JWKS, login page and `/mock/token?case=` test tokens). NSM container runs
   read-only, non-root, all capabilities dropped.

### Phase 1 exit gate

`npm test` (17 verifier tests) and `scripts/exit-gate-1.sh` (22 curl checks) against the local
stack: unauthenticated -> 302 with correct `return_to`; valid cookie and valid Bearer -> 200;
unverified -> 403; expired / not-yet-valid / wrong `aud` / wrong `iss` / tampered / `alg:none` /
HS256 key-confusion / malformed claims -> 302; spoofed headers -> 302; cross-origin POST -> 403;
nonce CSP and framing headers present; no CORS, `Server` version or `X-Powered-By`; discovery
burst -> 429.

---

## Phase 2: Isolated PostgreSQL schema and DPDP compliance engine

**Goal:** The database itself enforces isolation, Sagothra exclusion, coordinator sandboxing and
contact masking, so an app bug cannot leak data.

### Deliverables (built)

1. **Roles and isolation** (`001_roles_schema.sql`, superuser bootstrap)
   - Schema `matrimony_shared` owned by `nsm_owner` (NOLOGIN, BYPASSRLS so SECURITY DEFINER
     functions work under FORCE RLS); `nsm_migrator`; `nsm_app_user` (NOBYPASSRLS, logging of
     statements/parameters disabled at role level, 5 s statement timeout); `nsm_grievance_ro`.
   - `pgcrypto` installed inside `matrimony_shared`; EXECUTE revoked from PUBLIC by default.
   - `fn_assert_isolation()`: fails if any NSM role holds a privilege outside `matrimony_shared`;
     runs at the end of every migration run.
2. **Gothra master** (`002_gothra_master.sql`): 22 provisional gothras, English + Telugu names,
   `lineage_group` (Sagothra exclusion compares groups, so elders can merge variants).
3. **Core tables** (`003_core_tables.sql`), every table ENABLE + FORCE RLS:
   - `profiles` keyed on `root_user_id` (JWT `sub`), `ns_membership_id` (format-checked metadata),
     `phone_enc`/`email_enc`/`whatsapp_enc`/`door_address_enc` (AES-256 `pgp_sym_encrypt`),
     `ck_profiles_legal_marriage_age` (21 M / 18 F). A guard trigger stops owners self-reviewing,
     resets identity edits to `pending_mandal_review`, and limits coordinators to review fields
     and transitions (pending -> verified/rejected, verified <-> suspended).
   - `interests`: one per pair, ever; state machine + write-once per-party consent timestamps;
     `contact_unlocked` requires both.
   - `dpdp_consent_logs`: append-only (UPDATE/DELETE/TRUNCATE rejected for all roles), server
     timestamps, sha256 hash chain, `fn_verify_consent_chain()`.
   - `sub_admins` (mandal_coordinator, district_lineage_officer, grievance_officer),
     `grievance_tickets` (minimal, needed for the grievance unmask path), `contact_access_audit`
     (append-only).
4. **RLS** (`004_rls_policies.sql`): self CRUD; discovery = verified, non-self, outside the
   viewer's lineage group, viewer must be verified; coordinators see/update non-draft profiles in
   scope only (assignment AND token role); interests private to the pair and only to
   non-Sagothra verified targets; column grants give the app no privilege on `_enc` columns.
5. **Contact crypto** (`005_contact_crypto.sql`): `fn_set_contact_details`,
   `fn_grant_contact_share` / `fn_withdraw_contact_share` (ledger row + interest flag in one
   call), `unmask_contact_details(target_profile_id [, grievance_ticket_id])` with exactly three
   paths: self; mutual unlock with both latest `contact_share` rows granted; assigned grievance
   officer on an open ticket about that profile, not self-filed. Non-self disclosures audited.
   The key arrives per transaction (`nsm.contact_key`), never stored.
6. **App layer**: `src/lib/db.ts` (`withTx`), `src/lib/crypto.ts`; `scripts/migrate.sh`
   (forward-only, sha256-tracked).

Deferred to the phase that uses them (data minimisation): bio/photo columns and `erased` status
(Phase 3), `profile_view_quota` (Phase 4), door-address read path (Phase 3 field verification).

### Phase 2 exit gate (green)

`scripts/exit-gate-2.sh`: fresh PostgreSQL 17 with stand-in parent tables, migrations applied
twice (second run is a no-op), 33 SQL assertions across `db/tests/001`–`005` acting as
`nsm_app_user`, and a live `node:test` run of `withTx` + contact crypto. Covers: no access to
parent tables; age and format checks; consent ledger append-only and tamper-evident; Sagothra
profiles invisible even by id; coordinator cannot see or edit other mandals/districts; contact
decrypts only after both consents (and never without the runtime key); withdrawal blocks unmask;
grievance path constraints; every disclosure audited.

---

## Phase 3: Onboarding funnel and cultural heritage intake (steps 1–7)

**Goal:** A verified NS-ID holder creates a complete, consented profile that is locked for
Mandal Coordinator review.

### Deliverables (built)

`/matrimony/onboarding`: one client wizard (Midnight Navy / Temple Gold, English + Noto Sans
Telugu, Trishikha Deepam + Nadaswaram header; no scissors, shears or dating icons; no inline
styles, so the nonce CSP stays strict). Form state lives in memory only and is submitted once,
in one transaction, at step 6.

1. **Membership guard**: `requireSession()`; NS-ID and verification shown from the token.
2. **Self-Respect Pledge** (ఆత్మగౌరవ ప్రతిజ్ఞ), mandatory, logged as purpose `community_pledge`.
3. **Heritage**: name, gender, DOB (21 male / 18 female, Asia/Kolkata date), gothra from
   `gothra_master` or "Other / Propose Gothra" (`fn_propose_gothra`: deduplicated, one open
   proposal per member, hidden from others, blocks verification until ratified), maternal
   lineage, one of five vocations, ancestral native district (33-district master) and mandal.
4. **Career**: degree, occupation, income bracket; Salon Hub enterprise badge (Soundarya &
   Wellness Artisans only, DB CHECK); optional Jathakam (birth time/place, nakshatra).
5. **Privacy**: photo visibility (`public_verified` / `blurred` / `on_request`), contact masking
   acknowledgement, contact details (encrypted via `fn_set_contact_details`), and two separate
   DPDP s.6 consents (`profile_processing`, `coordinator_verification`). Each consent row stores
   the exact notice text in the chosen language, `<version>.<lang>`, IP (NGINX `X-Real-IP`) and
   user agent.
6. **Coordinator routing + review**: `fn_submit_profile()` re-checks completeness and consents,
   assigns the least-loaded active coordinator of the ancestral mandal (else the district lineage
   officer queue), issues `NSM-TG-<DIST>-<YYYY>-<NNNN>` (per district and year), and sets
   `pending_mandal_review`. The profile and its contact details are locked while under review;
   identity edits after verification send it back to review.
7. **Confirmation** with the matrimonial ID; the page shows it on every later visit.

APIs: `POST /matrimony/api/onboarding/submit` (strict zod, identity only from the token, 201 /
409 already submitted / 422 field paths only), `GET /matrimony/api/onboarding/status`,
`GET /matrimony/api/gothras`. Migration `006_onboarding.sql` (districts, vocations, career and
Jathakam columns, matrimonial ID counters, routing and submission functions).

Not built yet (each needs a decision first):

- **Mandal Coordinator field-verification view**, including the door-address read path
  (ratified decision: exposed only there). The DB already scopes coordinators to their mandal
  and enforces the review transitions; the UI and an audited `door_address` unmask path remain.
- **Photo upload** (blocked on open decision 3, storage target). `photo_visibility` is stored.
- **Withdrawal UI** for `profile_processing` / `coordinator_verification` consent. Required before
  launch (withdrawal must be as easy as granting).

### Phase 3 exit gate (green)

`scripts/exit-gate-3.sh`: unit tests (SSO + onboarding contract) and typecheck; fresh stack
(nginx + app + mock SSO + Postgres 17); all SQL suites `001`–`006` (43 assertions); then through
NGINX: SSO guard and 403 for unverified members, page renders the header without forbidden
iconography or inline styles, 22 gothras, cross-origin / under-age / injected identity / missing
consent / unsigned pledge all refused with nothing stored; a full Telugu submission returns 201
and `NSM-TG-SRPT-<year>-0001`. Database checks: contact columns are non-empty PGP bytea that
decrypt only with the runtime key, no plaintext in `pg_dump`, token phone/email never stored,
three consent rows with Telugu statement/version/IP/UA, hash chain valid, ledger UPDATE/DELETE
refused, profile pending and assigned to the Kodad coordinator. After submit: status step 7,
confirmation page, resubmission 409. A second member proposing a gothra from a mandal without a
coordinator gets a Hyderabad ID in the district queue, and the proposal stays hidden. Container
logs contain no names, contact data, address or gothra.

---

## Phase 4: Discovery roster, bilateral interest engine and admin console

**Goal:** Verified members find compatible matches, exchange interest, and unlock contact only by
mutual consent; coordinators run verification and grievances.

### Deliverables

1. **Discovery grid**
   - RLS already removes own profile, non-verified profiles and Sagothra profiles.
   - Ranking: same mandal, then same district, then rest of Telangana.
   - Filters: age range, district, vocation. Keyset pagination, page cap (e.g. 20),
     daily view quota.
   - Cards show first name, age, district, vocation, blurred/clear photo per owner choice.
     Never contact data or exact DOB.
2. **"Express Sincerity" state machine** (DB-enforced, from Phase 2)
   - `sent -> accepted -> contact_unlocked`, plus `declined`, `withdrawn`, `expired` (e.g. 30 days).
   - On `accepted`, both parties are asked for `contact_share` consent; when both have granted it,
     the interest moves to `contact_unlocked`. Either party may withdraw consent later; future
     unmask calls then fail.
   - Daily cap on interests sent per user.
3. **`/matrimony/nsm-admin` console**
   - Verification queue (Phase 3), gothra discrepancy resolution, user suspension.
   - **DPDP Grievance desk**: tickets with SLA timer, assignment, resolution notes; Grievance
     Officer contact published on every page footer.
   - Data principal rights: access (download own data), correction, erasure, consent withdrawal,
     nomination.
   - All admin actions written to an audit table readable by `nsm_grievance_ro`.

### Phase 4 exit gate

End-to-end journey test with two accounts A and B (different gothras, verified):

1. A discovers B; a Sagothra account C is never returned to A.
2. A sends interest; B's unmask attempt fails.
3. B accepts; unmask still fails until both grant `contact_share` consent.
4. Both consent -> status `contact_unlocked`; A and B each unmask the other's contact; two audit rows exist.
5. B withdraws consent -> subsequent unmask fails.
6. A coordinator from another mandal sees none of this.

---

## Phase 5: District anchors, enterprise sync and production harness

**Goal:** Expose NSM across the parent site, connect salon enterprise badges, and ship a
reproducible, zero-downtime deployment.

### Deliverables

1. **Kalyana Deepam navigation widget**
   - Small static snippet served from `/matrimony/widget.js` (no framework), embeddable on all 33
     district and mandal pages (`/suryapet`, `/kodad`, ...).
   - Reads `location.pathname`, maps the slug to district/mandal, links to
     `/matrimony/discover?district=...&mandal=...`. Unknown slugs link to plain `/matrimony`.
   - Accessible: keyboard-focusable, `aria-label`, bilingual label.
2. **`/salon-hub` bridge**
   - Parent portal exposes a signed, read-only "verified salon entrepreneur" assertion per NS-ID.
   - NSM stores only `salon_verified boolean` + `salon_verified_at`; refreshed on login. No DB link.
3. **Watermarked PDF bio-data**
   - Users can export their own bio-data. Every page watermarked with the requesting NS-ID hash,
     timestamp and "Confidential – Nayi Samakhya Matrimony". Contact data included only for the
     owner's own export. Export events audited.
4. **Production orchestration**
   - `deploy/docker-compose.yml` for staging; Kubernetes manifests for production
     (Deployment with readiness/liveness on `/matrimony/healthz`, rolling update
     `maxUnavailable: 0`, HPA, NetworkPolicy allowing NSM pods to reach only Postgres and
     object storage).
   - Migration runner: one-off Job using `nsm_migrator`, runs before rollout; expand/contract
     migrations only.
   - Secrets (JWKS URL, encryption key, DB passwords) from the secret manager, never in images.
   - Backups: encrypted daily base backups + WAL archiving; restore drill documented.
   - Breach runbook: detection, containment, notification of the Data Protection Board and
     affected users within the timelines in the DPDP Rules.

### Phase 5 exit gate

- **Zero-downtime simulation**: run k6 load while deploying a new image with a migration;
  zero 5xx and zero failed requests during rollout.
- **Search latency benchmark** (`load/search.k6.js`, proposed SLO): discovery p95 ≤ 300 ms and
  p99 ≤ 800 ms at 200 RPS with 100k seeded profiles; rate limiter returns 429 (not 5xx) beyond quota.
- `EXPLAIN ANALYZE` of the discovery query shows index use with RLS enabled.

---

## Compliance checklist (DPDP Act, 2023)

Legal items below are engineering interpretations and need sign-off from qualified Indian counsel
against the currently notified DPDP Rules before launch.

- [ ] Notice before consent, itemised by purpose, in English and Telugu (s.5).
- [ ] Free, specific, unambiguous consent per purpose; withdrawal as easy as grant (s.6).
- [ ] Immutable, hash-chained consent logs with IP/timestamp/notice version.
- [ ] No processing of data of persons under 18 (s.9); legal marriage age enforced.
- [ ] Contact data encrypted at rest; unmasked only on mutual consent; every unmask audited.
- [ ] Reasonable security safeguards: RLS, least privilege, encryption, rate limiting (s.8(5)).
- [ ] Breach notification runbook to Board and affected principals (s.8(6)).
- [ ] Erasure when purpose ends or consent is withdrawn (s.8(7)); crypto-wipe of contact columns.
- [ ] Published Grievance Officer contact and ticketed redressal within prescribed timelines (s.8(9), s.13).
- [ ] Data principal rights: access, correction, erasure, nomination (s.11–14).
- [ ] Gothra/caste treated as high-risk data: never in logs, URLs, analytics or third-party scripts.

## Resolved decisions

- SSO contract: cookie `ns_session_token` (Bearer fallback), `iss = https://nayisamakhya.org`,
  `aud = nayisamakhya-matrimony`, JWKS `https://nayisamakhya.org/.well-known/jwks.json`, claims
  `sub`, `ns_membership_id`, `is_ns_verified`, `assigned_district`, `assigned_mandal`, `roles`.
- Rules live in `.cursor/rules/*.mdc`.
- Users keyed on JWT `sub` as `root_user_id`; token `phone`/`email` discarded at parse time.
- `SSO_LOGIN_URL` defaults to `https://nayisamakhya.org/login`; canonical app root is `/matrimony`.
- DB context GUCs `request.jwt.claim.sub` / `request.jwt.claim.roles`; app role `nsm_app_user`.
- `return_to` is the canonical login parameter (parent must validate it is a `/matrimony/` path).
- Self-unmask is allowed and not audited (own data, DPDP right of access).
- Grievance tickets: single assigned officer; Phase 4 adds an optional dual-approval flag.
- Door address stays encrypted; exposed only in the Mandal Coordinator field-verification view.
- 22 seeded gothras are `is_verified = true` (provisional baseline); new ones via
  "Other / Propose Gothra" and ratification.
- `nsm_owner` only for migrations and SECURITY DEFINER routines; the app runs as `nsm_app_user`
  under forced RLS.

## Open decisions

1. District codes in matrimonial IDs (`SRPT`, `HYDB`, …, `db/migrations/006`) were chosen by NSM;
   confirm with the parent portal before the first real ID is issued (IDs are permanent).
2. Parent team: drop `phone`/`email` from the matrimony token (NSM discards them; they still travel
   in a cookie on every request). Confirm `ns_membership_id` format `NS-XX-XXXX-<digits>` is final.
3. Photo storage target (S3-compatible bucket vs. self-hosted MinIO).
4. Secret manager for the pgcrypto key (cloud KMS vs. Vault vs. Kubernetes secret).
5. Does matching need gender-based filtering at the RLS level, or only as a UI filter?
6. Interest expiry period and daily caps (proposed: 30 days, 10 interests/day, 100 profile views/day).
7. Lineage groupings of the 22 seeded gothras still need confirmation by community elders.
8. Mandal is free text (slugified). A mandal master per district would prevent misrouting.
9. Pledge, notice and option texts in Telugu need native-speaker / legal review; any change
   bumps the notice version.
