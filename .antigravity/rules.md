# Nayi Samakhya Matrimony (NSM) - System Architectural & Compliance Laws

## System Identity & Cultural Jurisdiction
- **Platform Name:** Nayi Samakhya Matrimony (NSM)
- **Community Domain:** Nayi-Brahmin community across all 33 districts of Telangana.
- **Cultural Foundations:** Honoring ancestral heritage in traditional healing/wellness (Dhanvantari Kalasha), classical sacred acoustic arts (Mangala Nadaswaram), and modern salon/wellness enterprises.

---

## 5 Non-Negotiable Architectural & Legal Laws

### Law 1: Routing & Sub-directory Topology
- **Sub-directory Mandate:** Must strictly execute under the path-routed sub-directory `/matrimony` of the primary domain `nayisamakhya.org`. Absolutely NO subdomains (`matrimony.nayisamakhya.org` is forbidden).
- **Application Engine:** Next.js (App Router, Node.js runtime) configured with `basePath: '/matrimony'`.
- **Ingress Layer:** NGINX reverse-proxy with strict path routing, SSL termination, and dedicated rate-limiting (`limit_req_zone $binary_remote_addr zone=nsm_limit:10m rate=10r/s; burst=20 nodelay`).

### Law 2: Authentication & Parent SSO Contract
- **SSO Mechanism:** Authentication is delegated to the parent portal via JWT session cookie `ns_session_token` or `Authorization: Bearer <token>`.
- **Verification Rule:** Verification requires valid RS256 signature against parent JWKS endpoint and explicit claim verification:
  - `is_ns_verified: true`
  - Valid user identity bound to `sub` (UUID).
- **Redirect Contract:** If unauthenticated, expired, or unverified (`is_ns_verified == false`), the proxy/middleware must redirect with `302/307` to:
  `https://nayisamakhya.org/login?return_to=/matrimony/...`

### Law 3: Data Sovereignty & Database Isolation
- **Storage Engine:** PostgreSQL 15+ using native `pg` client with raw parameterized SQL.
- **Strict Prohibition:** Absolutely NO ORM layers (Prisma, Drizzle, TypeORM are prohibited) to eliminate leaky abstractions and ensure predictable query plans.
- **Schema Isolation:** Dedicated schema `matrimony_shared`. No access to parent portal tables.
- **Row-Level Security (RLS):** Mandatory RLS enabled on all tables using session context variables (`request.jwt.claim.sub` and `request.jwt.claim.role`).
- **Application Role:** Dedicated role `nsm_app_user` with `NOBYPASSRLS`.

### Law 4: Statutory DPDP Act (2023) Compliance & Cultural Invariants
- **Cryptographic Contact Masking:** Personally Identifiable Information (PII) including `phone`, `email`, `whatsapp`, and `door_address` must be stored as encrypted binary (`pgp_sym_encrypt`) using system-grade key rotation.
- **Bilateral Consent Unmasking:** PII is unmasked ONLY upon two-way mutual bilateral consent through the `interests` state machine (`REQUESTED` -> `ACCEPTED`).
- **Audit Immutability:** Append-only, tamper-evident `dpdp_consent_logs` table. Database triggers must explicitly reject any `UPDATE`, `DELETE`, or `TRUNCATE` operations.
- **Sagothra Exclusion Invariant:** Paternal Gothra matches are strictly forbidden and enforced directly at the database policy / query layer (`candidate.paternal_gothra != viewer.paternal_gothra`).

### Law 5: Sovereign Admin Isolation
- **Jurisdictional Sandboxing:** Sub-admin console at `/matrimony/nsm-admin` strictly sandboxed to District/Mandal jurisdiction.
- **Zero Parent Telemetry:** Complete isolation from root portal telemetry, audit trails, and parent portal financial records.
